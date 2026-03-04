"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, Package, ChevronLeft, Navigation, CheckCircle2, Clock, Store, Truck } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
  id: string;
  status: string;
  store_name: string;
  store_phone?: string;
  store_address?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  delivery_fee: number;
  tps: number;
  tvq: number;
  total: number;
  delivery_address: string;
  created_at: string;
  estimated_delivery?: string;
  driver_name?: string;
  driver_phone?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pending:   { label: "En attente",       icon: "⏳", color: "text-gray-600",   bg: "bg-gray-100" },
  confirmed: { label: "Confirmée",        icon: "✅", color: "text-blue-600",   bg: "bg-blue-100" },
  preparing: { label: "En préparation",   icon: "🏪", color: "text-yellow-600", bg: "bg-yellow-100" },
  assigned:  { label: "Chauffeur assigné",icon: "🚗", color: "text-indigo-600", bg: "bg-indigo-100" },
  picked_up: { label: "Ramassée",         icon: "📦", color: "text-orange-600", bg: "bg-orange-100" },
  en_route:  { label: "En route",         icon: "🚗", color: "text-purple-600", bg: "bg-purple-100" },
  arrived:   { label: "Arrivé",           icon: "📍", color: "text-teal-600",   bg: "bg-teal-100" },
  delivered: { label: "Livrée",           icon: "🎉", color: "text-green-600",  bg: "bg-green-100" },
  completed: { label: "Terminée",         icon: "🏁", color: "text-green-700",  bg: "bg-green-100" },
  cancelled: { label: "Annulée",          icon: "❌", color: "text-red-600",    bg: "bg-red-100" },
};

const WORKFLOW_STEPS = ["confirmed", "preparing", "assigned", "picked_up", "en_route", "arrived", "delivered"];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/client/login"); return; }
      if (!orderId) return;
      try {
        const res = await fetch(`/api/client/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [router, orderId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!order) return <div className="container py-8 text-center"><p>Commande introuvable.</p><Button asChild className="mt-4"><Link href="/client/orders">Retour</Link></Button></div>;

  const cfg = STATUS_CONFIG[order.status] || { label: order.status, icon: "📦", color: "text-gray-600", bg: "bg-gray-100" };
  const stepIndex = WORKFLOW_STEPS.indexOf(order.status);
  const isActive = ["pending", "confirmed", "preparing", "assigned", "picked_up", "en_route", "arrived"].includes(order.status);

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/orders"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-xl font-bold">Commande #{orderId.slice(-6).toUpperCase()}</h1>
      </div>

      {/* Statut */}
      <Card className={`border-0 ${cfg.bg}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cfg.icon}</span>
            <div>
              <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
              <p className="text-xs text-muted-foreground">{order.created_at}</p>
            </div>
            {isActive && (
              <Button size="sm" asChild className="ml-auto bg-orange-500 hover:bg-orange-600">
                <Link href={`/client/track/${orderId}`}>
                  <Navigation className="h-3 w-3 mr-1" /> Suivre
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression */}
      {isActive && stepIndex >= 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              {WORKFLOW_STEPS.map((step, i) => {
                const s = STATUS_CONFIG[step];
                const done = i <= stepIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${done ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className={`h-0.5 w-full ${done ? "bg-orange-500" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dépanneur */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Store className="h-4 w-4" /> Dépanneur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{order.store_name}</p>
          {order.store_address && <p className="text-sm text-muted-foreground">{order.store_address}</p>}
          {order.store_phone && (
            <a href={`tel:${order.store_phone}`} className="text-sm text-orange-600 flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" /> {order.store_phone}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Chauffeur */}
      {order.driver_name && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> Chauffeur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{order.driver_name}</p>
            {order.driver_phone && (
              <a href={`tel:${order.driver_phone}`} className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" /> {order.driver_phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adresse livraison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Adresse de livraison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{order.delivery_address || "Non spécifiée"}</p>
          {order.notes && <p className="text-xs text-muted-foreground mt-1">Note : {order.notes}</p>}
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" /> Articles commandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span><span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span><span>${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TPS (5%)</span><span>${order.tps.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVQ (9,975%)</span><span>${order.tvq.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span><span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
