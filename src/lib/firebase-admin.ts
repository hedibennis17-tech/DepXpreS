/**
 * firebase-admin.ts
 * 
 * Utilise le vrai Firebase Admin SDK (pas l'adaptateur REST).
 * Compatible Vercel Serverless Functions avec runtime nodejs.
 */
import * as admin from "firebase-admin";

// Initialiser Firebase Admin SDK une seule fois (singleton)
function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!saStr) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(saStr) as admin.ServiceAccount;
  } catch (e) {
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${e}`);
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: (serviceAccount as Record<string, string>).project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-1471071484-26917.firebasestorage.app",
  });
}

// Lazy initialization
let _adminDb: admin.firestore.Firestore | null = null;
let _adminAuth: admin.auth.Auth | null = null;

export function getAdminDb(): admin.firestore.Firestore {
  if (!_adminDb) {
    const app = getAdminApp();
    _adminDb = admin.firestore(app);
  }
  return _adminDb;
}

export function getAdminAuth(): admin.auth.Auth {
  if (!_adminAuth) {
    const app = getAdminApp();
    _adminAuth = admin.auth(app);
  }
  return _adminAuth;
}

// Proxy pour compatibilité avec l'ancien code qui importe adminDb directement
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const val = (db as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') return val.bind(db);
    return val;
  }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const val = (auth as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') return val.bind(auth);
    return val;
  }
});

// FieldValue export pour compatibilité
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

// Storage Admin
export function getAdminStorage(): admin.storage.Storage {
  const app = getAdminApp();
  return admin.storage(app);
}

export function getAdminBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-1471071484-26917.firebasestorage.app";
  return getAdminStorage().bucket(bucketName);
}

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    const s = getAdminStorage();
    const val = (s as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === 'function') return val.bind(s);
    return val;
  }
});
