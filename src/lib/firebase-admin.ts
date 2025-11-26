
import { getApps, initializeApp, applicationDefault, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * IMPORTANT
 * - In STAGING/PROD on Firebase Hosting/Functions, we use ADC: initializeApp() with NO ARGS.
 * - Locally/emulator: use applicationDefault() or FIREBASE_ADMIN_SA env JSON.
 * - This module is server-only and safe for RSC/edge middleware EXCEPT: do not import from client components.
 */

let _app: App | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;

function createApp(): App {
  if (getApps().length) return getApps()[0];

  // Detect managed runtime (Cloud Functions/Run/Hosting functions)
  const inGcpManaged =
    !!process.env.K_SERVICE || // Cloud Run
    !!process.env.FUNCTION_TARGET || // Functions gen1
    !!process.env.FUNCTIONS_TARGET; // Functions gen2 env sometimes sets this

  // Emulator/local dev? Prefer explicit creds if provided.
  const hasServiceAccountJson = !!process.env.FIREBASE_ADMIN_SA;
  const hasGcloudDefaultCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (inGcpManaged) {
    // STAGING/PROD: use ADC with NO ARGS (Guardrail)
    return initializeApp();
  }

  // Local/dev:
  if (hasServiceAccountJson) {
    const json = JSON.parse(process.env.FIREBASE_ADMIN_SA as string);
    return initializeApp({ credential: cert(json) });
  }

  if (hasGcloudDefaultCreds) {
    return initializeApp({ credential: applicationDefault() });
  }

  // Last resort: still attempt ADC (works if 'gcloud auth application-default login' ran)
  return initializeApp();
}

export function getAdminApp(): App {
  if (!_app) _app = createApp();
  return _app;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  const app = getAdminApp();
  const db = getFirestore(app);

  // Point to emulator if present
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({ host: process.env.FIRESTORE_EMULATOR_HOST, ssl: false });
  }

  _db = db;
  return _db;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getAdminApp());
  return _auth;
}

// Back-compat named exports (some files import these directly)
export const adminDb: Firestore | null = (() => {
  try { return getAdminDb(); } catch { return null; }
})();

export const adminAuth: Auth | null = (() => {
  try { return getAdminAuth(); } catch { return null; }
})();
