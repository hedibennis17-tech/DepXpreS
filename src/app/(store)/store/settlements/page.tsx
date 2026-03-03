"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Clock, CheckCircle2,
  RefreshCw, ChevronRight, AlertCircle, Download
} from "lucide-react";

interface Settlement {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  status?: string;
  totalOrders?: number;
  grossRevenue?: number;
  platformFee?: number;
  netAmount?: number;
  paidAt?: string;
  createdAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  calculated: "bg-blue-100 text-blue-800",
  confirmed:  "bg-indigo-100 text-indigo-800",
  paid:       "bg-green-100 text-green-800",
  failed:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "En attente",
  calculated: "Calculé",
  confirmed:  "Confirmé",
  paid:       "Payé",
  failed:     "Échoué",
};

export default function StoreSettlementsPage() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeId, setStoreId] = useState("");
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    const loadSettlements = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await fetch(`/api/store/settlements?storeId=${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        const list: Settlement[] = data.settlements || [];
        setSettlements(list);

        setTotalPaid(list.filter(s => s.status === "paid").reduce((sum, s) => sum + (s.netAmount || 0), 0));
        setTotalPending(list.filter(s => s.status !== "paid" && s.status !== "failed").reduce((sum, s) => sum + (s.netAmount || 0), 0));
      } catch (e) {
        setError("Impossible de charger les règlements");
      } finally {
        setLoading(false);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadSettlements();
      else setLoading(false);
    });

    return () => unsub();
  }, [storeId]);

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
        <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>
        <p className="text-gray-500 text-sm mt-0.5">Historique des règlements et virements</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-600 font-medium">Total reçu</p>
          </div>
          <p className="text-2xl font-bold text-green-700">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-yellow-600" />
            <p className="text-xs text-yellow-600 font-medium">En attente</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Liste des règlements */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-gray-900">Historique des règlements</h2>
        </div>

        {settlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <DollarSign className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Aucun règlement pour le moment</p>
            <p className="text-xs mt-1">Les règlements apparaissent après chaque période de facturation</p>
          </div>
        ) : (
          <div className="divide-y">
            {settlements.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {s.periodStart && s.periodEnd
                        ? `${new Date(s.periodStart).toLocaleDateString("fr-CA")} – ${new Date(s.periodEnd).toLocaleDateString("fr-CA")}`
                        : s.id.slice(0, 12)}
                    </span>
                    <Badge className={cn("text-xs border-0 px-2", STATUS_COLORS[s.status || "pending"])}>
                      {STATUS_LABELS[s.status || "pending"]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{s.totalOrders || 0} commande(s)</span>
                    <span>•</span>
                    <span>Brut: ${(s.grossRevenue || 0).toFixed(2)}</span>
                    <span>•</span>
                    <span>Frais: ${(s.platformFee || 0).toFixed(2)}</span>
                  </div>
                  {s.paidAt && (
                    <p className="text-xs text-green-600 mt-0.5">
                      Payé le {new Date(s.paidAt).toLocaleDateString("fr-CA")}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "font-bold text-lg",
                    s.status === "paid" ? "text-green-600" : "text-gray-900"
                  )}>
                    ${(s.netAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">Net</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info commission */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Comment fonctionnent les règlements ?</p>
        <p className="text-xs text-blue-600">
          Les règlements sont calculés chaque semaine. FastDép retient une commission sur chaque commande.
          Le montant net vous est versé par virement Interac ou dépôt direct.
          Contactez le support pour toute question.
        </p>
      </div>
    </div>
  );
}
