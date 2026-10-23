import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  Product,
  CannabisLot,
  KratomBatch,
  Supplier,
  Customer,
  SaleOrder,
  StockMovement,
  KitchenOrder,
  AuditLog,
  ShopSettings,
  User,
  Expense,
  RawMaterialSource,
  Promotion,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SHOP_SETTINGS,
  INITIAL_SUPPLIERS,
  INITIAL_CANNABIS_LOTS,
  INITIAL_KRATOM_BATCHES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_RAW_MATERIAL_SOURCES,
  INITIAL_PROMOTIONS,
} from '../data/initialData';

/*
 * Supabase data layer.
 *
 * Every former Firestore collection is a Postgres table with the shape
 *   (id text primary key, data jsonb, created_at, updated_at)
 * — see supabase/migrations/001_init.sql. `data` holds the whole document,
 * exactly as it was stored in Firestore, so the app's TypeScript types are
 * unchanged.
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleDbError(error: unknown, operationType: OperationType, path: string | null) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error);
  console.error('Database Error: ', JSON.stringify({ error: message, operationType, path }));
}

export const COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  DEPARTMENTS: 'departments',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  PRODUCT_VARIANTS: 'product_variants',
  PRODUCT_BATCHES: 'product_batches',
  PRODUCT_LOTS: 'product_lots',
  INGREDIENTS: 'ingredients',
  RECIPES: 'recipes',
  RECIPE_ITEMS: 'recipe_items',
  PURCHASES: 'purchases',
  PURCHASE_ITEMS: 'purchase_items',
  SALES: 'sales',
  SALE_ITEMS: 'sale_items',
  PAYMENTS: 'payments',
  STOCK: 'stock',
  STOCK_MOVEMENTS: 'stock_movements',
  KITCHEN_ORDERS: 'kitchen_orders',
  KITCHEN_ORDER_ITEMS: 'kitchen_order_items',
  DISCOUNTS: 'discounts',
  PROMOTIONS: 'promotions',
  EXPENSES: 'expenses',
  DOCUMENTS: 'documents',
  ATTACHMENTS: 'attachments',
  AUDIT_LOGS: 'audit_logs',
  SETTINGS: 'settings',
  CANNABIS_PRODUCTS: 'cannabis_products',
  CANNABIS_LOTS: 'cannabis_lots',
  CANNABIS_DOCUMENTS: 'cannabis_documents',
  CANNABIS_MOVEMENTS: 'cannabis_movements',
  PRESCRIPTIONS: 'prescriptions',
  RAW_MATERIAL_SOURCES: 'raw_material_sources',
} as const;

type Row = { id: string; data: unknown };

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

/** Remove `undefined` values (JSON would drop them anyway; keeps payloads clean). */
function sanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize) as unknown as T;
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) cleaned[key] = sanitize(value);
    }
    return cleaned as T;
  }
  return obj;
}

const UPSERT_CHUNK = 500;
const PAGE_SIZE = 1000; // PostgREST default max rows per request

async function upsertRows(table: string, rows: Row[]) {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) throw error;
  }
}

async function upsertDoc(table: string, id: string, data: unknown) {
  await upsertRows(table, [{ id, data: sanitize(data) }]);
}

async function deleteDocs(table: string, ids: string[]) {
  for (let i = 0; i < ids.length; i += UPSERT_CHUNK) {
    const { error } = await supabase.from(table).delete().in('id', ids.slice(i, i + UPSERT_CHUNK));
    if (error) throw error;
  }
}

