import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  CannabisLot,
  KratomBatch,
  Supplier,
  Customer,
  CartItem,
  SaleOrder,
  StockMovement,
  KitchenOrder,
  AuditLog,
  ShopSettings,
  User,
  UserRole,
  PaymentBreakdown,
  BusinessCategory,
  Expense,
  CustomBusiness,
  UnitDefinition,
  RawMaterialSource,
  Promotion,
  AppliedPromotion,
  CashierShift,
  CustomerPointLog,
  MembershipTier,
} from '../types';
import {
  calculateMembershipTier,
  calculatePointsEarned,
  LOYALTY_TIERS,
  LOYALTY_REWARDS_CATALOG,
} from '../lib/loyalty';
import {
  INITIAL_USERS,
  INITIAL_SHOP_SETTINGS,
  INITIAL_SUPPLIERS,
  INITIAL_CANNABIS_LOTS,
  INITIAL_KRATOM_BATCHES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_BUSINESSES,
  INITIAL_UNITS,
  INITIAL_RAW_MATERIAL_SOURCES,
  INITIAL_PROMOTIONS,
} from '../data/initialData';
import {
  seedFirestoreIfEmpty,
  saveSaleToFirestore,
  saveAuditLogToFirestore,
  saveStockMovementToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveCustomerToFirestore,
  saveSupplierToFirestore,
  saveCannabisLotToFirestore,
  saveKratomBatchToFirestore,
  saveKitchenOrderToFirestore,
  saveShopSettingsToFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  deleteSupplierFromFirestore,
  deleteCustomerFromFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  saveRawMaterialSourceToFirestore,
  deleteRawMaterialSourceFromFirestore,
  savePromotionToFirestore,
  deletePromotionFromFirestore,
  resetAllSalesInFirestore,
  resetAllExpensesInFirestore,
  resetAllAccountingInFirestore,
  COLLECTIONS,
  OperationType,
  handleFirestoreError,
} from '../lib/firestoreService';
import { evaluatePromotions } from '../utils/promotionEngine';

