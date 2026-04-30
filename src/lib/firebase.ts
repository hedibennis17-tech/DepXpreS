import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-1471071484-26917.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-1471071484-26917.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "4728432828",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:4728432828:web:4ef7796d15d6464cdc48b9",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth avec persistence localStorage dès l'init
// localStorage = session survit aux changements de page, onglets, refresh
function createAuth() {
  if (typeof window === "undefined") return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: [
        browserLocalPersistence,   // Principal — survit aux refreshs
        indexedDBLocalPersistence, // Fallback si localStorage bloqué
      ],
    });
  } catch {
    // initializeAuth déjà appelé — récupérer l'instance existante
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
