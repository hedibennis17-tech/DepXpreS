"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { DollarSign, TrendingUp, Package, Clock, Loader2, ArrowUpRight, Wallet, Star } from "lucide-react";

export default function DriverEarnings() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0, deliveries: 0 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { setLoading(false); return; }

      // Wallet temps réel
      const unsubWallet = onSnapshot(doc(db, "wallets", u.uid), snap => {
        if (snap.exists()) setWallet(snap.data());
        setLoading(false);
      });

      // Transactions temps réel
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", u.uid),
        where("type", "==", "driver_earning"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const unsubTx = onSnapshot(q, snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(list);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let today = 0, week = 0, month = 0, total = 0, deliveries = 0;
        list.forEach((t: any) => {
          const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
          total += t.amount || 0;
          deliveries++;
          if (d >= todayStart) today += t.amount || 0;
          if (d >= weekStart) week += t.amount || 0;
          if (d >= monthStart) month += t.amount || 0;
        });
        setStats({ today, week, month, total, deliveries });
      });

      return () => { unsubWallet(); unsubTx(); };
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
      <h1 className="text-xl font-black text-white">💰 Mes gains</h1>

      {/* Wallet solde */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 opacity-80" />
          <p className="text-sm font-medium opacity-80">Solde disponible</p>
        </div>
        <p className="text-4xl font-black">{fmt(wallet?.balance || 0)}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <div>
            <p className="text-xs opacity-70">Total gagné</p>
            <p className="font-bold">{fmt(wallet?.totalEarnings || stats.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Livraisons</p>
            <p className="font-bold">{wallet?.deliveriesCount || stats.deliveries}</p>
          </div>
        </div>
      </div>

      {/* Stats périodes */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aujourd'hui", value: stats.today, icon: "☀️" },
          { label: "7 jours", value: stats.week, icon: "📅" },
          { label: "Ce mois", value: stats.month, icon: "📆" },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] rounded-2xl p-3 text-center border border-white/5">
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="text-white font-black text-lg">{fmt(s.value)}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Historique transactions */}
      <div>
        <p className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Historique</p>
        {transactions.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center border border-white/5">
            <DollarSign className="h-8 w-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune transaction</p>
            <p className="text-gray-600 text-xs mt-1">Vos gains apparaîtront ici après chaque livraison</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => {
              const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
              return (
                <div key={t.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.description}</p>
                    <p className="text-xs text-gray-500">
                      {date.toLocaleDateString("fr-CA")} · {t.paymentMethod || "cash"}
                      {t.tip > 0 && ` · Pourboire: $${t.tip.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="text-green-400 font-black shrink-0">+{fmt(t.amount)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
