
// scripts/seed/index.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------- CLI args --------
// --target=emulator | staging
// --project=<projectId>            (required for staging)
// --adminUid=<uid>                 (optional: create users/{uid} role=admin)
// --sa=<path to service account json>  (staging Option A)
const args = Object.fromEntries(process.argv.slice(2).map(kv => {
  const [k, v] = kv.split('=');
  return [k.replace(/^--/, ''), v ?? true];
}));

const target = args.target || 'emulator';
const projectId = args.project || process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG?.projectId;
const adminUid = args.adminUid || process.env.ADMIN_UID;
const saPath = args.sa;

// -------- init admin --------
function initApp() {
  if (getApps().length) return;
  if (target === 'emulator' || process.env.FIRESTORE_EMULATOR_HOST) {
    // Emulator requires no explicit credentials
    initializeApp({ projectId: projectId || 'demo-ggr' });
    return;
  }
  if (saPath && fs.existsSync(saPath)) {
    const key = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(key), projectId: key.project_id });
    return;
  }
  // Fallback to ADC (works in CI/managed env if configured)
  initializeApp({ credential: applicationDefault(), projectId });
}

initApp();
const db = getFirestore();

// -------- helpers --------
function readJSON(rel) {
  const p = path.join(__dirname, rel);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function upsertCollection(coll, items, idKey) {
  const batch = db.batch();
  for (const item of items) {
    const id = idKey && item[idKey] ? String(item[idKey]) : undefined;
    const ref = id ? db.collection(coll).doc(id) : db.collection(coll).doc();
    // Normalize timestamps if present
    const data = { ...item };
    if (data.createdAt === 'now') data.createdAt = FieldValue.serverTimestamp();
    if (data.updatedAt === 'now') data.updatedAt = FieldValue.serverTimestamp();
    batch.set(ref, data, { merge: true });
  }
  await batch.commit();
  console.log(`✓ Upserted ${items.length} docs into ${coll}`);
}

async function seedAvailabilityFromRanges(ranges) {
  // Expected shape: [{ cottageId, from, to }, ...] (ISO dates)
  const batch = db.batch();
  for (const r of ranges) {
    const ref = db.collection('availability').doc();
    batch.set(ref, {
      cottageId: r.cottageId,
      from: new Date(r.from),
      to: new Date(r.to),
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`✓ Upserted ${ranges.length} availability ranges`);
}

async function ensureAdminUser(uid) {
  if (!uid) return;
  const ref = db.collection('users').doc(uid);
  await ref.set({ role: 'admin', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`✓ Ensured users/${uid} has role=admin`);
}

(async () => {
  // Load JSONs relative to scripts/seed/
  const cottages = readJSON('./cottages.json');
  const activities = readJSON('./activities.json');
  const pricing = readJSON('./pricing.json');

  // Optional availability file: availability.json (if you have it)
  let availabilityRanges = [];
  const availabilityPath = path.join(__dirname, 'availability.json');
  if (fs.existsSync(availabilityPath)) {
    availabilityRanges = JSON.parse(fs.readFileSync(availabilityPath, 'utf8'));
  }

  // Seed core collections
  await upsertCollection('cottages', cottages, 'slug');   // use slug as id if present
  await upsertCollection('activities', activities, 'slug');
  await upsertCollection('pricing', [pricing], 'id');     // ensure pricing.json has { "id": "current", ... }

  if (availabilityRanges.length) {
    await seedAvailabilityFromRanges(availabilityRanges);
  } else {
    console.log('ℹ No availability.json found; skipping availability ranges here.');
  }

  await ensureAdminUser(adminUid);

  console.log('✅ Seeding complete for target:', target);
  process.exit(0);
})().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
