/**
 * Utility to clear all application caches including Firebase Auth state
 * This helps resolve rate limiting issues across different browsers
 */

export async function clearAllCaches(): Promise<void> {
  // 1. Clear localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('firebase:') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }

  // 2. Clear sessionStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('firebase:') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear sessionStorage:', e);
  }

  // 3. Clear all cookies related to auth
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name] = cookie.split('=');
      const trimmedName = name.trim();
      if (trimmedName.includes('session') || trimmedName.includes('token') || trimmedName.includes('admin') || trimmedName.includes('auth')) {
        document.cookie = `${trimmedName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  } catch (e) {
    console.warn('Failed to clear cookies:', e);
  }

  // 4. Clear IndexedDB (Firebase Auth uses this for persistence)
  try {
    const databases = await indexedDB.databases?.();
    if (databases) {
      for (const db of databases) {
        if (db.name && (db.name.includes('firebase') || db.name.includes('firebaseLocalStorage'))) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to clear IndexedDB:', e);
  }

  // 5. Clear service worker caches
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (e) {
    console.warn('Failed to clear service worker caches:', e);
  }
}

export async function clearCacheAndReload(): Promise<void> {
  await clearAllCaches();
  // Force a hard reload to re-initialize Firebase
  window.location.reload();
}
