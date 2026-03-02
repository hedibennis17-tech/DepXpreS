import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Use service account if available, otherwise use application default credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
      });
    } catch {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
      });
    }
  } else {
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
    });
  }

  return adminApp;
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
