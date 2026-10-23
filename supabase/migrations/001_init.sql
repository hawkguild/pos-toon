-- =====================================================================
-- POS Toon : Supabase schema (ย้ายมาจาก Firestore)
--
-- แต่ละคอลเลกชันเดิมใน Firestore = 1 ตาราง
--   id          text  primary key   (เท่ากับ document id เดิม)
--   data        jsonb               (เนื้อหา document ทั้งก้อน)
--   created_at  timestamptz
--   updated_at  timestamptz         (อัปเดตอัตโนมัติด้วย trigger)
--
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > วางไฟล์นี้ทั้งไฟล์ > Run
-- รันซ้ำได้ ไม่ทำให้ข้อมูลเดิมหาย
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables text[] := array[
    'users', 'roles', 'permissions', 'customers', 'suppliers',
    'departments', 'categories', 'products', 'product_variants',
    'product_batches', 'product_lots', 'ingredients', 'recipes',
    'recipe_items', 'purchases', 'purchase_items', 'sales', 'sale_items',
    'payments', 'stock', 'stock_movements', 'kitchen_orders',
    'kitchen_order_items', 'discounts', 'promotions', 'expenses',
    'documents', 'attachments', 'audit_logs', 'settings',
    'cannabis_products', 'cannabis_lots', 'cannabis_documents',
    'cannabis_movements', 'prescriptions', 'raw_material_sources'
  ];
begin
  foreach t in array tables loop
    -- ตาราง
    execute format(
      'create table if not exists public.%I (
         id         text primary key,
         data       jsonb not null default ''{}''::jsonb,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now()
       )', t);

    -- trigger อัปเดต updated_at
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);

    -- Row Level Security
    -- !! คำเตือน: นโยบายด้านล่างเปิดให้ anon key อ่าน/เขียนได้ทั้งหมด
    -- !! ซึ่งเท่ากับ firestore.rules เดิม (allow read, write: if true)
    -- !! เพราะแอปยังไม่มีระบบล็อกอินฝั่งเซิร์ฟเวอร์ ควรปรับก่อนใช้งานจริงจัง
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_open_access', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated
         using (true) with check (true)',
      t || '_open_access', t);

    -- เปิด Realtime (ใช้ sync หลายเครื่องพร้อมกัน)
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

-- ดัชนีช่วยเรียงตามเวลา สำหรับตารางที่โตเร็ว
create index if not exists sales_timestamp_idx           on public.sales           ((data->>'timestamp'));
create index if not exists stock_movements_timestamp_idx on public.stock_movements ((data->>'timestamp'));
create index if not exists audit_logs_timestamp_idx      on public.audit_logs      ((data->>'timestamp'));
create index if not exists sale_items_sale_id_idx        on public.sale_items      ((data->>'saleId'));
