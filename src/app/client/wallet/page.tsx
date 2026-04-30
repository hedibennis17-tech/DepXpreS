"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Wallet, Star, ArrowDownLeft, Package, Loader2, Gift } from "lucide-react";

export default function ClientWalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push("/client/login"); return; }

      // Wallet temps réel
      const unsubW = onSnapshot(doc(db, "wallets", u.uid), snap => {
        if (snap.exists()) setWallet(snap.data());
        setLoading(false);
      });

      // Historique commandes payées
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", u.uid),
        where("type", "==", "client_payment"),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      const unsubTx = onSnapshot(q, snap => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => { unsubW(); unsubTx(); };
    });
    return () => unsub();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  );

  const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b px-4 pt-12 pb-4">
        <h1 className="text-xl font-black text-gray-900">Mon compte</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Solde + Points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-500 rounded-3xl p-4 text-white">
            <Wallet className="h-5 w-5 mb-2 opacity-80" />
            <p className="text-2xl font-black">{fmt(wallet?.balance || 0)}</p>
            <p className="text-xs opacity-80 mt-0.5">Crédit FastDép</p>
          </div>
          <div className="bg-yellow-400 rounded-3xl p-4 text-yellow-900">
            <Star className="h-5 w-5 mb-2 opacity-80" />
            <p className="text-2xl font-black">{wallet?.loyaltyPoints || 0}</p>
            <p className="text-xs opacity-80 mt-0.5">Points fidélité</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{wallet?.ordersCount || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-orange-500">{fmt(wallet?.totalSpent || 0)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total dépensé</p>
            </div>
          </div>
        </div>

        {/* Points fidélité info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-yellow-600 shrink-0" />
          <p className="text-xs text-yellow-700">
            <strong>1 point = 1$</strong> dépensé · Échangeables en crédit FastDép
          </p>
        </div>

        {/* Historique */}
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Historique</p>
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(t => {
                const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
                return (
                  <div key={t.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.description}</p>
                      <p className="text-xs text-gray-400">
                        {date.toLocaleDateString("fr-CA")} · {t.paymentMethod}
                      </p>
                    </div>
                    <p className="text-red-500 font-black shrink-0">-{fmt(t.total)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
