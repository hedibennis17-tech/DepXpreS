"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Package, MapPin, Phone, Store, CheckCircle2, Navigation, Loader2, Clock, DollarSign } from "lucide-react";

export default function DriverOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string|null>(null);
  const [uid, setUid] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { setLoading(false); return; }
      setUid(u.uid);
      const q = query(
        collection(db, "orders"),
        where("driverId", "==", u.uid),
        where("status", "in", ["assigned","picked_up","en_route","arrived"])
      );
      const unsubOrders = onSnapshot(q, snap => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return () => unsubOrders();
    });
    return () => unsub();
  }, []);

  const NEXT_STATUS: Record<string, string> = {
    assigned: "picked_up",
    picked_up: "en_route",
    en_route: "delivered",
  };
  const NEXT_LABEL: Record<string, string> = {
    assigned: "✅ Commande récupérée",
    picked_up: "🚗 En route",
    en_route: "📦 Livraison confirmée",
  };

  async function advance(orderId: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: next,
        updatedAt: serverTimestamp(),
        ...(next === "delivered" ? { deliveredAt: serverTimestamp() } : {}),
      });
    } catch(e){ console.error(e); }
    finally { setUpdating(null); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-white">🚗 Mes livraisons</h1>

      {orders.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-3xl p-10 text-center border border-white/5">
          <Package className="h-12 w-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucune livraison active</p>
          <p className="text-gray-600 text-sm mt-1">Vous recevrez vos commandes ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-[#1a1a1a] rounded-3xl border border-orange-500/20 p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">{o.status?.replace("_"," ")}</span>
                </div>
                <span className="text-xs text-gray-500">#{o.orderNumber || o.id.slice(-6)}</span>
              </div>

              {/* Commerce */}
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
                <Store className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Récupérer chez</p>
                  <p className="text-sm font-bold text-white">{o.storeName || "Commerce"}</p>
                  {o.storeAddress && <p className="text-xs text-gray-500 mt-0.5">{o.storeAddress}</p>}
                </div>
              </div>

              {/* Livraison */}
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
                <Navigation className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Livrer à</p>
                  <p className="text-sm font-bold text-white">{o.deliveryAddress || "—"}</p>
                  {o.clientName && <p className="text-xs text-gray-500 mt-0.5">{o.clientName}</p>}
                </div>
              </div>

              {/* Articles */}
              {o.items && o.items.length > 0 && (
                <div className="space-y-1">
                  {o.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-gray-400">
                      <span>{item.name}</span>
                      <span>×{item.qty || 1}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Infos */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(o.deliveryFee || 5).toFixed(2)} frais</span>
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(o.total || 0).toFixed(2)} total</span>
              </div>

              {/* Contact */}
              {o.clientPhone && (
                <a href={`tel:${o.clientPhone}`}
                  className="flex items-center gap-2 text-blue-400 text-sm font-semibold hover:text-blue-300">
                  <Phone className="h-4 w-4" /> {o.clientPhone}
                </a>
              )}

              {/* Action */}
              {NEXT_STATUS[o.status] && (
                <button onClick={() => advance(o.id, o.status)} disabled={updating === o.id}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
                  {updating === o.id
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Mise à jour...</>
                    : NEXT_LABEL[o.status]}
                </button>
              )}
              {o.status === "delivered" && (
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-bold py-2">
                  <CheckCircle2 className="h-5 w-5" /> Livraison complétée !
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
