"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, XCircle, RefreshCw,
  MapPin, Phone, MessageSquare, Clock, Package
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  preparing:  "bg-orange-100 text-orange-800",
  ready:      "bg-green-100 text-green-800",
  delivering: "bg-purple-100 text-purple-800",
  completed:  "bg-gray-100 text-gray-700",
  cancelled:  "bg-red-100 text-red-700",
  driver_assigned: "bg-indigo-100 text-indigo-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    "Nouvelle commande",
  confirmed:  "Confirmée",
  preparing:  "En préparation",
  ready:      "Prête pour livraison",
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

export default function StoreOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as Record<string, any>);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!orderId) return;
    setUpdating(true);
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
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId || !confirm("Annuler cette commande ?")) return;
    setUpdating(true);
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
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Commande introuvable</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-3">
          Retour
        </Button>
      </div>
    );
  }

  const status = order.status as string || "pending";
  const nextAction = NEXT_STATUS[status];
  const items = (order.items as Array<{ name: string; quantity: number; price: number }>) || [];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </button>

      {/* En-tête commande */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {(order.orderNumber as string) || `#${orderId.slice(0, 8).toUpperCase()}`}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {order.createdAt ? new Date(order.createdAt as string).toLocaleString("fr-CA") : "—"}
            </p>
          </div>
          <Badge className={cn("text-sm px-3 py-1 border-0", STATUS_COLORS[status])}>
            {STATUS_LABELS[status] || status}
          </Badge>
        </div>

        {/* Timeline statut */}
        <div className="mt-4 flex items-center gap-1">
          {["pending", "confirmed", "preparing", "ready", "delivering", "completed"].map((s, i, arr) => {
            const statuses = ["pending", "confirmed", "preparing", "ready", "delivering", "completed"];
            const currentIdx = statuses.indexOf(status);
            const stepIdx = statuses.indexOf(s);
            const isDone = stepIdx <= currentIdx;
            const isCurrent = stepIdx === currentIdx;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  isDone ? "bg-orange-500" : "bg-gray-200",
                  isCurrent && "ring-2 ring-orange-300"
                )} />
                {i < arr.length - 1 && (
                  <div className={cn("flex-1 h-0.5", isDone && stepIdx < currentIdx ? "bg-orange-500" : "bg-gray-200")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Infos client */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3">Client</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xs">
                {((order.clientName as string) || "C")[0].toUpperCase()}
              </span>
            </div>
            <span className="font-medium">{(order.clientName as string) || "Client"}</span>
          </div>
          {order.clientPhone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${order.clientPhone}`} className="hover:text-orange-500">
                {order.clientPhone as string}
              </a>
            </div>
          )}
          {order.deliveryAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{order.deliveryAddress as string}</span>
            </div>
          )}
          {order.notes && (
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-orange-700 bg-orange-50 rounded px-2 py-1">{order.notes as string}</span>
            </div>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3">Articles commandés</h2>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun article</p>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-lg text-orange-500">
            ${((order.total as number) || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Temps de préparation */}
      {order.preparationTime && (
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-orange-800">Temps de préparation estimé</p>
            <p className="text-xs text-orange-600">{order.preparationTime as number} minutes</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {nextAction && (
        <div className="flex gap-3">
          <Button
            onClick={() => updateStatus(nextAction.status)}
            disabled={updating}
            className={cn("flex-1 h-12 text-white font-medium text-base", nextAction.color)}
          >
            {updating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <><CheckCircle2 className="h-5 w-5 mr-2" /> {nextAction.label}</>
            )}
          </Button>
          {status === "pending" && (
            <Button
              variant="outline"
              onClick={cancelOrder}
              disabled={updating}
              className="h-12 px-4 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {status === "cancelled" && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center text-red-600 text-sm">
          Cette commande a été annulée
          {order.cancelReason && <p className="text-xs mt-1 text-red-400">{order.cancelReason as string}</p>}
        </div>
      )}

      {(status === "completed" || status === "delivered") && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center text-green-600 text-sm">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-1" />
          Commande livrée avec succès !
        </div>
      )}
    </div>
  );
}
