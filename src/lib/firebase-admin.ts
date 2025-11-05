import 'server-only';
import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

function ensureApp() {
  if (!admin.apps.length) {
    const inProd = process.env.NODE_ENV === 'production';
    if (inProd) {
      // PRODUCTION: Application Default Credentials (ADC)
      app = admin.initializeApp();
    } else {
      // LOCAL/EMULATOR: projectId only
      app = admin.initializeApp({
        projectId: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      });
    }
  } else {
    app = admin.app();
  }
}

export function getAdminDb(): FirebaseFirestore.Firestore {
  ensureApp();
  return admin.firestore();
}

// Back-compat: some modules import { adminDb }. Provide a stable binding.
export const adminDb = getAdminDb();