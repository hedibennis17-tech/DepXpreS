"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, DollarSign, Clock, Star, Bell,
  TrendingUp, CheckCircle2, AlertCircle, RefreshCw,
  ChevronRight, Store
} from "lucide-react";

interface Order {
  id: string;
  orderNumber?: string;
  clientName?: string;
  total?: number;
  status?: string;
  createdAt?: string;
  items?: Array<{ name: string; quantity: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  preparing:  "bg-orange-100 text-orange-800",
  ready:      "bg-green-100 text-green-800",
  delivering: "bg-purple-100 text-purple-800",
  completed:  "bg-gray-100 text-gray-700",
  cancelled:  "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Nouvelle",
  confirmed:  "Confirmée",
  preparing:  "En préparation",
  ready:      "Prête",
  delivering: "En livraison",
  completed:  "Livrée",
  cancelled:  "Annulée",
};

export default function StoreDashboardPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("Mon Dépanneur");
  const [isOpen, setIsOpen] = useState(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingCount: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Charger le storeId depuis localStorage ou Firebase
  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  // Écouter les commandes en temps réel
  useEffect(() => {
    if (!storeId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Commandes récentes (toutes)
    const recentQ = query(
      collection(db, "orders"),
      where("storeId", "==", storeId),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubRecent = onSnapshot(recentQ, (snap) => {
      const orders = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
      })) as Order[];

      setRecentOrders(orders);

      // Calculer stats du jour
      const todayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        return new Date(o.createdAt) >= today;
      });

      const pending = orders.filter(o =>
        ["pending", "confirmed", "preparing"].includes(o.status || "")
      );

      setPendingOrders(pending);
      setStats(prev => ({
        ...prev,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingCount: pending.length,
      }));

      setLoading(false);
    }, (err) => {
      console.error("Orders listener error:", err);
      setLoading(false);
    });

    // Charger les infos du store
    const storeUnsub = onSnapshot(doc(db, "stores", storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStoreName(data.name || "Mon Dépanneur");
        setIsOpen(data.isOpen === true);
        setStats(prev => ({ ...prev, avgRating: data.rating || 0 }));
      }
    });

    return () => {
      unsubRecent();
      storeUnsub();
    };
  }, [storeId]);

  const toggleOpen = async () => {
    if (!storeId || togglingOpen) return;
    setTogglingOpen(true);
    try {
      await updateDoc(doc(db, "stores", storeId), {
        isOpen: !isOpen,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 shadow-sm border">
          <span className="text-sm font-medium text-gray-700">
            {isOpen ? "Ouvert" : "Fermé"}
          </span>
          <Switch
            checked={isOpen}
            onCheckedChange={toggleOpen}
            disabled={togglingOpen}
            className="data-[state=checked]:bg-green-500"
          />
          <div className={cn(
            "w-2 h-2 rounded-full",
            isOpen ? "bg-green-500 animate-pulse" : "bg-gray-300"
          )} />
        </div>
      </div>

      {/* Alerte commandes en attente */}
      {pendingOrders.length > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-colors"
          onClick={() => router.push("/store/orders")}
        >
          <Bell className="h-5 w-5 flex-shrink-0 animate-bounce" />
          <div className="flex-1">
            <p className="font-bold">
              {pendingOrders.length} commande{pendingOrders.length > 1 ? "s" : ""} en attente
            </p>
            <p className="text-orange-100 text-sm">Cliquez pour voir et traiter</p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </div>
      )}

      {/* Statistiques du jour */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Commandes aujourd'hui", value: stats.todayOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Revenus du jour", value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "En attente", value: stats.pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Note moyenne", value: `${(stats.avgRating || 0).toFixed(1)} ★`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={cn("border-0 shadow-sm", s.bg)}>
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={cn("h-4 w-4", s.color)} />
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-900">Commandes récentes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/store/orders")}
            className="text-orange-500 hover:text-orange-600 text-sm"
          >
            Voir tout <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShoppingBag className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentOrders.slice(0, 8).map(order => (
              <div
                key={order.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/store/orders/${order.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge className={cn("text-xs border-0 px-2", STATUS_COLORS[order.status || "pending"])}>
                      {STATUS_LABELS[order.status || "pending"] || order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.clientName || "Client"} •{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-900">${(order.total || 0).toFixed(2)}</p>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/store/orders")}
          className="bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md transition-all"
        >
          <ShoppingBag className="h-6 w-6 text-orange-500 mb-2" />
          <p className="font-semibold text-sm text-gray-900">Gérer les commandes</p>
          <p className="text-xs text-gray-500 mt-0.5">Voir, accepter, préparer</p>
        </button>
        <button
          onClick={() => router.push("/store/catalog")}
          className="bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md transition-all"
        >
          <Store className="h-6 w-6 text-blue-500 mb-2" />
          <p className="font-semibold text-sm text-gray-900">Mon catalogue</p>
          <p className="text-xs text-gray-500 mt-0.5">Produits, prix, stock</p>
        </button>
        <button
          onClick={() => router.push("/store/settlements")}
          className="bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md transition-all"
        >
          <DollarSign className="h-6 w-6 text-green-500 mb-2" />
          <p className="font-semibold text-sm text-gray-900">Mes paiements</p>
          <p className="text-xs text-gray-500 mt-0.5">Revenus et virements</p>
        </button>
        <button
          onClick={() => router.push("/store/schedule")}
          className="bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md transition-all"
        >
          <Clock className="h-6 w-6 text-purple-500 mb-2" />
          <p className="font-semibold text-sm text-gray-900">Mes horaires</p>
          <p className="text-xs text-gray-500 mt-0.5">Heures d'ouverture</p>
        </button>
      </div>
    </div>
  );
}
