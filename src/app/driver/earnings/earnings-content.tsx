"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { DollarSign, TrendingUp, Package, Clock, Loader2, Calendar } from "lucide-react";

export default function DriverEarnings() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0, deliveries: 0 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setLoading(false); return; }
      try {
        const snap = await getDocs(query(
          collection(db, "orders"),
          where("driverId", "==", u.uid),
          where("status", "==", "delivered"),
          orderBy("createdAt", "desc"),
          limit(50)
        ));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(list);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let today = 0, week = 0, month = 0, total = 0;
        list.forEach((o: any) => {
          const fee = o.driverFee || o.deliveryFee || 5;
          const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
          total += fee;
          if (d >= todayStart) today += fee;
          if (d >= weekStart) week += fee;
          if (d >= monthStart) month += fee;
        });
        setStats({ today, week, month, total, deliveries: list.length });
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-white">💰 Mes gains</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Aujourd'hui", value: `$${stats.today.toFixed(2)}`, color: "text-green-400", bg: "bg-green-500/10", icon: DollarSign },
          { label: "Cette semaine", value: `$${stats.week.toFixed(2)}`, color: "text-blue-400", bg: "bg-blue-500/10", icon: Calendar },
          { label: "Ce mois", value: `$${stats.month.toFixed(2)}`, color: "text-purple-400", bg: "bg-purple-500/10", icon: TrendingUp },
          { label: "Total livraisons", value: String(stats.deliveries), color: "text-orange-400", bg: "bg-orange-500/10", icon: Package },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Historique des paiements */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Détail des livraisons</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune livraison complétée</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{o.storeName || "Commerce"}</p>
                  <p className="text-xs text-gray-500">
                    {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString("fr-CA") : "—"}
                  </p>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  +${(o.driverFee || o.deliveryFee || 5).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
