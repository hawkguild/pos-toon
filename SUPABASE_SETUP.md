# ย้ายฐานข้อมูลจาก Firestore ไป Supabase

แอปนี้เปลี่ยนจาก Firebase Firestore มาใช้ Supabase (Postgres) แล้ว
แต่ละคอลเลกชันเดิม = 1 ตาราง มีคอลัมน์ `id`, `data` (jsonb เก็บข้อมูลทั้งก้อนเหมือนเดิม), `created_at`, `updated_at`
ระบบ sync หลายเครื่องแบบ realtime ยังทำงานเหมือนเดิม (ใช้ Supabase Realtime)

> **สำคัญ:** ทำขั้นตอนที่ 4 (ย้ายข้อมูล) **ก่อน** เปิดแอปครั้งแรก
> ถ้าเปิดแอปก่อน แอปจะเห็นว่าฐานข้อมูลว่างแล้วใส่ข้อมูลตัวอย่างลงไป ซึ่งจะปนกับข้อมูลจริง

## 1. สร้างโปรเจกต์ Supabase

1. สมัคร/ล็อกอินที่ https://supabase.com แล้วกด **New project**
2. ตั้งชื่อ ตั้งรหัสผ่านฐานข้อมูล และเลือก Region ใกล้ไทย เช่น **Southeast Asia (Singapore)**
3. รอจนโปรเจกต์สร้างเสร็จ (ประมาณ 1–2 นาที)

## 2. สร้างตาราง

1. เมนูซ้าย **SQL Editor** > **New query**
2. คัดลอกเนื้อหาไฟล์ `supabase/migrations/001_init.sql` ทั้งหมดไปวาง แล้วกด **Run**
3. ตรวจที่เมนู **Table Editor** ควรเห็นตาราง 36 ตาราง (users, products, sales, ...)

## 3. ตั้งค่า `.env`

คัดลอก `.env.example` เป็น `.env` แล้วใส่ค่าจาก **Project Settings > API**

| ตัวแปร | เอามาจาก |
|---|---|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (**ความลับ** ใช้เฉพาะตอนย้ายข้อมูล ห้ามเผยแพร่) |

จากนั้นติดตั้งแพ็กเกจ:

```bash
npm install        # หรือ bun install
```

## 4. ย้ายข้อมูลจริงจาก Firestore

```bash
# ดูก่อนว่าจะย้ายอะไรบ้าง (ไม่เขียนอะไรลง Supabase)
npm run migrate:firestore -- --dry-run

# ย้ายจริง
npm run migrate:firestore
```

สคริปต์จะอ่านทุกคอลเลกชันจาก Firestore (ตามค่าใน `firebase-applet-config.json`)
แล้ว upsert ลงตารางเดียวกันใน Supabase พร้อมแสดงจำนวนแถวที่อยู่ใน Supabase หลังย้าย
**รันซ้ำได้** ไม่ลบหรือซ้ำข้อมูล (ใช้ id เดิมเป็นตัวอ้างอิง) — ถ้าระหว่างทดสอบมีคนขายของเพิ่มบน Firestore ก็รันอีกรอบก่อนสลับระบบจริงได้

หมายเหตุ: สคริปต์ย้ายเฉพาะคอลเลกชันที่แอปรู้จัก (36 ชื่อใน `COLLECTIONS`) ถ้าเคยสร้างคอลเลกชันอื่นด้วยมือใน Firebase Console ต้องเพิ่มชื่อในสคริปต์เอง

## 5. เปิดแอป

```bash
npm run dev
```

ไอคอนสถานะ Cloud บน Navbar ควรขึ้นว่าเชื่อมต่อแล้ว ลองเปิด 2 แท็บแล้วแก้สินค้าในแท็บหนึ่ง อีกแท็บควรอัปเดตเองภายในไม่กี่วินาที

## 6. หลังย้ายเสร็จและตรวจสอบเรียบร้อย

- ลบ `firebase-applet-config.json`, `firebase-blueprint.json` และสคริปต์ `scripts/migrate-firestore-to-supabase.mjs` ได้
- ถอนแพ็กเกจ: `npm uninstall firebase`
- ลบ `SUPABASE_SERVICE_ROLE_KEY` ออกจาก `.env`
- ปิดหรือลบโปรเจกต์ Firebase เดิม เมื่อมั่นใจว่าไม่ต้องใช้แล้ว

## ⚠️ เรื่องความปลอดภัย

นโยบาย RLS ในไฟล์ SQL **เปิดให้ทุกคนที่มี anon key อ่าน/เขียนได้ทุกตาราง**
ซึ่งเท่ากับกฎ Firestore เดิม (`allow read, write: if true`) และ anon key ถูกฝังอยู่ในหน้าเว็บที่ใครก็เปิดดูได้
เหตุผลคือแอปใช้ระบบล็อกอิน PIN ของตัวเอง (ตาราง `users`) ไม่ได้ใช้ระบบยืนยันตัวตนฝั่งเซิร์ฟเวอร์

ถ้าจะใช้กับข้อมูลลูกค้า/ใบสั่งยาจริง ควรทำต่อ เช่น ย้ายการล็อกอินไปใช้ Supabase Auth แล้วจำกัดนโยบาย RLS ให้เฉพาะผู้ใช้ที่ล็อกอินแล้ว
