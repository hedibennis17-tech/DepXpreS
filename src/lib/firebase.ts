import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from "firebase/firestore";
import { getAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, indexedDBLocalPersistence } from "firebase/auth";
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

// ── Auth — fallback si IndexedDB bloqué (mode privé, Samsung Browser, etc.) ──
function initAuth() {
  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
    });
  } catch {
    // initializeAuth déjà appelé — récupérer l'instance existante
    return getAuth(app);
  }
}

// ── Firestore — fallback memory si IndexedDB bloqué ──────────────────────────
function initDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    try {
      // Fallback: memory cache si persistance bloquée
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
      });
    } catch {
      return getFirestore(app);
    }
  }
}

export const auth = initAuth();
export const db = initDb();
export const storage = getStorage(app);
export default app;
