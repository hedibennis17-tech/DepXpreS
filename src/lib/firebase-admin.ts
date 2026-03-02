import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Settings } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
      });
    } catch {
      // Si le JSON est invalide, essayer de corriger les newlines
      try {
        const fixed = serviceAccount.replace(/\\n/g, '\n');
        const parsed = JSON.parse(fixed);
        adminApp = initializeApp({
          credential: cert(parsed),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
        });
      } catch {
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
        });
      }
    }
  } else {
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
    });
  }

  return adminApp;
}

// Configurer Firestore avec des timeouts courts pour Vercel serverless
function createFirestoreInstance() {
  const app = getAdminApp();
  const db = getFirestore(app);
  
  // Configurer les settings Firestore pour les environnements serverless
  try {
    const settings: Settings = {
      ignoreUndefinedProperties: true,
    };
    db.settings(settings);
  } catch {
    // Settings déjà configurés, ignorer
  }
  
  return db;
}

export const adminDb = createFirestoreInstance();
export const adminAuth = getAuth(getAdminApp());
