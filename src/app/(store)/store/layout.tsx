"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, Package, Calendar,
  DollarSign, Bell, User, LogOut, Store, Menu, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/store/dashboard",     label: "Tableau de bord",  icon: LayoutDashboard },
  { href: "/store/orders",        label: "Commandes",        icon: ShoppingBag },
  { href: "/store/catalog",       label: "Catalogue",        icon: Package },
  { href: "/store/schedule",      label: "Horaires",         icon: Calendar },
  { href: "/store/settlements",   label: "Paiements",        icon: DollarSign },
  { href: "/store/notifications", label: "Notifications",    icon: Bell },
  { href: "/store/profile",       label: "Mon profil",       icon: User },
];

interface StoreUser {
  name: string;
  storeName: string;
  storeId: string;
  role: string;
}

export default function StoreAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/store-login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "app_users", firebaseUser.uid));
        if (!userDoc.exists()) {
          await signOut(auth);
          router.replace("/store-login");
          return;
        }

        const data = userDoc.data();
        const role = data.role || "";

        if (!["store_owner", "store_manager", "super_admin"].includes(role)) {
          await signOut(auth);
          router.replace("/store-login");
          return;
        }

        const storeId = data.storeId || data.store_id || localStorage.getItem("storeId") || "";
        let storeName = data.storeName || "";

        // Charger le nom du store si pas déjà dans le profil
        if (!storeName && storeId) {
          const storeDoc = await getDoc(doc(db, "stores", storeId));
          if (storeDoc.exists()) {
            storeName = storeDoc.data().name || "Mon Dépanneur";
          }
        }

        setUser({
          name: data.displayName || data.name || firebaseUser.email || "Propriétaire",
          storeName: storeName || "Mon Dépanneur",
          storeId,
          role,
        });

        if (storeId) localStorage.setItem("storeId", storeId);
      } catch (e) {
        console.error(e);
        router.replace("/store-login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("storeId");
    localStorage.removeItem("storeUserRole");
    router.replace("/store-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-3">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header sidebar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{user?.storeName || "Mon Dépanneur"}</p>
            <p className="text-xs text-gray-400 truncate">{user?.name}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">{user?.storeName || "Mon Dépanneur"}</span>
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
