#!/usr/bin/env node
/**
 * One-time migration: copy every Firestore collection into Supabase.
 *
 *   npm run migrate:firestore            # copy data
 *   npm run migrate:firestore -- --dry-run   # only count what would be copied
 *
 * Needs in .env:
 *   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Reads the Firestore connection from firebase-applet-config.json.
 *
 * Safe to run more than once: rows are upserted by id, nothing is deleted.
 * Run supabase/migrations/001_init.sql first so the tables exist.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
  GeoPoint,
  DocumentReference,
  Bytes,
} from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

// Same list as COLLECTIONS in src/lib/dbService.ts / the SQL migration.
const COLLECTIONS = [
  'users', 'roles', 'permissions', 'customers', 'suppliers',
  'departments', 'categories', 'products', 'product_variants',
  'product_batches', 'product_lots', 'ingredients', 'recipes',
  'recipe_items', 'purchases', 'purchase_items', 'sales', 'sale_items',
  'payments', 'stock', 'stock_movements', 'kitchen_orders',
  'kitchen_order_items', 'discounts', 'promotions', 'expenses',
  'documents', 'attachments', 'audit_logs', 'settings',
  'cannabis_products', 'cannabis_lots', 'cannabis_documents',
  'cannabis_movements', 'prescriptions', 'raw_material_sources',
];

const CHUNK = 500;

// --- Connections -----------------------------------------------------------

const fbConfig = JSON.parse(readFileSync(path.join(root, 'firebase-applet-config.json'), 'utf8'));
const fbApp = initializeApp({
  apiKey: fbConfig.apiKey,
  authDomain: fbConfig.authDomain,
  projectId: fbConfig.projectId,
  storageBucket: fbConfig.storageBucket,
  messagingSenderId: fbConfig.messagingSenderId,
  appId: fbConfig.appId,
});
const firestore = getFirestore(fbApp, fbConfig.firestoreDatabaseId || '(default)');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dryRun && (!supabaseUrl || !serviceKey)) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = dryRun
  ? null
  : createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

// --- Firestore value -> plain JSON -----------------------------------------

function toJson(value) {
  if (value === null || value === undefined) return value ?? null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return value.path;
  if (value instanceof Bytes) return value.toBase64();
  if (Array.isArray(value)) return value.map(toJson);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = toJson(v);
    }
    return out;
  }
  return value;
}

// --- Run -------------------------------------------------------------------

async function migrateCollection(name) {
  const snap = await getDocs(collection(firestore, name));
  const rows = snap.docs.map((d) => ({ id: d.id, data: toJson(d.data()) }));

  if (dryRun || rows.length === 0) return { name, read: rows.length, written: 0 };

  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(name).upsert(rows.slice(i, i + CHUNK), { onConflict: 'id' });
    if (error) throw new Error(`${name}: ${error.message}`);
  }

  const { count, error } = await supabase.from(name).select('id', { count: 'exact', head: true });
  if (error) throw new Error(`${name} (count): ${error.message}`);
  return { name, read: rows.length, written: rows.length, inSupabase: count };
}

console.log(
  `${dryRun ? '[DRY RUN] ' : ''}Firestore project "${fbConfig.projectId}", database "${fbConfig.firestoreDatabaseId || '(default)'}"`
);

const results = [];
let failed = false;
for (const name of COLLECTIONS) {
  try {
    const r = await migrateCollection(name);
    results.push(r);
    if (r.read > 0) console.log(`  ✓ ${name}: ${r.read} docs${dryRun ? '' : ` → ${r.inSupabase} rows in Supabase`}`);
  } catch (err) {
    failed = true;
    console.error(`  ✗ ${err.message || err}`);
  }
}

const total = results.reduce((s, r) => s + r.read, 0);
const empty = results.filter((r) => r.read === 0).map((r) => r.name);
console.log(`\nTotal documents read: ${total}`);
if (empty.length) console.log(`Empty / unused collections (skipped): ${empty.join(', ')}`);
console.log(failed ? '\nFinished WITH ERRORS — fix them and run again (it is safe to re-run).' : '\nDone.');
process.exit(failed ? 1 : 0);
