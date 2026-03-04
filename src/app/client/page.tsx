"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { DeliveryInfoPanel } from "@/components/client/delivery-info-panel";
import { CategoryList } from "@/components/client/category-list";
import { ProductGrid } from "@/components/client/product-grid";
import { MapPanel } from "@/components/client/map-panel";
import { FloatingCartButton } from "@/components/client/floating-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Star, ChevronRight, ShoppingBag, Package, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ClientHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const res = await fetch(`/api/client/orders?uid=${u.uid}&limit=10`);
          const data = await res.json();
          const active = (data.orders || []).filter((o: { status: string }) =>
            ["pending", "confirmed", "preparing", "assigned", "picked_up", "en_route", "arrived"].includes(o.status)
          );
          setActiveOrdersCount(active.length);
        } catch {}
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-3 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
            <span className="font-semibold text-sm md:text-base">
              Livraison express en 30 min — Montréal & Laval
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Ouvert 24h/7j</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 ml-2">
              <Star className="h-3 w-3 fill-yellow-300 text-yellow-300 mr-1" />
              4.9 / 5
            </Badge>
          </div>
        </div>
      </div>

      {/* Promo Banner — masqué si connecté */}
      {!user && (
        <div className="bg-secondary/50 border-b py-2 px-4">
          <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              🎉 <strong>Première commande :</strong> Livraison gratuite avec le code{" "}
              <span className="font-mono font-bold text-primary">DEPXPRES1</span>
            </p>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto" asChild>
              <Link href="/client/signup">
                S&apos;inscrire <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Commandes actives — affiché si connecté et commandes en cours */}
      {user && activeOrdersCount > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 py-2 px-4">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {activeOrdersCount} commande{activeOrdersCount > 1 ? "s" : ""} en cours
              </span>
            </div>
            <Button variant="link" size="sm" className="text-orange-600 p-0 h-auto" asChild>
              <Link href="/client/orders">Suivre <ChevronRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      )}

      {/* Actions rapides — affiché si connecté */}
      {user && (
        <div className="border-b bg-background">
          <div className="container py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { href: "/client/orders", icon: ShoppingBag, label: "Commandes", color: "text-blue-600", bg: "bg-blue-50" },
                { href: "/client/wallet", icon: Package, label: "Portefeuille", color: "text-green-600", bg: "bg-green-50" },
                { href: "/client/profile", icon: CheckCircle2, label: "Profil", color: "text-orange-600", bg: "bg-orange-50" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${action.bg} whitespace-nowrap`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className={`text-xs font-medium ${action.color}`}>{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="hidden lg:block lg:col-span-3">
            <DeliveryInfoPanel />
          </div>
          {/* Center Column */}
          <div className="lg:col-span-6 space-y-8">
            <CategoryList />
            <ProductGrid />
          </div>
          {/* Right Column */}
          <div className="hidden lg:block lg:col-span-3">
            <MapPanel />
          </div>
        </div>
      </div>

      <FloatingCartButton />
    </div>
  );
}
