"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, Package, Calendar,
  DollarSign, Bell, User, LogOut, Store, Menu, X, ChevronRight,
  ChevronDown, Search
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/store/dashboard",     label: "Tableau de bord",  icon: LayoutDashboard },
  { href: "/store/orders",        label: "Commandes",        icon: ShoppingBag },
  { href: "/store/catalog",       label: "Catalogue",        icon: Package },
  { href: "/store/schedule",      label: "Horaires",         icon: Calendar },
  { href: "/store/settlements",   label: "Paiements",        icon: DollarSign },
  { href: "/store/notifications", label: "Notifications",    icon: Bell },
  { href: "/store/profile",       label: "Mon profil",       icon: User },
];

interface StoreInfo {
  id: string;
  name: string;
  address?: string;
  isOpen?: boolean;
}

interface StoreUser {
  name: string;
  storeName: string;
  storeId: string;
  role: string;
  isSuperAdmin: boolean;
}

export default function StoreAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pour le sélecteur de dépanneur (super admin)
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [showStoreSelector, setShowStoreSelector] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/store-login");
        return;
      }

      try {
        // Essayer de charger le profil depuis app_users
        const userDoc = await getDoc(doc(db, "app_users", firebaseUser.uid));

        let storeId = "";
        let storeName = "";
        let role = "super_admin";
        let isSuperAdmin = false;

        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data.role || "store_owner";

          // Vérifier que le rôle est autorisé
          if (!["store_owner", "store_manager", "super_admin"].includes(role)) {
            await signOut(auth);
            router.replace("/store-login");
            return;
          }

          storeId = data.storeId || data.store_id || localStorage.getItem("storeId") || "";
          storeName = data.storeName || "";

          if (!storeName && storeId) {
            const storeDoc = await getDoc(doc(db, "stores", storeId));
            if (storeDoc.exists()) {
              storeName = storeDoc.data().name || "Mon Commerce";
            }
          }

          isSuperAdmin = role === "super_admin";
        } else {
          // Document app_users inexistant → traiter comme super admin
          // (compte créé directement dans Firebase Auth)
          isSuperAdmin = true;
          role = "super_admin";
          storeId = localStorage.getItem("storeId") || "";

          if (storeId) {
            const storeDoc = await getDoc(doc(db, "stores", storeId));
            if (storeDoc.exists()) {
              storeName = storeDoc.data().name || "Mon Commerce";
            }
          }
        }

        if (storeId) localStorage.setItem("storeId", storeId);

        setUser({
          name: firebaseUser.displayName || firebaseUser.email || "Admin",
          storeName: storeName || (storeId ? "Mon Commerce" : "Choisir un commerce"),
          storeId,
          role,
          isSuperAdmin,
        });

        // Si super admin sans storeId → charger la liste et afficher le sélecteur
        if (isSuperAdmin && !storeId) {
          const storesSnap = await getDocs(query(collection(db, "stores"), orderBy("name")));
          const storesList = storesSnap.docs.map(d => ({
            id: d.id,
            name: d.data().name || d.id,
            address: d.data().address || "",
            isOpen: d.data().isOpen === true,
          }));
          setStores(storesList);
          setShowStoreSelector(true);
        }
      } catch (e) {
        console.error("Store layout auth error:", e);
        // En cas d'erreur Firestore, continuer quand même comme super admin
        const storeId = localStorage.getItem("storeId") || "";
        setUser({
          name: firebaseUser.displayName || firebaseUser.email || "Admin",
          storeName: storeId ? "Mon Commerce" : "Choisir un commerce",
          storeId,
          role: "super_admin",
          isSuperAdmin: true,
        });
        if (!storeId) {
          setShowStoreSelector(true);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("storeId");
    router.replace("/store-login");
  };

  const selectStore = async (store: StoreInfo) => {
    localStorage.setItem("storeId", store.id);
    setUser(prev => prev ? {
      ...prev,
      storeId: store.id,
      storeName: store.name,
    } : null);
    setShowStoreSelector(false);
    setShowStorePicker(false);
    // Recharger la page pour que le dashboard charge les données du bon store
    router.refresh();
  };

  const loadStores = async () => {
    if (stores.length > 0) return;
    const storesSnap = await getDocs(query(collection(db, "stores"), orderBy("name")));
    setStores(storesSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name || d.id,
      address: d.data().address || "",
      isOpen: d.data().isOpen === true,
    })));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-3">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mt-2"></div>
          <p className="text-sm text-gray-500 mt-3">Chargement de l&apos;espace commercants partenaires...</p>
        </div>
      </div>
    );
  }

  // Écran de sélection de dépanneur pour super admin
  if (showStoreSelector) {
    const filtered = stores.filter(s =>
      !storeSearch || s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(storeSearch.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-orange-500 p-6 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Store className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold">Choisir un commerce</h1>
            <p className="text-orange-100 text-sm mt-1">
              Bonjour {user?.name} — Sélectionnez le commerce à gérer
            </p>
          </div>

          <div className="p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un commerce..."
                value={storeSearch}
                onChange={e => setStoreSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                autoFocus
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">
                  {stores.length === 0 ? "Chargement des commerces..." : "Aucun commerce trouvé"}
                </p>
              ) : (
                filtered.map(store => (
                  <button
                    key={store.id}
                    onClick={() => selectStore(store)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Store className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{store.name}</p>
                      {store.address && (
                        <p className="text-xs text-gray-500 truncate">{store.address}</p>
                      )}
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      store.isOpen ? "bg-green-500" : "bg-gray-300"
                    )} />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredStores = stores.filter(s =>
    !storeSearch || s.name.toLowerCase().includes(storeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Overlay store picker */}
      {showStorePicker && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowStorePicker(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">{user?.storeName || "Mon Commerce"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.name}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Bouton changer de dépanneur (super admin uniquement) */}
          {user?.isSuperAdmin && (
            <div className="relative mt-3">
              <button
                onClick={async () => {
                  await loadStores();
                  setStoreSearch("");
                  setShowStorePicker(v => !v);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                Changer de commerce
              </button>

              {showStorePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden border border-gray-700">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={storeSearch}
                        onChange={e => setStoreSearch(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStores.map(store => (
                      <button
                        key={store.id}
                        onClick={() => selectStore(store)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-gray-700 transition-colors",
                          user?.storeId === store.id && "bg-orange-500/20 text-orange-300"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0",
                          store.isOpen ? "bg-green-400" : "bg-gray-500"
                        )} />
                        <span className="truncate">{store.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </a>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm truncate">{user?.storeName || "Mon Commerce"}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