/** Fetch every row of a table, paging past the 1000-row API limit. */
export async function fetchAll<T>(table: string): Promise<{ id: string; data: T }[]> {
  const all: { id: string; data: T }[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('id, data')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all.push(...((data ?? []) as { id: string; data: T }[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Realtime subscriptions (replacement for Firestore onSnapshot)
// ---------------------------------------------------------------------------

let channelSeq = 0;

/**
 * Load a whole table, then keep it in sync via Supabase Realtime.
 * `onData` receives the full list every time something changes.
 * Returns an unsubscribe function.
 */
export function subscribeTable<T>(
  table: string,
  onData: (list: T[]) => void,
  onError: (err: unknown) => void
): () => void {
  const rows = new Map<string, T>();
  let loaded = false;
  let closed = false;
  // Changes that arrive before the initial load finishes are queued and
  // replayed afterwards so nothing is lost.
  const pending: RealtimePostgresChangesPayload<Row>[] = [];

  const emit = () => {
    if (!closed) onData(Array.from(rows.values()));
  };

  const apply = (payload: RealtimePostgresChangesPayload<Row>) => {
    if (payload.eventType === 'DELETE') {
      const oldId = (payload.old as Partial<Row>)?.id;
      if (oldId) rows.delete(oldId);
    } else {
      const row = payload.new as Row;
      if (row?.id) rows.set(row.id, row.data as T);
    }
  };

  const channel = supabase
    .channel(`table-${table}-${++channelSeq}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      const p = payload as RealtimePostgresChangesPayload<Row>;
      if (!loaded) {
        pending.push(p);
        return;
      }
      apply(p);
      emit();
    })
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(err ?? new Error(`Realtime ${status} on ${table}`));
      }
    });

  fetchAll<T>(table)
    .then((list) => {
      if (closed) return;
      list.forEach((r) => rows.set(r.id, r.data));
      loaded = true;
      pending.splice(0).forEach(apply);
      emit();
    })
    .catch(onError);

  return () => {
    closed = true;
    supabase.removeChannel(channel);
  };
}

/** Same as subscribeTable but for a single row (e.g. settings/default). */
export function subscribeDoc<T>(
  table: string,
  id: string,
  onData: (data: T | null) => void,
  onError: (err: unknown) => void
): () => void {
  let closed = false;

  const channel = supabase
    .channel(`doc-${table}-${id}-${++channelSeq}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `id=eq.${id}` },
      (payload) => {
        if (closed) return;
        const p = payload as RealtimePostgresChangesPayload<Row>;
        onData(p.eventType === 'DELETE' ? null : ((p.new as Row).data as T));
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(err ?? new Error(`Realtime ${status} on ${table}/${id}`));
      }
    });

  supabase
    .from(table)
    .select('data')
    .eq('id', id)
    .maybeSingle()
    .then(({ data, error }) => {
      if (closed) return;
      if (error) onError(error);
      else onData(data ? (data.data as T) : null);
    });

  return () => {
    closed = true;
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

const withIds = <T extends { id: string }>(items: T[]): Row[] =>
  items.map((item) => ({ id: item.id, data: sanitize(item) }));

/**
 * Seed the database with initial demonstration data if the products table is empty.
 */
export async function seedDbIfEmpty(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from(COLLECTIONS.PRODUCTS)
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    if ((count ?? 0) > 0) {
      console.log('Database already initialized with data.');
      return false;
    }

    console.log('Seeding initial database structure...');

    const categories = [
      { id: 'cat-cannabis', name: 'กัญชาทางการแพทย์ (Medical Cannabis)', type: 'cannabis' },
      { id: 'cat-kratom', name: 'กระท่อม/เครื่องดื่มต้ม (Kratom Drinks)', type: 'kratom' },
      { id: 'cat-food', name: 'อาหารเเละเครื่องดื่ม (Food & Kitchen)', type: 'food' },
      { id: 'cat-general', name: 'สินค้าทั่วไป (General Products)', type: 'general' },
    ];

    await Promise.all([
      upsertRows(COLLECTIONS.USERS, withIds(INITIAL_USERS)),
      upsertDoc(COLLECTIONS.SETTINGS, 'default', INITIAL_SHOP_SETTINGS),
      upsertRows(COLLECTIONS.SUPPLIERS, withIds(INITIAL_SUPPLIERS)),
      upsertRows(COLLECTIONS.CUSTOMERS, withIds(INITIAL_CUSTOMERS)),
      upsertRows(COLLECTIONS.CANNABIS_LOTS, withIds(INITIAL_CANNABIS_LOTS)),
      upsertRows(COLLECTIONS.PRODUCT_BATCHES, withIds(INITIAL_KRATOM_BATCHES)),
      upsertRows(COLLECTIONS.EXPENSES, withIds(INITIAL_EXPENSES)),
      upsertRows(COLLECTIONS.CATEGORIES, withIds(categories)),
      upsertRows(COLLECTIONS.ROLES, [
        {
          id: 'role-admin',
          data: {
            name: 'เจ้าของร้าน / ผู้จัดการ (Admin)',
            description: 'เข้าถึงได้ทุกระบบในร้าน',
            permissionIds: ['all'],
          },
        },
        {
          id: 'role-pharmacist',
          data: {
            name: 'เภสัชกร / แพทย์แผนไทย',
            description: 'ตรวจอายุ ประวัติผู้ป่วย เเละจ่ายกัญชาทางการแพทย์',
            permissionIds: ['cannabis_dispense', 'patient_records'],
          },
        },
      ]),
      upsertDoc(COLLECTIONS.CANNABIS_DOCUMENTS, 'doc-001', {
        title: 'ใบอนุญาตจำหน่ายสมุนไพรควบคุม (กัญชา)',
        docType: 'License',
        issueDate: '2025-01-01',
        expiryDate: '2026-12-31',
        fileUrl: '#',
      }),
      upsertDoc(COLLECTIONS.PRESCRIPTIONS, 'rx-001', {
        prescriptionNo: 'RX-2026-0089',
        patientName: 'คุณสมชาย เข็มทอง',
        doctorName: 'พท.ป. ณัฐวุฒิ สุขสวัสดิ์',
        licenseNo: 'พท.ป. 4812',
        diagnosis: 'อาการนอนไม่หลับเรื้อรังเเละปวดกล้ามเนื้อ',
        issueDate: '2026-08-01',
      }),
      upsertRows(COLLECTIONS.RAW_MATERIAL_SOURCES, withIds(INITIAL_RAW_MATERIAL_SOURCES)),
      upsertRows(COLLECTIONS.PROMOTIONS, withIds(INITIAL_PROMOTIONS)),
    ]);

    // Products last: the "is it seeded?" check looks at this table, so a
    // half-finished seed will be retried on the next load.
    await upsertRows(COLLECTIONS.PRODUCTS, withIds(INITIAL_PRODUCTS));

    console.log('Initial database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Entity helpers (same behaviour as the former Firestore helpers:
// errors are logged, not thrown)
// ---------------------------------------------------------------------------

async function safely(label: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err) {
    console.error(`Failed to ${label}:`, err);
  }
}

export const saveSaleToDb = (saleOrder: SaleOrder) =>
  safely('save sale', async () => {
    await upsertDoc(COLLECTIONS.SALES, saleOrder.id, saleOrder);
    await upsertRows(
      COLLECTIONS.SALE_ITEMS,
      saleOrder.items.map((item) => ({
        id: `${saleOrder.id}_${item.id}`,
        data: sanitize({ saleId: saleOrder.id, ...item }),
      }))
    );
  });

export const saveAuditLogToDb = (log: AuditLog) =>
  safely('save audit log', () => upsertDoc(COLLECTIONS.AUDIT_LOGS, log.id, log));

export const saveStockMovementToDb = (movement: StockMovement) =>
  safely('save stock movement', () => upsertDoc(COLLECTIONS.STOCK_MOVEMENTS, movement.id, movement));

export const saveProductToDb = (product: Product) =>
  safely('save product', () => upsertDoc(COLLECTIONS.PRODUCTS, product.id, product));

export const saveCustomerToDb = (customer: Customer) =>
  safely('save customer', () => upsertDoc(COLLECTIONS.CUSTOMERS, customer.id, customer));

export const saveSupplierToDb = (supplier: Supplier) =>
  safely('save supplier', () => upsertDoc(COLLECTIONS.SUPPLIERS, supplier.id, supplier));

export const saveCannabisLotToDb = (lot: CannabisLot) =>
  safely('save cannabis lot', () => upsertDoc(COLLECTIONS.CANNABIS_LOTS, lot.id, lot));

export const saveKratomBatchToDb = (batch: KratomBatch) =>
  safely('save kratom batch', () => upsertDoc(COLLECTIONS.PRODUCT_BATCHES, batch.id, batch));

export const saveKitchenOrderToDb = (order: KitchenOrder) =>
  safely('save kitchen order', () => upsertDoc(COLLECTIONS.KITCHEN_ORDERS, order.id, order));

export const saveShopSettingsToDb = (settings: ShopSettings) =>
  safely('save shop settings', () => upsertDoc(COLLECTIONS.SETTINGS, 'default', settings));

export const saveUserToDb = (user: User) =>
  safely('save user', () => upsertDoc(COLLECTIONS.USERS, user.id, user));

export const deleteProductFromDb = (productId: string) =>
  safely('delete product', () => deleteDocs(COLLECTIONS.PRODUCTS, [productId]));

export const deleteUserFromDb = (userId: string) =>
  safely('delete user', () => deleteDocs(COLLECTIONS.USERS, [userId]));

export const deleteSupplierFromDb = (supplierId: string) =>
  safely('delete supplier', () => deleteDocs(COLLECTIONS.SUPPLIERS, [supplierId]));

export const deleteCustomerFromDb = (customerId: string) =>
  safely('delete customer', () => deleteDocs(COLLECTIONS.CUSTOMERS, [customerId]));

export const saveExpenseToDb = (expense: Expense) =>
  safely('save expense', () => upsertDoc(COLLECTIONS.EXPENSES, expense.id, expense));

export const deleteExpenseFromDb = (expenseId: string) =>
  safely('delete expense', () => deleteDocs(COLLECTIONS.EXPENSES, [expenseId]));

export const saveRawMaterialSourceToDb = (source: RawMaterialSource) =>
  safely('save raw material source', () =>
    upsertDoc(COLLECTIONS.RAW_MATERIAL_SOURCES, source.id, source)
  );

export const deleteRawMaterialSourceFromDb = (sourceId: string) =>
  safely('delete raw material source', () =>
    deleteDocs(COLLECTIONS.RAW_MATERIAL_SOURCES, [sourceId])
  );

export const resetAllExpensesInDb = (expensesList: Expense[]) =>
  safely('delete expenses', () =>
    deleteDocs(
      COLLECTIONS.EXPENSES,
      expensesList.map((e) => e.id)
    )
  );

export const resetAllSalesInDb = (saleOrders: SaleOrder[]) =>
  safely('delete sales', async () => {
    await deleteDocs(
      COLLECTIONS.SALES,
      saleOrders.map((o) => o.id)
    );
    await deleteDocs(
      COLLECTIONS.SALE_ITEMS,
      saleOrders.flatMap((o) => (o.items ?? []).map((item) => `${o.id}_${item.id}`))
    );
  });

export const savePromotionToDb = (promo: Promotion) =>
  safely('save promotion', () => upsertDoc(COLLECTIONS.PROMOTIONS, promo.id, promo));

export const deletePromotionFromDb = (promoId: string) =>
  safely('delete promotion', () => deleteDocs(COLLECTIONS.PROMOTIONS, [promoId]));

export async function resetAllAccountingInDb(saleOrders: SaleOrder[], expensesList: Expense[]) {
  await Promise.all([resetAllSalesInDb(saleOrders), resetAllExpensesInDb(expensesList)]);
}
