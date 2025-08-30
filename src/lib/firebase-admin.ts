
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'production') {
    // For production, use Application Default Credentials.
    admin.initializeApp();
  } else {
    // For local development, use the service account key from environment variables.
    const serviceAccountKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error: any) {
         console.error('Failed to parse Firebase service account key:', error);
      }
    } else {
        console.warn("FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is not set for local development. Admin features may not work.");
    }
  }
}

// Use functions to lazily initialize services, preventing errors when the SDK isn't fully configured (e.g., local dev without key).
const adminDb = admin.apps.length ? getFirestore() : null;
const adminAuth = admin.apps.length ? getAuth() : null;


export { adminDb, adminAuth };
