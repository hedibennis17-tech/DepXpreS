"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MapPin, ShoppingBag, User, Wallet, LogOut, Settings, Bell, ChevronDown, Zap } from "lucide-react";
import { Logo } from "../logo";

export function ClientHeader() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("Chomedey, Laval");
  const [cartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  const getInitials = (name: string | null) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-gray-950 text-gray-300 py-1.5 px-4 text-xs flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-orange-400 fill-orange-400" />
          <span>Livraison express 30 min</span>
          <span className="mx-2 text-gray-600">|</span>
          <span className="text-green-400 font-medium">● Ouvert</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Montréal & Grand Laval</span>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/client" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">FastDép</p>
              <p className="text-[10px] text-orange-500 font-semibold leading-none mt-0.5">EXPRESS</p>
            </div>
          </Link>

          {/* Zone selector */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors">
            <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">{zone}</span>
            <ChevronDown className="h-3 w-3 text-gray-500 shrink-0" />
          </button>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { href: "/client", label: "Accueil" },
              { href: "/client/orders", label: "Commandes" },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <Link href="/client/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <>
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                  <Bell className="h-5 w-5 text-gray-700" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors">
                      <Avatar className="h-7 w-7">
                        {user.photoURL && <AvatarImage src={user.photoURL} />}
                        <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-gray-800 hidden sm:block max-w-[80px] truncate">
                        {user.displayName?.split(" ")[0] || "Moi"}
                      </span>
                      <ChevronDown className="h-3 w-3 text-gray-500 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-semibold">{user.displayName || "Mon compte"}</p>
                      <p className="text-xs text-muted-foreground font-normal truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[
                      { href: "/client/profile", icon: User, label: "Profil" },
                      { href: "/client/orders", icon: ShoppingBag, label: "Mes commandes" },
                      { href: "/client/wallet", icon: Wallet, label: "Portefeuille" },
                      { href: "/client/settings", icon: Settings, label: "Paramètres" },
                    ].map(item => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />{item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => { await signOut(auth); router.push("/client/login"); }}
                      className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                  <Link href="/client/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-200">
                  <Link href="/client/signup">S&apos;inscrire</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl">
        <div className="grid grid-cols-4 h-16">
          {[
            { href: "/client", icon: "🏠", label: "Accueil" },
            { href: "/client/orders", icon: "📦", label: "Commandes" },
            { href: "/client/cart", icon: "🛒", label: "Panier" },
            { href: "/client/profile", icon: "👤", label: "Profil" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive(item.href) ? "text-orange-500" : "text-gray-400"
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
