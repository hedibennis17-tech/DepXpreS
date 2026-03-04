"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, ChevronRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  store_name: string;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
  estimated_delivery?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",       color: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmée",        color: "bg-blue-100 text-blue-700" },
  preparing: { label: "En préparation",   color: "bg-yellow-100 text-yellow-700" },
  assigned:  { label: "Chauffeur assigné",color: "bg-indigo-100 text-indigo-700" },
  picked_up: { label: "Ramassée",         color: "bg-orange-100 text-orange-700" },
  en_route:  { label: "En route",         color: "bg-purple-100 text-purple-700" },
  arrived:   { label: "Arrivé",           color: "bg-teal-100 text-teal-700" },
  delivered: { label: "Livrée",           color: "bg-green-100 text-green-700" },
  completed: { label: "Terminée",         color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée",          color: "bg-red-100 text-red-700" },
};

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "assigned", "picked_up", "en_route", "arrived"];

export default function ClientOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/client/login"); return; }
      setUser(u);
      try {
        const res = await fetch(`/api/client/orders?uid=${u.uid}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Mes Commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Aucune commande</h2>
          <p className="text-muted-foreground text-sm mb-6">Vous n&apos;avez pas encore passé de commande.</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/client">Commander maintenant</Link>
          </Button>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">En cours</h2>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} active />
                ))}
              </div>
            </div>
          )}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Historique</h2>
              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} active={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({ order, active }: { order: Order; active: boolean }) {
  const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
  return (
    <Card className={`hover:shadow-md transition-shadow ${active ? "border-orange-200 bg-orange-50/30" : ""}`}>
      <CardContent className="pt-4 pb-4">
        <Link href={`/client/orders/${order.id}`} className="block">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">{order.store_name}</span>
            </div>
            <Badge className={`text-xs border-0 ${cfg.color}`}>{cfg.label}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{order.items_count} article{order.items_count !== 1 ? "s" : ""} • ${order.total.toFixed(2)}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{order.created_at}</span>
            </div>
          </div>
          {active && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" asChild className="flex-1 h-8 text-xs">
                <Link href={`/client/track/${order.id}`}>
                  <MapPin className="h-3 w-3 mr-1" /> Suivre
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600">
                <Link href={`/client/orders/${order.id}`}>
                  Détails <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
