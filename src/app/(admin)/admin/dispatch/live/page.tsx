"use client";
import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import LiveOrderTracker from "@/components/admin/LiveOrderTracker";
import { Package, RefreshCw, ChevronRight } from "lucide-react";

const ACTIVE = ["assigned","navigating_pickup","arrived_store","picked_up","navigating_dropoff","arrived_client"];
const STATUS_LABELS: Record<string, string> = {
  assigned: "🚗 Assigné",
  navigating_pickup: "🗺️ En route → Store",
  arrived_store: "🏪 Au commerce",
  picked_up: "📦 Récupéré",
  navigating_dropoff: "🚀 En route → Client",
  arrived_client: "📍 Chez le client",
};

function LiveDispatchContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("status", "in", ACTIVE));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      if (!selected && list.length > 0) setSelected(list[0].id);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">🔴 Suivi Live Dispatch</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} commande{orders.length !== 1 ? "s" : ""} en cours · GPS temps réel</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Aucune livraison en cours</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">Commandes actives</p>
            {orders.map(o => (
              <button key={o.id} onClick={() => setSelected(o.id)}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all ${selected === o.id ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">#{o.orderNumber || o.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{o.storeName}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                      {o.driverLat && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />}
                    </div>
                    {o.driverName && <p className="text-xs text-gray-400 mt-1 truncate">🚗 {o.driverName}</p>}
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${selected === o.id ? "text-orange-400" : "text-gray-300"}`} />
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">#{orders.find(o => o.id === selected)?.orderNumber || selected.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{orders.find(o => o.id === selected)?.clientName} → {orders.find(o => o.id === selected)?.deliveryAddress}</p>
                  </div>
                  <a href={`/admin/orders/${selected}`} className="text-xs px-3 py-1.5 bg-gray-100 rounded-xl font-medium text-gray-700">Détail →</a>
                </div>
                <LiveOrderTracker orderId={selected} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Sélectionnez une commande</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <LiveDispatchContent />
    </Suspense>
  );
}
