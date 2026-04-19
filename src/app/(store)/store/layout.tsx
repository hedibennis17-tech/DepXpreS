"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, Package, Calendar,
  DollarSign, Bell, User, LogOut, Store, Menu, X,
  ChevronRight, Zap, TrendingUp
} from "lucide-react";

const NAV = [
  { href: "/store/dashboard",     label: "Tableau de bord",  icon: LayoutDashboard, badge: null },
  { href: "/store/orders",        label: "Commandes",        icon: ShoppingBag,     badge: "new" },
  { href: "/store/catalog",       label: "Catalogue",        icon: Package,         badge: null },
  { href: "/store/schedule",      label: "Horaires",         icon: Calendar,        badge: null },
  { href: "/store/settlements",   label: "Paiements",        icon: DollarSign,      badge: null },
  { href: "/store/notifications", label: "Notifications",    icon: Bell,            badge: null },
  { href: "/store/profile",       label: "Mon profil",       icon: User,            badge: null },
];

interface StoreUser {
  uid: string; email: string; storeName: string; role: string;
  storeId: string; isOpen?: boolean;
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push("/store-login"); return; }
      try {
        const userDoc = await getDoc(doc(db, "app_users", firebaseUser.uid));
        if (!userDoc.exists()) { router.push("/store-login"); return; }
        const data = userDoc.data();
        const role = data.role || "";
        if (!["store_owner","store_manager","super_admin"].includes(role)) {
          router.push("/store-login"); return;
        }
        let storeName = data.storeName || "Mon Commerce";
        const storeId = data.storeId || firebaseUser.uid;
        try {
          const storeDoc = await getDoc(doc(db, "stores", storeId));
          if (storeDoc.exists()) storeName = storeDoc.data().name || storeName;
        } catch {}
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email || "", storeName, role, storeId });
      } catch { router.push("/store-login"); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    await fetch("/api/auth/store/login", { method: "DELETE", credentials: "include" }).catch(() => {});
    localStorage.clear();
    router.push("/store-login");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center animate-pulse">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  );

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0" style={{boxShadow:"0 0 20px rgba(249,115,22,0.4)"}}>
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none truncate max-w-[140px]">{user?.storeName}</p>
          <p className="text-orange-400 text-[10px] font-semibold mt-0.5">Espace Commercant</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 rounded-lg hover:bg-white/5">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Status badge */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">Commerce actif</span>
        </div>
        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? "bg-orange-500/15 border border-orange-500/30 text-orange-400"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              }`}>
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-orange-400" : "group-hover:text-gray-300"}`} />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge === "new" && (
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              )}
              {active && <ChevronRight className="h-3.5 w-3.5 text-orange-400/60 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-6 pt-6 border-t border-white/5 space-y-1">
        <Link href="/client" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Voir la boutique</span>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#161616] border-r border-white/5 shrink-0 fixed top-0 left-0 bottom-0 z-30">
        <Sidebar />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-[#161616] border-r border-white/5 flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0f0f0f]/90 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5">
            <Menu className="h-5 w-5 text-gray-400" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {NAV.find(n => pathname.startsWith(n.href))?.label || "Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/store/notifications" className="p-2 rounded-xl hover:bg-white/5 relative">
              <Bell className="h-4.5 w-4.5 text-gray-400" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-xs font-bold">
                {user?.storeName?.[0]?.toUpperCase() || "S"}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#161616] border-t border-white/5">
        <div className="grid grid-cols-5 h-16">
          {NAV.slice(0, 5).map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-orange-400" : "text-gray-600"
                }`}>
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