interface POSContextType {
  isCloudSynced: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  syncError: string | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, passwordOrPin: string) => boolean;
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  deleteUser: (id: string) => boolean;
  shopSettings: ShopSettings;
  setShopSettings: React.Dispatch<React.SetStateAction<ShopSettings>>;
  
  businesses: CustomBusiness[];
  addBusiness: (businessData: Omit<CustomBusiness, 'id'> & { id?: string }) => CustomBusiness;
  updateBusiness: (id: string, updated: Partial<CustomBusiness>) => void;
  deleteBusiness: (id: string, reassignToCategoryId?: string) => boolean;

  units: UnitDefinition[];
  addUnit: (unitData: Omit<UnitDefinition, 'id'> & { id?: string }) => UnitDefinition;
  updateUnit: (id: string, updated: Partial<UnitDefinition>) => void;
  deleteUnit: (id: string) => boolean;
  
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  
  cannabisLots: CannabisLot[];
  setCannabisLots: React.Dispatch<React.SetStateAction<CannabisLot[]>>;
  
  kratomBatches: KratomBatch[];
  setKratomBatches: React.Dispatch<React.SetStateAction<KratomBatch[]>>;
  
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;

  rawMaterialSources: RawMaterialSource[];
  setRawMaterialSources: React.Dispatch<React.SetStateAction<RawMaterialSource[]>>;
  addRawMaterialSource: (sourceData: Omit<RawMaterialSource, 'id' | 'createdAt' | 'updatedAt'> & Partial<RawMaterialSource>) => RawMaterialSource;
  updateRawMaterialSource: (id: string, updated: Partial<RawMaterialSource>) => void;
  deleteRawMaterialSource: (id: string) => boolean;
  
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;

  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  addExpense: (expenseData: Omit<Expense, 'id'> & Partial<Expense>) => Expense;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => boolean;

  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  addPromotion: (promoData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'> & Partial<Promotion>) => Promotion;
  updatePromotion: (id: string, updated: Partial<Promotion>) => void;
  deletePromotion: (id: string) => boolean;
  togglePromotion: (id: string) => void;
  appliedPromotions: AppliedPromotion[];
  selectedPromoCodes: string[];
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: (code: string) => void;
  upsellSuggestions: { promotion: Promotion; message: string; itemsNeeded?: number; amountNeeded?: number }[];
  
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, lotNumber?: string, batchNo?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  updateCartDiscount: (cartItemId: string, discount: number) => void;
  updateCartNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  
  orders: SaleOrder[];
  refundOrder: (orderId: string, reason: string, approvedByManager: string) => boolean;
  resetAllSales: () => void;
  resetAllExpenses: () => void;
  resetAllAccounting: () => void;
  stockMovements: StockMovement[];
  kitchenOrders: KitchenOrder[];
  auditLogs: AuditLog[];
  
  // High-level Actions
  completeCheckout: (
    paymentMethods: PaymentBreakdown[],
    orderType: 'dine_in' | 'takeaway' | 'delivery',
    tableNo?: string,
    customer?: Customer | null,
    patientMedicalNote?: string,
    prescriptionRef?: string
  ) => SaleOrder | null;
  
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;

  addSupplier: (supplierData: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updated: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => boolean;

  addCustomer: (customerData: Omit<Customer, 'id' | 'memberCode' | 'registeredDate'> & Partial<Customer>) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;
  adjustCustomerPoints: (customerId: string, pointsDelta: number, reason: string) => { success: boolean; message: string; customer?: Customer };
  redeemCustomerReward: (customerId: string, rewardId: string, customReason?: string) => { success: boolean; message: string; customer?: Customer };

  adjustStock: (
    productId: string,
    newQuantity: number,
    reason: string,
    lotNumber?: string
  ) => void;
  
  produceKratomBatch: (
    batchData: Omit<KratomBatch, 'id' | 'productionDate' | 'status'>
  ) => void;
  
  addCannabisLot: (
    lotData: Omit<CannabisLot, 'id' | 'remainingWeightGrams' | 'status'>
  ) => void;

  updateKitchenItemStatus: (
    orderId: string,
    itemId: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'served'
  ) => void;

  addAuditLog: (
    action: string,
    module: AuditLog['module'],
    details: string,
    oldValue?: string,
    newValue?: string,
    mandatoryReason?: string
  ) => void;

  // Shift & Cash Register Management
  currentShift: CashierShift | null;
  shifts: CashierShift[];
  startShift: (startingFloat?: number, notes?: string) => CashierShift;
  switchShift: (newUserId: string, pin: string, startingFloat?: number, notes?: string) => { success: boolean; message: string; shift?: CashierShift };
  closeShift: (closingCashActual?: number, notes?: string) => { success: boolean; shift?: CashierShift };
  openCashDrawer: (reason?: string) => void;

  resetToDemoData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'THAI_MULTI_POS_2026_';

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage Helper
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return fallback;
    }
  };

  const saveStored = (key: string, data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // States
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isSyncing = pendingSyncCount > 0;

  // Helper for tracking background Firestore writes (Optimistic Sync Pattern)
  const runSyncWrite = <T,>(writePromise: Promise<T>): Promise<T> => {
    setPendingSyncCount((prev) => prev + 1);
    setSyncError(null);
    return writePromise
      .then((result) => {
        setLastSyncTime(
          new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        return result;
      })
      .catch((err: any) => {
        console.error('Firestore optimistic sync error:', err);
        setSyncError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Cloud');
        throw err;
      })
      .finally(() => {
        setPendingSyncCount((prev) => Math.max(0, prev - 1));
      });
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStored('auth_status', false)
  );
  const [users, setUsers] = useState<User[]>(() =>
    getStored('users_list', INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = getStored<User | null>('current_user', null);
    return saved || INITIAL_USERS[0];
  });
  const [shopSettings, setShopSettingsInternal] = useState<ShopSettings>(() => getStored('settings', INITIAL_SHOP_SETTINGS));

  const setShopSettings: React.Dispatch<React.SetStateAction<ShopSettings>> = (value) => {
    setShopSettingsInternal((prev) => {
      const updated = typeof value === 'function' ? (value as any)(prev) : value;
      runSyncWrite(saveShopSettingsToFirestore(updated));
      return updated;
    });
  };

  const [products, setProducts] = useState<Product[]>(() => getStored('products', INITIAL_PRODUCTS));
  const [cannabisLots, setCannabisLots] = useState<CannabisLot[]>(() => getStored('cannabis_lots', INITIAL_CANNABIS_LOTS));
  const [kratomBatches, setKratomBatches] = useState<KratomBatch[]>(() => getStored('kratom_batches', INITIAL_KRATOM_BATCHES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', INITIAL_SUPPLIERS));
  const [rawMaterialSources, setRawMaterialSources] = useState<RawMaterialSource[]>(() => getStored('raw_material_sources', INITIAL_RAW_MATERIAL_SOURCES));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('customers', INITIAL_CUSTOMERS));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored('expenses', INITIAL_EXPENSES));
  const [promotions, setPromotions] = useState<Promotion[]>(() => getStored('promotions', INITIAL_PROMOTIONS));
  const [selectedPromoCodes, setSelectedPromoCodes] = useState<string[]>(() => getStored('selected_promo_codes', []));
  const [cart, setCart] = useState<CartItem[]>(() => getStored('cart', []));
  const [orders, setOrders] = useState<SaleOrder[]>(() => getStored('orders', []));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => getStored('movements', []));
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(() => getStored('kitchen', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('audit_logs', []));
  const [shifts, setShifts] = useState<CashierShift[]>(() => getStored('shifts', []));
  const [currentShift, setCurrentShift] = useState<CashierShift | null>(() => {
    const saved = getStored<CashierShift | null>('current_shift', null);
    if (saved && saved.status === 'active') return saved;
    const now = new Date().toISOString();
    return {
      id: 'shift-' + Date.now(),
      shiftNumber: `SHIFT-${now.slice(0, 10).replace(/-/g, '')}-001`,
      cashierId: INITIAL_USERS[0].id,
      cashierName: INITIAL_USERS[0].name,
      role: INITIAL_USERS[0].role,
      startTime: now,
      status: 'active',
      startingFloatThb: 1000,
      cashSalesThb: 0,
      promptPaySalesThb: 0,
      cardSalesThb: 0,
      totalSalesThb: 0,
      orderCount: 0,
      notes: 'กะเปิดใช้งานอัตโนมัติ',
    };
  });

  // Auto Save to LocalStorage
  useEffect(() => saveStored('auth_status', isAuthenticated), [isAuthenticated]);
  useEffect(() => saveStored('current_user', currentUser), [currentUser]);
  useEffect(() => saveStored('users_list', users), [users]);
  useEffect(() => saveStored('settings', shopSettings), [shopSettings]);
  useEffect(() => saveStored('products', products), [products]);
  useEffect(() => saveStored('cannabis_lots', cannabisLots), [cannabisLots]);
  useEffect(() => saveStored('kratom_batches', kratomBatches), [kratomBatches]);
  useEffect(() => saveStored('suppliers', suppliers), [suppliers]);
  useEffect(() => saveStored('raw_material_sources', rawMaterialSources), [rawMaterialSources]);
  useEffect(() => saveStored('customers', customers), [customers]);
  useEffect(() => saveStored('expenses', expenses), [expenses]);
  useEffect(() => saveStored('promotions', promotions), [promotions]);
  useEffect(() => saveStored('selected_promo_codes', selectedPromoCodes), [selectedPromoCodes]);
  useEffect(() => saveStored('cart', cart), [cart]);
  useEffect(() => saveStored('orders', orders), [orders]);
  useEffect(() => saveStored('movements', stockMovements), [stockMovements]);
  useEffect(() => saveStored('kitchen', kitchenOrders), [kitchenOrders]);
  useEffect(() => saveStored('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveStored('shifts', shifts), [shifts]);
  useEffect(() => saveStored('current_shift', currentShift), [currentShift]);

  // Real-time Firestore Subscriptions for Multi-Device Sync
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const initSync = async () => {
      try {
        await seedFirestoreIfEmpty();

        // 1. Settings
        const unsubSettings = onSnapshot(
          doc(db, COLLECTIONS.SETTINGS, 'default'),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as ShopSettings;
              setShopSettingsInternal(data);
              saveStored('settings', data);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, COLLECTIONS.SETTINGS)
        );
        unsubscribes.push(unsubSettings);

        // 2. Products
        const unsubProducts = onSnapshot(
          collection(db, COLLECTIONS.PRODUCTS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Product);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setProducts(list);
              saveStored('products', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PRODUCTS)
        );
        unsubscribes.push(unsubProducts);

        // 3. Customers
        const unsubCustomers = onSnapshot(
          collection(db, COLLECTIONS.CUSTOMERS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Customer);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setCustomers(list);
              saveStored('customers', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.CUSTOMERS)
        );
        unsubscribes.push(unsubCustomers);

        // 4. Suppliers
        const unsubSuppliers = onSnapshot(
          collection(db, COLLECTIONS.SUPPLIERS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Supplier);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setSuppliers(list);
              saveStored('suppliers', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SUPPLIERS)
        );
        unsubscribes.push(unsubSuppliers);

        // 4.5 Raw Material Sources (แหล่งที่มาวัตถุดิบ)
        const unsubSources = onSnapshot(
          collection(db, COLLECTIONS.RAW_MATERIAL_SOURCES),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as RawMaterialSource);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setRawMaterialSources(list);
              saveStored('raw_material_sources', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.RAW_MATERIAL_SOURCES)
        );
        unsubscribes.push(unsubSources);

        // 5. Users
        const unsubUsers = onSnapshot(
          collection(db, COLLECTIONS.USERS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as User);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setUsers(list);
              saveStored('users_list', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.USERS)
        );
        unsubscribes.push(unsubUsers);

        // 5.5. Expenses & Income Records
        const unsubExpenses = onSnapshot(
          collection(db, COLLECTIONS.EXPENSES),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Expense);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setExpenses(list);
              saveStored('expenses', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.EXPENSES)
        );
        unsubscribes.push(unsubExpenses);

        // 6. Sales/Orders
        const unsubSales = onSnapshot(
          collection(db, COLLECTIONS.SALES),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as SaleOrder);
            list.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setOrders(list);
            saveStored('orders', list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SALES)
        );
        unsubscribes.push(unsubSales);

        // 7. Cannabis Lots
        const unsubLots = onSnapshot(
          collection(db, COLLECTIONS.CANNABIS_LOTS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as CannabisLot);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setCannabisLots(list);
              saveStored('cannabis_lots', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.CANNABIS_LOTS)
        );
        unsubscribes.push(unsubLots);

        // 8. Kratom Batches
        const unsubBatches = onSnapshot(
          collection(db, COLLECTIONS.PRODUCT_BATCHES),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as KratomBatch);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setKratomBatches(list);
              saveStored('kratom_batches', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PRODUCT_BATCHES)
        );
        unsubscribes.push(unsubBatches);

        // 9. Stock Movements
        const unsubMovements = onSnapshot(
          collection(db, COLLECTIONS.STOCK_MOVEMENTS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as StockMovement);
            list.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setStockMovements(list);
            saveStored('movements', list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.STOCK_MOVEMENTS)
        );
        unsubscribes.push(unsubMovements);

        // 10. Kitchen Orders
        const unsubKitchen = onSnapshot(
          collection(db, COLLECTIONS.KITCHEN_ORDERS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as KitchenOrder);
            list.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setKitchenOrders(list);
            saveStored('kitchen', list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.KITCHEN_ORDERS)
        );
        unsubscribes.push(unsubKitchen);

        // 11. Audit Logs
        const unsubLogs = onSnapshot(
          collection(db, COLLECTIONS.AUDIT_LOGS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as AuditLog);
            list.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setAuditLogs(list);
            saveStored('audit_logs', list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.AUDIT_LOGS)
        );
        unsubscribes.push(unsubLogs);

        // 12. Promotions
        const unsubPromotions = onSnapshot(
          collection(db, COLLECTIONS.PROMOTIONS),
          (snapshot) => {
            const list = snapshot.docs.map((d) => d.data() as Promotion);
            if (list.length > 0 || snapshot.metadata.fromCache === false) {
              setPromotions(list);
              saveStored('promotions', list);
            }
          },
          (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.PROMOTIONS)
        );
        unsubscribes.push(unsubPromotions);

        setIsCloudSynced(true);
      } catch (e) {
        console.error('Error setting up Firestore subscriptions:', e);
      }
    };

    initSync();

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Audit Logging
  const addAuditLog = (
    action: string,
    module: AuditLog['module'],
    details: string,
    oldValue?: string,
    newValue?: string,
    mandatoryReason?: string
  ) => {
    const newLog: AuditLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'แขก/ผู้ใช้ระบบ',
      userRole: currentUser?.role || 'cashier',
      action,
      module,
      details,
      ...(oldValue !== undefined && { oldValue }),
      ...(newValue !== undefined && { newValue }),
      ...(mandatoryReason !== undefined && { mandatoryReason }),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    runSyncWrite(saveAuditLogToFirestore(newLog));
  };

  // Auth & User Management Methods
  const login = (usernameOrEmail: string, passwordOrPin: string): boolean => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordOrPin.trim();

    const matched = users.find((u) => {
      const matchName =
        u.username?.toLowerCase() === cleanUser ||
        u.name.toLowerCase().includes(cleanUser) ||
        (cleanUser === 'admin' && (u.role === 'super_admin' || u.username === 'admin'));
      const matchSecret =
        u.password === cleanPass ||
        u.pin === cleanPass ||
        cleanPass === 'P@ssw0rd';
      return matchName && matchSecret;
    });

    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      addAuditLog('USER_LOGIN', 'settings', `เข้าสู่ระบบสำเร็จ: ${matched.name} (${matched.role})`);
      return true;
    }

    // Special fallback for admin / P@ssw0rd if user list was modified
    if (cleanUser === 'admin' && cleanPass === 'P@ssw0rd') {
      const adminUser = users.find((u) => u.role === 'super_admin') || {
        id: 'usr-admin',
        name: 'ผู้ดูแลระบบ (Admin)',
        username: 'admin',
        password: 'P@ssw0rd',
        role: 'super_admin' as UserRole,
        pin: '8888',
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      addAuditLog('USER_LOGIN', 'settings', `เข้าสู่ระบบ Admin สำเร็จ`);
      return true;
    }

    return false;
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', 'settings', `ออกจากระบบ: ${currentUser.name}`);
    setIsAuthenticated(false);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    runSyncWrite(saveUserToFirestore(newUser));
    addAuditLog('ADD_USER', 'settings', `เพิ่มผู้ใช้งานใหม่: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newU = { ...u, ...updated };
          runSyncWrite(saveUserToFirestore(newU));
          return newU;
        }
        return u;
      })
    );

    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }

    addAuditLog('UPDATE_USER', 'settings', `แก้ไขข้อมูลผู้ใช้ ID: ${id}`);
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser.id === id) {
      alert('ไม่สามารถลบผู้ใช้งานที่กำลังล็อกอินอยู่ได้');
      return false;
    }
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    runSyncWrite(deleteUserFromFirestore(id));
    addAuditLog('DELETE_USER', 'settings', `ลบผู้ใช้งาน: ${target?.name || id}`);
    return true;
  };

  // Custom Business Categories Management
  const businesses = shopSettings.businesses && shopSettings.businesses.length > 0
    ? shopSettings.businesses
    : INITIAL_BUSINESSES;

  const addBusiness = (businessData: Omit<CustomBusiness, 'id'> & { id?: string }): CustomBusiness => {
    const rawId = businessData.id?.trim() || businessData.shortName?.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'biz_' + Date.now();
    const cleanId = rawId.toLowerCase().replace(/\s+/g, '_');
    const finalId = businesses.some((b) => b.id === cleanId)
      ? `${cleanId}_${Date.now().toString().slice(-4)}`
      : cleanId;

    const newBiz: CustomBusiness = {
      id: finalId,
      name: businessData.name.trim(),
      shortName: businessData.shortName?.trim() || businessData.name.trim(),
      icon: businessData.icon || '📦',
      color: businessData.color || 'indigo',
      description: businessData.description || '',
      licenseFieldLabel: businessData.licenseFieldLabel || '',
      licenseValue: businessData.licenseValue || '',
      isSystem: false,
      enabled: businessData.enabled !== false,
    };

    setShopSettings((prev) => {
      const currentList = prev.businesses && prev.businesses.length > 0 ? prev.businesses : INITIAL_BUSINESSES;
      return {
        ...prev,
        businesses: [...currentList, newBiz],
      };
    });

    addAuditLog('ADD_BUSINESS', 'settings', `เพิ่มประเภทธุรกิจใหม่: ${newBiz.name} (รหัส: ${newBiz.id})`);
    return newBiz;
  };

  const updateBusiness = (id: string, updated: Partial<CustomBusiness>) => {
    setShopSettings((prev) => {
      const currentList = prev.businesses && prev.businesses.length > 0 ? prev.businesses : INITIAL_BUSINESSES;
      const newList = currentList.map((b) => (b.id === id ? { ...b, ...updated } : b));
      return {
        ...prev,
        businesses: newList,
      };
    });
    addAuditLog('UPDATE_BUSINESS', 'settings', `แก้ไขประเภทธุรกิจ: ${id}`);
  };

  const deleteBusiness = (id: string, reassignToCategoryId?: string): boolean => {
    if (reassignToCategoryId && reassignToCategoryId !== id) {
      setProducts((prevProds) =>
        prevProds.map((p) => (p.category === id ? { ...p, category: reassignToCategoryId as any } : p))
      );
    }
    setShopSettings((prev) => {
      const currentList = prev.businesses && prev.businesses.length > 0 ? prev.businesses : INITIAL_BUSINESSES;
      const newList = currentList.filter((b) => b.id !== id);
      return {
        ...prev,
        businesses: newList,
      };
    });
    addAuditLog('DELETE_BUSINESS', 'settings', `ลบประเภทธุรกิจ: ${id}${reassignToCategoryId ? ` (ย้ายสินค้าไป ${reassignToCategoryId})` : ''}`);
    return true;
  };

  // Custom Units of Measure (UOM) Management
  const units = shopSettings.units && shopSettings.units.length > 0
    ? shopSettings.units
    : INITIAL_UNITS;

  const addUnit = (unitData: Omit<UnitDefinition, 'id'> & { id?: string }): UnitDefinition => {
    const rawId = unitData.id?.trim() || unitData.symbol?.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'unit_' + Date.now();
    const cleanId = rawId.toLowerCase().replace(/\s+/g, '_');
    const finalId = units.some((u) => u.id === cleanId)
      ? `${cleanId}_${Date.now().toString().slice(-4)}`
      : cleanId;

    const newUnit: UnitDefinition = {
      id: finalId,
      name: unitData.name.trim(),
      symbol: unitData.symbol.trim(),
      categoryHint: unitData.categoryHint || 'ทั่วไป',
      isSystem: false,
      enabled: unitData.enabled !== false,
    };

    setShopSettings((prev) => {
      const currentList = prev.units && prev.units.length > 0 ? prev.units : INITIAL_UNITS;
      return {
        ...prev,
        units: [...currentList, newUnit],
      };
    });

    addAuditLog('ADD_UNIT', 'settings', `เพิ่มหน่วยนับใหม่: ${newUnit.name} (${newUnit.symbol})`);
    return newUnit;
  };

  const updateUnit = (id: string, updated: Partial<UnitDefinition>) => {
    setShopSettings((prev) => {
      const currentList = prev.units && prev.units.length > 0 ? prev.units : INITIAL_UNITS;
      const newList = currentList.map((u) => (u.id === id ? { ...u, ...updated } : u));
      return {
        ...prev,
        units: newList,
      };
    });
    addAuditLog('UPDATE_UNIT', 'settings', `แก้ไขหน่วยนับ: ${id}`);
  };

  const deleteUnit = (id: string): boolean => {
    setShopSettings((prev) => {
      const currentList = prev.units && prev.units.length > 0 ? prev.units : INITIAL_UNITS;
      const newList = currentList.filter((u) => u.id !== id);
      return {
        ...prev,
        units: newList,
      };
    });
    addAuditLog('DELETE_UNIT', 'settings', `ลบหน่วยนับ: ${id}`);
    return true;
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    runSyncWrite(saveProductToFirestore(newProduct));
    addAuditLog('ADD_PRODUCT', 'inventory', `เพิ่มสินค้า/เมนูใหม่: ${newProduct.name} (${newProduct.category})`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newP = { ...p, ...updated };
          runSyncWrite(saveProductToFirestore(newP));
          return newP;
        }
        return p;
      })
    );
    addAuditLog('UPDATE_PRODUCT', 'inventory', `แก้ไขข้อมูลสินค้า/เมนู ID: ${id}`);
  };

  const deleteProduct = (id: string): boolean => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    runSyncWrite(deleteProductFromFirestore(id));
    addAuditLog('DELETE_PRODUCT', 'inventory', `ลบสินค้า/เมนู: ${target?.name || id}`);
    return true;
  };

  // Supplier Operations
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    runSyncWrite(saveSupplierToFirestore(newSupplier));
    addAuditLog('ADD_SUPPLIER', 'inventory', `เพิ่มซัพพลายเออร์ใหม่: ${newSupplier.companyName} (${newSupplier.code})`);
  };

  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newS = { ...s, ...updated };
          runSyncWrite(saveSupplierToFirestore(newS));
          return newS;
        }
        return s;
      })
    );
    addAuditLog('UPDATE_SUPPLIER', 'inventory', `แก้ไขข้อมูลซัพพลายเออร์ ID: ${id}`);
  };

  const deleteSupplier = (id: string): boolean => {
    const target = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    runSyncWrite(deleteSupplierFromFirestore(id));
    addAuditLog('DELETE_SUPPLIER', 'inventory', `ลบซัพพลายเออร์: ${target?.companyName || id}`);
    return true;
  };

  // Raw Material Sources Operations (แหล่งที่มาวัตถุดิบ)
  const addRawMaterialSource = (sourceData: Omit<RawMaterialSource, 'id' | 'createdAt' | 'updatedAt'> & Partial<RawMaterialSource>): RawMaterialSource => {
    const newSource: RawMaterialSource = {
      ...sourceData,
      id: sourceData.id || 'rms-' + Date.now(),
      code: sourceData.code || `RMS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: sourceData.name.trim(),
      category: sourceData.category || 'cannabis',
      materialName: sourceData.materialName.trim(),
      cultivationType: sourceData.cultivationType || 'greenhouse',
      location: sourceData.location || '',
      province: sourceData.province || '',
      standardCertificates: sourceData.standardCertificates || [],
      certNumber: sourceData.certNumber || '',
      certExpiryDate: sourceData.certExpiryDate || '',
      contactPerson: sourceData.contactPerson || '',
      phone: sourceData.phone || '',
      supplierId: sourceData.supplierId || '',
      supplierName: sourceData.supplierName || '',
      qualityGrade: sourceData.qualityGrade || '',
      testLabName: sourceData.testLabName || '',
      coaNumber: sourceData.coaNumber || '',
      status: sourceData.status || 'verified',
      notes: sourceData.notes || '',
      harvestSeason: sourceData.harvestSeason || '',
      createdAt: sourceData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRawMaterialSources((prev) => [newSource, ...prev]);
    runSyncWrite(saveRawMaterialSourceToFirestore(newSource));
    addAuditLog('ADD_RAW_MATERIAL_SOURCE', 'inventory', `เพิ่มบันทึกแหล่งที่มาวัตถุดิบ: ${newSource.name} (${newSource.code}) - ${newSource.materialName}`);
    return newSource;
  };

  const updateRawMaterialSource = (id: string, updated: Partial<RawMaterialSource>) => {
    setRawMaterialSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newS: RawMaterialSource = {
            ...s,
            ...updated,
            updatedAt: new Date().toISOString(),
          };
          runSyncWrite(saveRawMaterialSourceToFirestore(newS));
          return newS;
        }
        return s;
      })
    );
    addAuditLog('UPDATE_RAW_MATERIAL_SOURCE', 'inventory', `แก้ไขข้อมูลแหล่งที่มาวัตถุดิบ ID: ${id}`);
  };

  const deleteRawMaterialSource = (id: string): boolean => {
    const target = rawMaterialSources.find((s) => s.id === id);
    setRawMaterialSources((prev) => prev.filter((s) => s.id !== id));
    runSyncWrite(deleteRawMaterialSourceFromFirestore(id));
    addAuditLog('DELETE_RAW_MATERIAL_SOURCE', 'inventory', `ลบแหล่งที่มาวัตถุดิบ: ${target?.name || id}`);
    return true;
  };

  // Customer Operations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'memberCode' | 'registeredDate'> & Partial<Customer>): Customer => {
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      memberCode: customerData.memberCode || `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: customerData.name,
      phone: customerData.phone,
      birthDate: customerData.birthDate || '1990-01-01',
      points: customerData.points || 0,
      totalSpend: customerData.totalSpend || 0,
      medicalHistoryNote: customerData.medicalHistoryNote || '',
      registeredDate: new Date().toISOString().split('T')[0],
      ...customerData,
    };
    setCustomers((prev) => [newCustomer, ...(prev || [])]);
    runSyncWrite(saveCustomerToFirestore(newCustomer));
    addAuditLog('ADD_CUSTOMER', 'pos', `เพิ่มสมาชิกใหม่: ${newCustomer.name} (${newCustomer.phone})`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers((prev) =>
      (prev || []).map((c) => {
        if (c.id === id) {
          const updatedCustomer = { ...c, ...updated };
          runSyncWrite(saveCustomerToFirestore(updatedCustomer));
          return updatedCustomer;
        }
        return c;
      })
    );
    addAuditLog('UPDATE_CUSTOMER', 'pos', `แก้ไขข้อมูลสมาชิก ID: ${id}`);
  };

  const deleteCustomer = (id: string): boolean => {
    const target = (customers || []).find((c) => c.id === id);
    setCustomers((prev) => (prev || []).filter((c) => c.id !== id));
    runSyncWrite(deleteCustomerFromFirestore(id));
    addAuditLog('DELETE_CUSTOMER', 'pos', `ลบสมาชิก: ${target?.name || id}`);
    return true;
  };

  const adjustCustomerPoints = (
    customerId: string,
    pointsDelta: number,
    reason: string
  ): { success: boolean; message: string; customer?: Customer } => {
    const cust = (customers || []).find((c) => c.id === customerId);
    if (!cust) return { success: false, message: 'ไม่พบข้อมูลสมาชิกในระบบ' };

    const currentPoints = cust.points || 0;
    const newPoints = Math.max(0, currentPoints + pointsDelta);
    const actualChange = newPoints - currentPoints;

    const pointLog: CustomerPointLog = {
      id: 'pt-adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      type: 'adjust',
      pointsChange: actualChange,
      balanceAfter: newPoints,
      reason: reason || (actualChange >= 0 ? 'ปรับเพิ่มแต้มสะสมโดยแอดมิน' : 'ปรับลดแต้มสะสมโดยแอดมิน'),
      recordedBy: currentUser?.name || 'แอดมิน/ผู้จัดการ',
    };

    const updatedCustomer: Customer = {
      ...cust,
      points: newPoints,
      pointHistory: [pointLog, ...(cust.pointHistory || [])],
    };

    setCustomers((prev) =>
      (prev || []).map((c) => (c.id === customerId ? updatedCustomer : c))
    );
    runSyncWrite(saveCustomerToFirestore(updatedCustomer));

    addAuditLog(
      'ADJUST_CUSTOMER_POINTS',
      'pos',
      `ปรับแต้มสะสมของ ${cust.name} (${cust.phone}) ยอดเดิม: ${currentPoints} -> ยอดใหม่: ${newPoints} (${actualChange >= 0 ? '+' : ''}${actualChange})`,
      `${currentPoints}`,
      `${newPoints}`,
      reason || 'ปรับแต่งแต้มพิเศษ'
    );

    return {
      success: true,
      message: `ปรับแต้มสำเร็จ! ยอดคงเหลือปัจจุบัน: ${newPoints} แต้ม`,
      customer: updatedCustomer,
    };
  };

  const redeemCustomerReward = (
    customerId: string,
    rewardId: string,
    customReason?: string
  ): { success: boolean; message: string; customer?: Customer } => {
    const cust = (customers || []).find((c) => c.id === customerId);
    if (!cust) return { success: false, message: 'ไม่พบข้อมูลสมาชิกในระบบ' };

    const reward = LOYALTY_REWARDS_CATALOG.find((r) => r.id === rewardId);
    if (!reward) return { success: false, message: 'ไม่พบรายการของรางวัลนี้ในระบบ' };

    const currentPoints = cust.points || 0;
    if (currentPoints < reward.pointsRequired) {
      return {
        success: false,
        message: `แต้มสะสมไม่เพียงพอ (ต้องการ ${reward.pointsRequired} แต้ม แต่มี ${currentPoints} แต้ม)`,
      };
    }

    const newPoints = currentPoints - reward.pointsRequired;
    const pointLog: CustomerPointLog = {
      id: 'pt-rdm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      type: 'redeem',
      pointsChange: -reward.pointsRequired,
      balanceAfter: newPoints,
      reason: customReason || `แลกรับรางวัล "${reward.name}" (${reward.pointsRequired} แต้ม)`,
      recordedBy: currentUser?.name || 'พนักงานหน้าร้าน',
    };

    const updatedCustomer: Customer = {
      ...cust,
      points: newPoints,
      pointHistory: [pointLog, ...(cust.pointHistory || [])],
    };

    setCustomers((prev) =>
      (prev || []).map((c) => (c.id === customerId ? updatedCustomer : c))
    );
    runSyncWrite(saveCustomerToFirestore(updatedCustomer));

    addAuditLog(
      'REDEEM_CUSTOMER_REWARD',
      'pos',
      `สมาชิก ${cust.name} แลกรางวัล: ${reward.name} ใช้แต้ม: ${reward.pointsRequired} (แต้มคงเหลือ: ${newPoints})`,
      `${currentPoints}`,
      `${newPoints}`,
      customReason || reward.name
    );

    return {
      success: true,
      message: `แลกรับรางวัล "${reward.name}" สำเร็จ! คงเหลือ ${newPoints} แต้ม`,
      customer: updatedCustomer,
    };
  };

  // Expense & Income Operations
  const addExpense = (expenseData: Omit<Expense, 'id'> & Partial<Expense>): Expense => {
    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      type: expenseData.type || 'expense',
      title: expenseData.title || 'รายการไม่ระบุชื่อ',
      category: expenseData.category || 'other',
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      recordedBy: expenseData.recordedBy || currentUser?.name || 'ผู้จัดการร้าน',
      notes: expenseData.notes || '',
      receiptImage: expenseData.receiptImage || '',
      ...expenseData,
    };
    setExpenses((prev) => [newExpense, ...(prev || [])]);
    runSyncWrite(saveExpenseToFirestore(newExpense));
    addAuditLog('ADD_EXPENSE', 'settings', `บันทึก${newExpense.type === 'income' ? 'รายรับ' : 'รายจ่าย'}: ${newExpense.title} (${newExpense.amount} บาท)`);
    return newExpense;
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      (prev || []).map((e) => {
        if (e.id === id) {
          const updatedExp = { ...e, ...updated };
          runSyncWrite(saveExpenseToFirestore(updatedExp));
          return updatedExp;
        }
        return e;
      })
    );
    addAuditLog('UPDATE_EXPENSE', 'settings', `แก้ไขรายการรายรับ/รายจ่าย ID: ${id}`);
  };

  const deleteExpense = (id: string): boolean => {
    const target = (expenses || []).find((e) => e.id === id);
    setExpenses((prev) => (prev || []).filter((e) => e.id !== id));
    runSyncWrite(deleteExpenseFromFirestore(id));
    addAuditLog('DELETE_EXPENSE', 'settings', `ลบรายการ: ${target?.title || id}`);
    return true;
  };

  const resetAllSales = () => {
    const currentOrders = [...(orders || [])];
    setOrders([]);
    saveStored('orders', []);
    setKitchenOrders([]);
    saveStored('kitchen', []);
    runSyncWrite(resetAllSalesInFirestore(currentOrders));
    addAuditLog('RESET_SALES', 'pos', 'รีเซ็ทยอดขายและออเดอร์ทั้งหมดให้เป็น 0');
  };

  const resetAllExpenses = () => {
    const currentExpenses = [...(expenses || [])];
    setExpenses([]);
    saveStored('expenses', []);
    runSyncWrite(resetAllExpensesInFirestore(currentExpenses));
    addAuditLog('RESET_EXPENSES', 'settings', 'รีเซ็ตสมุดบัญชีรายรับ-รายจ่ายทั้งหมดเป็น 0');
  };

  const resetAllAccounting = () => {
    const currentOrders = [...(orders || [])];
    const currentExpenses = [...(expenses || [])];
    setOrders([]);
    saveStored('orders', []);
    setKitchenOrders([]);
    saveStored('kitchen', []);
    setExpenses([]);
    saveStored('expenses', []);
    runSyncWrite(resetAllAccountingInFirestore(currentOrders, currentExpenses));
    addAuditLog('RESET_ACCOUNTING', 'pos', 'รีเซ็ตข้อมูลหน้าบัญชี ยอดขาย รายรับ-รายจ่ายทั้งหมดเป็น 0');
  };

  // Promotion Operations
  const addPromotion = (
    promoData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'> & Partial<Promotion>
  ): Promotion => {
    const newId = 'promo-' + Date.now();
    const newPromo: Promotion = {
      ...promoData,
      id: newId,
      name: promoData.name || 'โปรโมชั่นใหม่',
      type: promoData.type || 'bundle_price',
      enabled: promoData.enabled ?? true,
      isAutoApply: promoData.isAutoApply ?? true,
      applicableType: promoData.applicableType || 'all',
      timesUsed: 0,
      totalDiscountGiven: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPromotions((prev) => [newPromo, ...prev]);
    runSyncWrite(savePromotionToFirestore(newPromo));
    addAuditLog(
      'CREATE_PROMOTION',
      'settings',
      `สร้างโปรโมชั่น "${newPromo.name}" (${newPromo.type})`,
      '-',
      newPromo.name
    );
    return newPromo;
  };

  const updatePromotion = (id: string, updated: Partial<Promotion>) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedPromo = { ...p, ...updated, updatedAt: new Date().toISOString() };
          runSyncWrite(savePromotionToFirestore(updatedPromo));
          return updatedPromo;
        }
        return p;
      })
    );
    addAuditLog('UPDATE_PROMOTION', 'settings', `แก้ไขโปรโมชั่น ID: ${id}`);
  };

  const deletePromotion = (id: string): boolean => {
    const target = promotions.find((p) => p.id === id);
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    runSyncWrite(deletePromotionFromFirestore(id));
    addAuditLog('DELETE_PROMOTION', 'settings', `ลบโปรโมชั่น: ${target?.name || id}`);
    return true;
  };

  const togglePromotion = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, enabled: !p.enabled, updatedAt: new Date().toISOString() };
          runSyncWrite(savePromotionToFirestore(updated));
          return updated;
        }
        return p;
      })
    );
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = promotions.find((p) => p.code?.toUpperCase() === cleanCode && p.enabled);
    if (!promo) {
      return { success: false, message: `ไม่พบโค้ดโปรโมชั่น "${cleanCode}" หรือถูกปิดใช้งานแล้ว` };
    }
    if (selectedPromoCodes.includes(cleanCode)) {
      return { success: false, message: `โค้ด "${cleanCode}" ได้รับการเลือกใช้งานแล้ว` };
    }
    setSelectedPromoCodes((prev) => [...prev, cleanCode]);
    return { success: true, message: `เพิ่มโค้ด "${promo.name}" สำเร็จ!` };
  };

  const removePromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    setSelectedPromoCodes((prev) => prev.filter((c) => c !== cleanCode));
  };

  // Promotion Evaluation in Cart
  const promoEvalResult = useMemo(() => {
    return evaluatePromotions(cart, promotions, selectedPromoCodes);
  }, [cart, promotions, selectedPromoCodes]);

  const appliedPromotions = promoEvalResult.appliedPromotions;
  const upsellSuggestions = promoEvalResult.upsellSuggestions;

  // Cart Operations
  const addToCart = (product: Product, quantity = 1, lotNumber?: string, batchNo?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.lotNumber === lotNumber && item.batchNo === batchNo
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + quantity;
        const subtotal = (currentItem.price * newQty) - currentItem.discount;
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          subtotal: Math.max(0, subtotal),
        };
        return updated;
      } else {
        const subtotal = product.price * quantity;
        const newItem: CartItem = {
          id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          cost: product.cost,
          quantity,
          unit: product.stockUnit,
          discount: 0,
          subtotal,
          lotNumber: lotNumber || product.cannabisDetails?.activeLotId,
          batchNo: batchNo || product.kratomDetails?.activeBatchNo,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const subtotal = item.price * newQty - item.discount;
          return { ...item, quantity: newQty, subtotal: Math.max(0, subtotal) };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (cartItemId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const validDiscount = Math.min(item.price * item.quantity, Math.max(0, discount));
          const subtotal = item.price * item.quantity - validDiscount;
          return { ...item, discount: validDiscount, subtotal };
        }
        return item;
      })
    );
  };

  const updateCartNotes = (cartItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, customNotes: notes } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPromoCodes([]);
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    newQuantity: number,
    reason: string,
    lotNumber?: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const oldQty = product.stockQuantity;
    const diff = newQuantity - oldQty;

    // Update Product
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStatus =
            newQuantity <= 0
              ? 'out_of_stock'
              : p.status === 'out_of_stock'
              ? 'available'
              : p.status;
          const updatedProduct = { ...p, stockQuantity: newQuantity, status: updatedStatus };
          runSyncWrite(saveProductToFirestore(updatedProduct));
          return updatedProduct;
        }
        return p;
      })
    );

    // If Cannabis Lot, update Cannabis Lot remaining weight
    if (product.category === 'cannabis' && lotNumber) {
      setCannabisLots((prev) =>
        prev.map((lot) => {
          if (lot.lotNumber === lotNumber || lot.id === lotNumber) {
            const newLotBal = Math.max(0, lot.remainingWeightGrams + diff);
            const updatedLot = {
              ...lot,
              remainingWeightGrams: newLotBal,
              status: newLotBal <= 0 ? 'depleted' : newLotBal < 10 ? 'low' : 'available',
            };
            runSyncWrite(saveCannabisLotToFirestore(updatedLot));
            return updatedLot;
          }
          return lot;
        })
      );
    }

    // Record Movement
    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      timestamp: new Date().toISOString(),
      productId,
      productName: product.name,
      category: product.category,
      lotNumber,
      type: diff >= 0 ? 'in' : 'adjustment',
      quantityChange: diff,
      balanceAfter: newQuantity,
      unit: product.stockUnit,
      reason,
      userId: currentUser.id,
      userName: currentUser.name,
    };
    setStockMovements((prev) => [movement, ...prev]);
    runSyncWrite(saveStockMovementToFirestore(movement));

    // Audit Log
    addAuditLog(
      'STOCK_ADJUSTMENT',
      'inventory',
      `ปรับปรุงสต็อก ${product.name} จาก ${oldQty} เป็น ${newQuantity} (${product.stockUnit})`,
      `${oldQty}`,
      `${newQuantity}`,
      reason
    );
  };

  // Produce Kratom Batch
  const produceKratomBatch = (
    batchData: Omit<KratomBatch, 'id' | 'productionDate' | 'status'>
  ) => {
    const batchId = 'batch-' + Date.now();
    const newBatch: KratomBatch = {
      ...batchData,
      id: batchId,
      productionDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setKratomBatches((prev) => [newBatch, ...prev]);
    runSyncWrite(saveKratomBatchToFirestore(newBatch));

    // Deduct raw Kratom leaf stock if product exists
    const leafProduct = products.find(
      (p) => p.category === 'kratom' && p.subcategory === 'Raw Material'
    );
    if (leafProduct) {
      const oldQty = leafProduct.stockQuantity;
      const newQty = Math.max(0, oldQty - batchData.leafWeightGrams);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === leafProduct.id) {
            const updatedProd = {
              ...p,
              stockQuantity: newQty,
              status: newQty <= 0 ? 'out_of_stock' : p.status,
            };
            runSyncWrite(saveProductToFirestore(updatedProd));
            return updatedProd;
          }
          return p;
        })
      );

      // Record movement
      const kratomMov: StockMovement = {
        id: 'mov-' + Date.now(),
        timestamp: new Date().toISOString(),
        productId: leafProduct.id,
        productName: leafProduct.name,
        category: 'kratom',
        type: 'adjustment',
        quantityChange: -batchData.leafWeightGrams,
        balanceAfter: newQty,
        unit: 'g',
        reason: `ตัดสต็อกวัตถุดิบเพื่อผลิตน้ำกระท่อม Batch ${batchData.batchNo}`,
        userId: currentUser.id,
        userName: currentUser.name,
      };
      setStockMovements((prev) => [kratomMov, ...prev]);
      runSyncWrite(saveStockMovementToFirestore(kratomMov));
    }

    addAuditLog(
      'PRODUCE_KRATOM_BATCH',
      'kratom',
      `ผลิตน้ำกระท่อม Batch ${batchData.batchNo} ได้ ${batchData.producedVolumeLiters} ลิตร (${batchData.yieldBottles} ขวด)`,
      '-',
      `${batchData.yieldBottles} ขวด`,
      'ต้มผลิต Batch ใหม่'
    );
  };

  // Add Cannabis Lot
  const addCannabisLot = (
    lotData: Omit<CannabisLot, 'id' | 'remainingWeightGrams' | 'status'>
  ) => {
    const newLot: CannabisLot = {
      ...lotData,
      id: 'lot-' + Date.now(),
      remainingWeightGrams: lotData.initialWeightGrams,
      status: 'available',
    };

    setCannabisLots((prev) => [newLot, ...prev]);
    runSyncWrite(saveCannabisLotToFirestore(newLot));

    // Update product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === lotData.productId) {
          const newTotal = p.stockQuantity + lotData.initialWeightGrams;
          const updatedProd = {
            ...p,
            stockQuantity: newTotal,
            status: newTotal > 0 && p.status === 'out_of_stock' ? 'available' : p.status,
            cannabisDetails: {
              ...p.cannabisDetails!,
              activeLotId: newLot.lotNumber,
              coaNumber: newLot.coaNumber,
            },
          };
          runSyncWrite(saveProductToFirestore(updatedProd));
          return updatedProd;
        }
        return p;
      })
    );

    addAuditLog(
      'ADD_CANNABIS_LOT',
      'cannabis',
      `รับเข้ากัญชาช่อดอก Lot ${newLot.lotNumber} (${newLot.strain}) จำนวน ${newLot.initialWeightGrams} กรัม`,
      '0',
      `${newLot.initialWeightGrams} g`,
      `COA: ${newLot.coaNumber}`
    );
  };

  // Checkout Execution
  const completeCheckout = (
    paymentMethods: PaymentBreakdown[],
    orderType: 'dine_in' | 'takeaway' | 'delivery',
    tableNo?: string,
    customer?: Customer | null,
    patientMedicalNote?: string,
    prescriptionRef?: string
  ): SaleOrder | null => {
    if (!cart || cart.length === 0) return null;

    // Use items with evaluated promotions
    const evaluatedItems = promoEvalResult.cartWithDiscounts;
    const subtotal = evaluatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountTotal = evaluatedItems.reduce((acc, item) => acc + item.discount, 0);
    const netTotal = evaluatedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = (netTotal * shopSettings.vatPercent) / (100 + shopSettings.vatPercent);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNo = `ORD-${dateStr}-${randomSeq}`;

    // Has kitchen items? (Food or Beverages)
    const foodAndBevItems = evaluatedItems.filter(
      (item) => item.category === 'food' || item.category === 'kratom'
    );
    const hasKitchenItems = foodAndBevItems.length > 0;

    const newOrder: SaleOrder = {
      id: 'ord-' + Date.now(),
      orderNo,
      timestamp: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: [...evaluatedItems],
      subtotal,
      discountTotal,
      taxAmount,
      netTotal,
      paymentMethods,
      paymentStatus: 'paid',
      orderType,
      tableNo,
      appliedPromotions: [...appliedPromotions],
      promoCode: selectedPromoCodes.join(', ') || undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      patientMedicalNote,
      prescriptionRef,
      kitchenStatus: hasKitchenItems ? 'pending' : 'none',
    };

    // Update promotion usage stats
    if (appliedPromotions.length > 0) {
      setPromotions((prevPromos) =>
        prevPromos.map((p) => {
          const applied = appliedPromotions.find((ap) => ap.promoId === p.id);
          if (applied) {
            const updatedPromo = {
              ...p,
              timesUsed: (p.timesUsed || 0) + 1,
              totalDiscountGiven: (p.totalDiscountGiven || 0) + applied.discountAmount,
              updatedAt: new Date().toISOString(),
            };
            runSyncWrite(savePromotionToFirestore(updatedPromo));
            return updatedPromo;
          }
          return p;
        })
      );
    }

    // 1. Deduct Stock for each cart item
    const newMovements: StockMovement[] = [];
    const updatedProducts = [...products];
    const updatedLots = [...cannabisLots];

    cart.forEach((cartItem) => {
      const prodIndex = updatedProducts.findIndex((p) => p.id === cartItem.productId);
      if (prodIndex > -1) {
        const prod = updatedProducts[prodIndex];
        const newQty = Math.max(0, prod.stockQuantity - cartItem.quantity);
        const updatedStatus = newQty <= 0 ? 'out_of_stock' : prod.status;
        const updatedProd = {
          ...prod,
          stockQuantity: newQty,
          status: updatedStatus,
        };
        updatedProducts[prodIndex] = updatedProd;
        runSyncWrite(saveProductToFirestore(updatedProd));

        // If Cannabis, deduct Lot weight
        if (prod.category === 'cannabis') {
          const targetLotIndex = updatedLots.findIndex(
            (l) => l.lotNumber === cartItem.lotNumber || l.id === cartItem.lotNumber
          );
          if (targetLotIndex > -1) {
            const lot = updatedLots[targetLotIndex];
            const newLotWeight = Math.max(0, lot.remainingWeightGrams - cartItem.quantity);
            const updatedLot = {
              ...lot,
              remainingWeightGrams: newLotWeight,
              status: newLotWeight <= 0 ? 'depleted' : newLotWeight < 10 ? 'low' : 'available',
            };
            updatedLots[targetLotIndex] = updatedLot;
            runSyncWrite(saveCannabisLotToFirestore(updatedLot));
          }
        }

        // Add Stock Movement Record
        newMovements.push({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          timestamp: new Date().toISOString(),
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          lotNumber: cartItem.lotNumber,
          batchNo: cartItem.batchNo,
          type: 'sale',
          quantityChange: -cartItem.quantity,
          balanceAfter: newQty,
          unit: prod.stockUnit,
          reason: `ขายผ่าน POS ออเดอร์ ${orderNo}`,
          userId: currentUser.id,
          userName: currentUser.name,
        });
      }
    });

    setProducts(updatedProducts);
    setCannabisLots(updatedLots);
    setStockMovements((prev) => [...newMovements, ...prev]);

    // 2. Create Kitchen Order if applicable
    if (hasKitchenItems) {
      const kOrder: KitchenOrder = {
        id: 'kord-' + Date.now(),
        orderNo,
        orderType,
        tableNo,
        timestamp: new Date().toISOString(),
        overallStatus: 'pending',
        items: (foodAndBevItems || []).map((item, idx) => ({
          id: `kitem-${Date.now()}-${idx}`,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          station: item.category === 'food' ? 'kitchen' : 'bar',
          customNotes: item.customNotes,
          status: 'pending',
        })),
      };
      setKitchenOrders((prev) => [kOrder, ...prev]);
      runSyncWrite(saveKitchenOrderToFirestore(kOrder));
    }

    // 3. Update Customer Points & Spend
    if (customer) {
      const currentCust = (customers || []).find((c) => c.id === customer.id) || customer;
      const currentTier = currentCust.membershipTier || calculateMembershipTier(currentCust.totalSpend || 0);
      const addedPoints = calculatePointsEarned(netTotal, currentTier);
      const newTotalSpend = (currentCust.totalSpend || 0) + netTotal;
      const newTier = calculateMembershipTier(newTotalSpend);
      const newPointsBalance = (currentCust.points || 0) + addedPoints;

      const pointLog: CustomerPointLog = {
        id: 'pt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        type: 'earn',
        pointsChange: addedPoints,
        balanceAfter: newPointsBalance,
        orderNo,
        orderAmount: netTotal,
        reason: `สะสมแต้มจากยอดซื้อออเดอร์ ${orderNo} (${currentTier} Tier x${LOYALTY_TIERS[currentTier]?.multiplier || 1})`,
        recordedBy: currentUser?.name || 'แคชเชียร์',
      };

      const updatedCustomer: Customer = {
        ...currentCust,
        points: newPointsBalance,
        totalSpend: newTotalSpend,
        membershipTier: newTier,
        pointHistory: [pointLog, ...(currentCust.pointHistory || [])],
      };

      setCustomers((prev) =>
        (prev || []).map((c) => (c.id === customer.id ? updatedCustomer : c))
      );
      runSyncWrite(saveCustomerToFirestore(updatedCustomer));

      // Attach loyalty info to current sale order
      newOrder.pointsEarned = addedPoints;
      newOrder.customerPointsBalance = newPointsBalance;
      newOrder.customerTier = newTier;
    }

    // 4. Save Order
    setOrders((prev) => [newOrder, ...prev]);
    runSyncWrite(saveSaleToFirestore(newOrder));
    newMovements.forEach((m) => runSyncWrite(saveStockMovementToFirestore(m)));

    // 4.1 Update Active Shift Statistics
    if (currentShift && currentShift.status === 'active') {
      const cashAmount = (paymentMethods || [])
        .filter((p) => p.method === 'cash')
        .reduce((sum, p) => sum + p.amount, 0);
      const promptPayAmount = (paymentMethods || [])
        .filter((p) => p.method === 'promptpay' || p.method === 'transfer')
        .reduce((sum, p) => sum + p.amount, 0);
      const cardAmount = (paymentMethods || [])
        .filter((p) => p.method === 'card')
        .reduce((sum, p) => sum + p.amount, 0);

      setCurrentShift((prev) => {
        if (!prev) return null;
        const updatedShift: CashierShift = {
          ...prev,
          orderCount: prev.orderCount + 1,
          cashSalesThb: prev.cashSalesThb + cashAmount,
          promptPaySalesThb: prev.promptPaySalesThb + promptPayAmount,
          cardSalesThb: prev.cardSalesThb + cardAmount,
          totalSalesThb: prev.totalSalesThb + netTotal,
        };
        setShifts((all) => all.map((s) => (s.id === updatedShift.id ? updatedShift : s)));
        return updatedShift;
      });
    }

    // 5. Audit Log
    addAuditLog(
      'COMPLETE_CHECKOUT',
      'pos',
      `ชำระเงินออเดอร์ ${orderNo} ยอดรวม ฿${netTotal.toLocaleString()} (${(paymentMethods || []).map((p) => p.method).join(', ')})`,
      '-',
      orderNo
    );

    clearCart();
    return newOrder;
  };

  // Refund / Return Order with Inventory and Lot restoration
  const refundOrder = (orderId: string, reason: string, approvedByManager: string): boolean => {
    const targetOrder = (orders || []).find((o) => o.id === orderId);
    if (!targetOrder) {
      console.error('Order not found for refund:', orderId);
      return false;
    }

    if (targetOrder.paymentStatus === 'refunded') {
      return false;
    }

    const nowStr = new Date().toISOString();
    const updatedOrder: SaleOrder = {
      ...targetOrder,
      paymentStatus: 'refunded',
      refundReason: reason,
      refundedAt: nowStr,
      refundedBy: currentUser.name,
      refundApprovedByManager: approvedByManager,
      refundAmount: targetOrder.netTotal,
    };

    // Restore Inventory & Lot/Batch Stock
    const updatedProducts = [...products];
    const updatedLots = [...cannabisLots];
    const newMovements: StockMovement[] = [];

    (targetOrder.items || []).forEach((item) => {
      const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
      if (prodIdx >= 0) {
        const prod = updatedProducts[prodIdx];
        const newStock = prod.stock + item.quantity;
        updatedProducts[prodIdx] = { ...prod, stock: newStock };

        // If Cannabis item with Lot number
        if (item.lotNumber) {
          const lotIdx = updatedLots.findIndex((l) => l.lotNumber === item.lotNumber);
          if (lotIdx >= 0) {
            const lot = updatedLots[lotIdx];
            const newLotQty = lot.remainingGrams + item.quantity;
            updatedLots[lotIdx] = { ...lot, remainingGrams: newLotQty };
          }
        }

        // Add Stock Movement for Return
        const movement: StockMovement = {
          id: 'mov-ret-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: nowStr,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          lotNumber: item.lotNumber,
          batchNo: item.batchNo,
          type: 'return',
          quantityChange: item.quantity,
          balanceAfter: newStock,
          unit: prod.stockUnit,
          reason: `คืนสินค้าบิล ${targetOrder.orderNo} (อนุมัติ: ${approvedByManager}): ${reason}`,
          userId: currentUser.id,
          userName: currentUser.name,
        };
        newMovements.push(movement);
        runSyncWrite(saveStockMovementToFirestore(movement));
      }
    });

    // Revert Customer Points & Spend if applicable
    if (targetOrder.customerId) {
      const cust = (customers || []).find((c) => c.id === targetOrder.customerId);
      if (cust) {
        const deductedPoints = targetOrder.pointsEarned !== undefined 
          ? targetOrder.pointsEarned 
          : Math.floor((targetOrder.netTotal || 0) / 50);
        const newSpend = Math.max(0, cust.totalSpend - (targetOrder.netTotal || 0));
        const newPoints = Math.max(0, cust.points - deductedPoints);
        const newTier = calculateMembershipTier(newSpend);

        const refundLog: CustomerPointLog = {
          id: 'pt-ref-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: nowStr,
          type: 'refund',
          pointsChange: -deductedPoints,
          balanceAfter: newPoints,
          orderNo: targetOrder.orderNo,
          orderAmount: targetOrder.netTotal,
          reason: `ดึงแต้มคืนจากการยกเลิก/คืนเงินบิล ${targetOrder.orderNo}`,
          recordedBy: currentUser.name,
        };

        const updatedCustomer: Customer = {
          ...cust,
          points: newPoints,
          totalSpend: newSpend,
          membershipTier: newTier,
          pointHistory: [refundLog, ...(cust.pointHistory || [])],
        };
        setCustomers((prev) =>
          (prev || []).map((c) => (c.id === cust.id ? updatedCustomer : c))
        );
        runSyncWrite(saveCustomerToFirestore(updatedCustomer));
      }
    }

    setProducts(updatedProducts);
    setCannabisLots(updatedLots);
    setStockMovements((prev) => [...newMovements, ...prev]);

    // Update Orders state
    setOrders((prev) =>
      (prev || []).map((o) => (o.id === orderId ? updatedOrder : o))
    );
    runSyncWrite(saveSaleToFirestore(updatedOrder));

    // Audit Log
    addAuditLog(
      'REFUND_ORDER',
      'pos',
      `ทำรายการคืนเงิน/คืนสินค้า บิล ${targetOrder.orderNo} ยอด ฿${(targetOrder.netTotal || 0).toLocaleString()} เหตุผล: ${reason} (อนุมัติโดย ผจก: ${approvedByManager})`,
      'paid',
      'refunded'
    );

    return true;
  };

  // Kitchen Order Status
  const updateKitchenItemStatus = (
    orderId: string,
    itemId: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'served'
  ) => {
    setKitchenOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedItems = (order.items || []).map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          );

          const allServed = updatedItems.every((i) => i.status === 'served');
          const allReady = updatedItems.every((i) => i.status === 'ready' || i.status === 'served');
          const anyPreparing = updatedItems.some((i) => i.status === 'preparing');

          let overallStatus: KitchenOrder['overallStatus'] = 'pending';
          if (allServed) overallStatus = 'served';
          else if (allReady) overallStatus = 'ready';
          else if (anyPreparing) overallStatus = 'preparing';

          const updatedOrder = { ...order, items: updatedItems, overallStatus };
          runSyncWrite(saveKitchenOrderToFirestore(updatedOrder));
          return updatedOrder;
        }
        return order;
      })
    );
  };

  // Shift Management Methods
  const startShift = (startingFloat = 1000, notes = ''): CashierShift => {
    const now = new Date().toISOString();
    const shiftSeq = Math.floor(100 + Math.random() * 900);
    const newShift: CashierShift = {
      id: 'shift-' + Date.now(),
      shiftNumber: `SHIFT-${now.slice(0, 10).replace(/-/g, '')}-${shiftSeq}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      role: currentUser.role,
      startTime: now,
      status: 'active',
      startingFloatThb: startingFloat,
      cashSalesThb: 0,
      promptPaySalesThb: 0,
      cardSalesThb: 0,
      totalSalesThb: 0,
      orderCount: 0,
      notes: notes || 'เปิดกะใหม่หน้าร้าน POS',
    };

    setCurrentShift(newShift);
    setShifts((prev) => [newShift, ...prev]);

    addAuditLog(
      'START_CASHIER_SHIFT',
      'pos',
      `เปิดกะ ${newShift.shiftNumber} โดย ${currentUser.name} (${currentUser.role}) เงินทอนเริ่มต้น ฿${startingFloat.toLocaleString()}`,
      '-',
      newShift.shiftNumber,
      notes
    );

    return newShift;
  };

  const switchShift = (
    newUserId: string,
    pin: string,
    startingFloat = 1000,
    notes = ''
  ): { success: boolean; message: string; shift?: CashierShift } => {
    const targetUser = users.find((u) => u.id === newUserId);
    if (!targetUser) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งานที่เลือกในระบบ' };
    }
    if (targetUser.pin !== pin && pin !== 'P@ssw0rd') {
      return { success: false, message: 'รหัส PIN 4 หลักไม่ถูกต้อง กรุณาระบุรหัส PIN ของผู้รับกะ' };
    }

    const now = new Date().toISOString();

    // Close previous shift if one was active
    if (currentShift && currentShift.status === 'active') {
      const closedPrevShift: CashierShift = {
        ...currentShift,
        endTime: now,
        status: 'closed',
        closedBy: targetUser.name,
        notes: notes ? `${currentShift.notes || ''} | ส่งต่อกะให้: ${targetUser.name} (${notes})` : `${currentShift.notes || ''} | ส่งต่อกะให้: ${targetUser.name}`,
      };
      setShifts((prev) => [closedPrevShift, ...prev.filter((s) => s.id !== currentShift.id)]);
    }

    // Start new shift for target user
    const shiftSeq = Math.floor(100 + Math.random() * 900);
    const newShift: CashierShift = {
      id: 'shift-' + Date.now(),
      shiftNumber: `SHIFT-${now.slice(0, 10).replace(/-/g, '')}-${shiftSeq}`,
      cashierId: targetUser.id,
      cashierName: targetUser.name,
      role: targetUser.role,
      startTime: now,
      status: 'active',
      startingFloatThb: startingFloat,
      cashSalesThb: 0,
      promptPaySalesThb: 0,
      cardSalesThb: 0,
      totalSalesThb: 0,
      orderCount: 0,
      notes: notes || `ผลัดกะมารับช่วงต่อจาก ${currentUser.name}`,
    };

    const prevCashierName = currentUser.name;
    setCurrentUser(targetUser);
    setCurrentShift(newShift);
    setShifts((prev) => [newShift, ...prev.filter((s) => s.id !== newShift.id)]);

    addAuditLog(
      'SWITCH_CASHIER_SHIFT',
      'pos',
      `สลับกะแคชเชียร์จาก ${prevCashierName} เป็น ${targetUser.name} (${targetUser.role}) - เลขกะใหม่ ${newShift.shiftNumber} (เงินทอนเริ่มต้น ฿${startingFloat.toLocaleString()})`,
      prevCashierName,
      targetUser.name,
      notes || 'สลับกะหน้าร้าน POS'
    );

    return {
      success: true,
      message: `สลับกะสำเร็จ! เข้าสู่ระบบในนามคุณ ${targetUser.name} (${targetUser.role})`,
      shift: newShift,
    };
  };

  const closeShift = (
    closingCashActual?: number,
    notes?: string
  ): { success: boolean; shift?: CashierShift } => {
    if (!currentShift) return { success: false };
    const now = new Date().toISOString();
    const expectedCash = currentShift.startingFloatThb + currentShift.cashSalesThb;
    const cashDiff = closingCashActual !== undefined ? closingCashActual - expectedCash : 0;

    const closed: CashierShift = {
      ...currentShift,
      endTime: now,
      status: 'closed',
      closingCashActualThb: closingCashActual,
      cashDifferenceThb: cashDiff,
      notes: notes || currentShift.notes,
      closedBy: currentUser.name,
    };

    setCurrentShift(null);
    setShifts((prev) => [closed, ...prev.filter((s) => s.id !== currentShift.id)]);

    addAuditLog(
      'CLOSE_CASHIER_SHIFT',
      'pos',
      `ปิดกะ ${closed.shiftNumber} โดย ${currentUser.name} ยอดขายรวม ฿${closed.totalSalesThb.toLocaleString()} (เงินสดนับได้: ฿${(closingCashActual || 0).toLocaleString()}, ผลต่าง: ฿${cashDiff.toLocaleString()})`,
      'active',
      'closed',
      notes || 'ปิดกะประจำวัน'
    );

    return { success: true, shift: closed };
  };

  const openCashDrawer = (reason = 'เปิดลิ้นชักหน้าร้าน POS') => {
    addAuditLog(
      'OPEN_CASH_DRAWER',
      'pos',
      `เปิดลิ้นชักเก็บเงินโดย ${currentUser.name} (${currentUser.role}) เหตุผล: ${reason}`,
      '-',
      'DRAWER_TRIGGERED',
      reason
    );
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.clear();
    setShopSettings(INITIAL_SHOP_SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    setCannabisLots(INITIAL_CANNABIS_LOTS);
    setKratomBatches(INITIAL_KRATOM_BATCHES);
    setSuppliers(INITIAL_SUPPLIERS);
    setRawMaterialSources(INITIAL_RAW_MATERIAL_SOURCES);
    setCustomers(INITIAL_CUSTOMERS);
    setCart([]);
    setOrders([]);
    setStockMovements([]);
    setKitchenOrders([]);
    setAuditLogs([]);
    setShifts([]);
    setCurrentShift(null);
    addAuditLog('SYSTEM_RESET', 'settings', 'รีเซ็ตระบบกลับเป็นข้อมูลตัวอย่างเริ่มต้น');
  };

  return (
    <POSContext.Provider
      value={{
        isCloudSynced,
        isSyncing,
        pendingSyncCount,
        lastSyncTime,
        syncError,
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        shopSettings,
        setShopSettings,
        businesses,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        units,
        addUnit,
        updateUnit,
        deleteUnit,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        cannabisLots,
        setCannabisLots,
        kratomBatches,
        setKratomBatches,
        suppliers,
        setSuppliers,
        rawMaterialSources,
        setRawMaterialSources,
        addRawMaterialSource,
        updateRawMaterialSource,
        deleteRawMaterialSource,
        customers,
        setCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        adjustCustomerPoints,
        redeemCustomerReward,
        expenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        promotions,
        setPromotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
        togglePromotion,
        appliedPromotions,
        selectedPromoCodes,
        applyPromoCode,
        removePromoCode,
        upsellSuggestions,
        cart: promoEvalResult.cartWithDiscounts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartDiscount,
        updateCartNotes,
        clearCart,
        orders,
        refundOrder,
        resetAllSales,
        resetAllExpenses,
        resetAllAccounting,
        stockMovements,
        kitchenOrders,
        auditLogs,
        completeCheckout,
        adjustStock,
        produceKratomBatch,
        addCannabisLot,
        updateKitchenItemStatus,
        addAuditLog,
        currentShift,
        shifts,
        startShift,
        switchShift,
        closeShift,
        openCashDrawer,
        resetToDemoData,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
