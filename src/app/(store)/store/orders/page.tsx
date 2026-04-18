"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShoppingBag, Clock, CheckCircle2, XCircle,
  ChevronRight, RefreshCw, Filter, Bell
} from "lucide-react";

interface Order {
  id: string;
  orderNumber?: string;
  clientName?: string;
  clientPhone?: string;
  total?: number;
  status?: string;
  createdAt?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  deliveryAddress?: string;
  notes?: string;
  preparationTime?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed:  "bg-blue-100 text-blue-800 border-blue-200",
  preparing:  "bg-orange-100 text-orange-800 border-orange-200",
  ready:      "bg-green-100 text-green-800 border-green-200",
  delivering: "bg-purple-100 text-purple-800 border-purple-200",
  completed:  "bg-gray-100 text-gray-700 border-gray-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
  driver_assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Nouvelle",
  confirmed:  "Confirmée",
  preparing:  "En préparation",
  ready:      "Prête",
  delivering: "En livraison",
  completed:  "Livrée",
  cancelled:  "Annulée",
  driver_assigned: "Chauffeur assigné",
};

const NEXT_STATUS: Record<string, { label: string; status: string; color: string }> = {
  pending:   { label: "Accepter la commande", status: "confirmed", color: "bg-blue-500 hover:bg-blue-600" },
  confirmed: { label: "Commencer la préparation", status: "preparing", color: "bg-orange-500 hover:bg-orange-600" },
  preparing: { label: "Commande prête", status: "ready", color: "bg-green-500 hover:bg-green-600" },
};

const TABS = [
  { key: "active", label: "Actives" },
  { key: "pending", label: "Nouvelles" },
  { key: "preparing", label: "En préparation" },
  { key: "completed", label: "Terminées" },
];

export default function StoreOrdersPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    const q = query(
      collection(db, "orders"),
      where("storeId", "==", storeId),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
      })) as Order[];
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [storeId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === "confirmed" && { confirmedAt: serverTimestamp() }),
        ...(newStatus === "preparing" && { preparingAt: serverTimestamp() }),
        ...(newStatus === "ready" && { readyAt: serverTimestamp() }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Annuler cette commande ?")) return;
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelReason: "Annulée par le commerce",
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === "active") return ["pending", "confirmed", "preparing", "ready"].includes(o.status || "");
    if (activeTab === "pending") return o.status === "pending";
    if (activeTab === "preparing") return ["confirmed", "preparing"].includes(o.status || "");
    if (activeTab === "completed") return ["completed", "delivered", "cancelled"].includes(o.status || "");
    return true;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} commande(s) au total</p>
      </div>

      {/* Alerte nouvelles commandes */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-500 text-white">
          <Bell className="h-5 w-5 animate-bounce flex-shrink-0" />
          <p className="font-semibold text-sm">
            {pendingCount} nouvelle{pendingCount > 1 ? "s" : ""} commande{pendingCount > 1 ? "s" : ""} à accepter !
          </p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.key === "active" && orders.filter(o => ["pending","confirmed","preparing","ready"].includes(o.status||"")).length > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {orders.filter(o => ["pending","confirmed","preparing","ready"].includes(o.status||"")).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const nextAction = NEXT_STATUS[order.status || ""];
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
              >
                {/* Header commande */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                    </span>
                    <Badge className={cn("text-xs border px-2", STATUS_COLORS[order.status || "pending"])}>
                      {STATUS_LABELS[order.status || "pending"] || order.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${(order.total || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                </div>

                {/* Infos client */}
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{order.clientName || "Client"}</p>
                  {order.deliveryAddress && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{order.deliveryAddress}</p>
                  )}
                  {order.notes && (
                    <p className="text-xs text-orange-600 mt-1 bg-orange-50 rounded px-2 py-1">
                      Note : {order.notes}
                    </p>
                  )}
                </div>

                {/* Articles */}
                {order.items && order.items.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            <span className="font-medium text-orange-600">{item.quantity}x</span> {item.name}
                          </span>
                          <span className="text-gray-500">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {nextAction && (
                  <div className="flex gap-2 px-4 pb-4">
                    <Button
                      onClick={() => updateStatus(order.id, nextAction.status)}
                      disabled={isUpdating}
                      className={cn("flex-1 h-10 text-white text-sm font-medium", nextAction.color)}
                    >
                      {isUpdating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-1.5" /> {nextAction.label}</>
                      )}
                    </Button>
                    {order.status === "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => cancelOrder(order.id)}
                        disabled={isUpdating}
                        className="h-10 px-3 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Voir détails */}
                <button
                  onClick={() => router.push(`/store/orders/${order.id}`)}
                  className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-gray-400 hover:text-orange-500 border-t transition-colors"
                >
                  Voir les détails <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
