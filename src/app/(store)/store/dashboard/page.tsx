"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, DollarSign, Clock, Star, Bell,
  RefreshCw, ChevronRight, Store
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
  const [noStore, setNoStore] = useState(false);

  // Charger le storeId depuis localStorage
  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    if (!sid) {
      setNoStore(true);
      setLoading(false);
      return;
    }
    setStoreId(sid);
  }, []);

  // Écouter les commandes en temps réel
  useEffect(() => {
    if (!storeId) return;

    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Commandes récentes
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

    // Infos du store
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

  // Aucun dépanneur sélectionné
  if (noStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
          <Store className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun dépanneur sélectionné</h2>
        <p className="text-gray-500 text-sm max-w-xs mb-6">
          Vous êtes connecté en tant que Super Admin. Utilisez le menu de gauche pour choisir un dépanneur à gérer.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Recharger
        </button>
      </div>
    );
  }

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
        <button
          onClick={toggleOpen}
          disabled={togglingOpen}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-sm text-sm font-medium transition-all",
            isOpen
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          {togglingOpen ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              isOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
          )}
          {isOpen ? "Ouvert" : "Fermé"}
        </button>
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
            <div key={s.label} className={cn("rounded-2xl border-0 shadow-sm p-4", s.bg)}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={cn("h-4 w-4", s.color)} />
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-gray-900">Commandes récentes</h2>
          <button
            onClick={() => router.push("/store/orders")}
            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Voir tout <ChevronRight className="h-4 w-4" />
          </button>
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
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status || "pending"])}>
                      {STATUS_LABELS[order.status || "pending"] || order.status}
                    </span>
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
        {[
          { href: "/store/orders", icon: ShoppingBag, color: "text-orange-500", label: "Gérer les commandes", desc: "Voir, accepter, préparer" },
          { href: "/store/catalog", icon: Store, color: "text-blue-500", label: "Mon catalogue", desc: "Produits, prix, stock" },
          { href: "/store/settlements", icon: DollarSign, color: "text-green-500", label: "Mes paiements", desc: "Revenus et virements" },
          { href: "/store/schedule", icon: Clock, color: "text-purple-500", label: "Mes horaires", desc: "Heures d'ouverture" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-orange-300 hover:shadow-md transition-all"
            >
              <Icon className={cn("h-6 w-6 mb-2", item.color)} />
              <p className="font-semibold text-sm text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
