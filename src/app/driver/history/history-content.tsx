"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Package, Clock, MapPin, CheckCircle2, XCircle, Loader2, Star } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  delivered: { label: "Livré", color: "text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Annulé", color: "text-red-400", icon: XCircle },
  assigned:  { label: "Assigné", color: "text-blue-400", icon: Package },
  en_route:  { label: "En route", color: "text-orange-400", icon: MapPin },
};

export default function DriverHistory() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setLoading(false); return; }
      try {
        const snap = await getDocs(query(
          collection(db, "orders"),
          where("driverId", "==", u.uid),
          orderBy("createdAt", "desc"),
          limit(100)
        ));
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-white">📋 Historique</h1>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[["all","Toutes"],["delivered","Livrées"],["cancelled","Annulées"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === v ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 border border-white/10"
            }`}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-3xl p-10 text-center border border-white/5">
          <Package className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aucune livraison trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => {
            const s = STATUS_LABELS[o.status] || STATUS_LABELS.assigned;
            const Icon = s.icon;
            return (
              <div key={o.id} className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{o.storeName || "Commerce"}</p>
                    <p className="text-xs text-gray-500">
                      {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString("fr-CA", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${s.color}`}>
                    <Icon className="h-3.5 w-3.5" />{s.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {o.deliveryAddress?.slice(0, 30) || "—"}
                  </span>
                  <span className="flex items-center gap-1 ml-auto text-green-400 font-bold">
                    +${(o.driverFee || o.deliveryFee || 5).toFixed(2)}
                  </span>
                </div>
                {o.orderNumber && (
                  <p className="text-[10px] text-gray-600">#{o.orderNumber}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
