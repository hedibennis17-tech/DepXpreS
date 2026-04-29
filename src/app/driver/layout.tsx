"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { Map, Package, Clock, DollarSign, User, Menu, X, Zap, LogOut, Bell, ChevronRight, FileText } from "lucide-react";

const NAV = [
  { href: "/driver/dashboard", label: "Dashboard",  icon: Map },
  { href: "/driver/orders",    label: "Livraisons", icon: Package },
  { href: "/driver/documents", label: "Documents",  icon: FileText },
  { href: "/driver/earnings",  label: "Gains",      icon: DollarSign },
  { href: "/driver/profile",   label: "Profil",     icon: User },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(false);

  // Pages publiques — pas besoin d'auth
  const isPublicPage = ["/driver/login", "/driver/signup"].some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isPublicPage) { setLoading(false); return; }
    // Timeout 8s — si Firebase IndexedDB bloqué, débloquer quand même
    const timeout = setTimeout(() => {
      setLoading(false);
      router.push("/driver/login");
    }, 8000);
    const unsub = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout);
      if (!u) { router.push("/driver/login"); return; }
      try {
        // Appels Firestore en parallele — 2x plus rapide
        const [userDoc, profileDoc] = await Promise.all([
          getDoc(doc(db, "app_users", u.uid)),
          getDoc(doc(db, "driver_profiles", u.uid)),
        ]);
        if (!userDoc.exists() || !["driver","super_admin"].includes(userDoc.data().role || "")) {
          router.push("/driver/login"); return;
        }
        setDriverName(userDoc.data().display_name || u.displayName || "Chauffeur");
        const profileData = profileDoc.exists() ? profileDoc.data() : {};
        const onboardingDone = profileData.onboarding_completed || profileData.wizard_completed;
        const currentPath = window.location.pathname;
        // Pages accessibles meme sans onboarding complete
        const exemptPaths = ["/driver/onboarding", "/driver/documents", "/driver/profile"];
        const isExempt = exemptPaths.some(p => currentPath.startsWith(p));
        if (!onboardingDone && !isExempt) {
          router.push("/driver/onboarding");
          return;
        }
      } catch {}
      finally { setLoading(false); }
    });
    return () => { unsub(); clearTimeout(timeout); };
  }, [router, isPublicPage]);

  // Afficher login/signup directement sans header ni nav
  if (isPublicPage) return <>{children}</>;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center" style={{boxShadow:"0 0 30px rgba(249,115,22,0.5)"}}>
          <Zap className="h-6 w-6 text-white fill-white animate-pulse" />
        </div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── TOP HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center" style={{boxShadow:"0 0 16px rgba(249,115,22,0.4)"}}>
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">FastDép</p>
              <p className="text-[10px] text-orange-400 font-semibold">Chauffeur</p>
            </div>
          </div>



          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/driver/notifications" className="p-2 rounded-xl hover:bg-white/5">
              <Bell className="h-5 w-5 text-gray-400" />
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="p-2 rounded-xl hover:bg-white/5">
              {menuOpen ? <X className="h-5 w-5 text-gray-400" /> : <Menu className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute top-14 right-4 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <p className="text-xs font-bold text-white">{driverName}</p>
              <p className="text-[10px] text-gray-500">Chauffeur partenaire</p>
            </div>
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                  pathname === item.href ? "text-orange-400" : "text-gray-400"
                }`}>
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {pathname === item.href && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            ))}
            <div className="border-t border-white/5">
              <button onClick={async () => { await signOut(auth); router.push("/driver/login"); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/5 text-gray-500 hover:text-red-400 transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="pt-14 pb-20">
        {children}
      </main>

      {/* ── BOTTOM NAV MOBILE ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111] border-t border-white/5">
        <div className="grid grid-cols-5 h-16">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  active ? "text-orange-400" : "text-gray-600 hover:text-gray-400"
                }`}>
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-orange-500/15" : ""}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
