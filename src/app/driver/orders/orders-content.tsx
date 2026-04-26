"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Package, MapPin, Phone, Store, CheckCircle2, Navigation,
  Loader2, DollarSign, Star, X, Camera, AlertTriangle,
  Clock, ChevronRight, ThumbsUp, ThumbsDown, Bike
} from "lucide-react";

// ─── Statuts du flow complet ───────────────────────────────────────────────
// assigned → navigating_pickup → arrived_store → picked_up →
// navigating_dropoff → arrived_client → delivered → rated

const REFUSE_REASONS = [
  "Trop loin", "Pas assez payante", "Pause / toilettes",
  "Problème véhicule", "Zone dangereuse", "Autre",
];

interface Order {
  id: string; status: string; orderNumber?: string;
  storeName?: string; storeAddress?: string; storeLat?: number; storeLng?: number; storePhone?: string;
  clientName?: string; clientPhone?: string; deliveryAddress?: string;
  deliveryLat?: number; deliveryLng?: number; deliveryInstructions?: string;
  deliveryType?: "door" | "meet"; total?: number; deliveryFee?: number;
  driverDistance?: number; driverEta?: string;
  items?: {name:string;qty:number}[];
}

export default function DriverOrders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [uid, setUid] = useState("");
  const [updating, setUpdating] = useState<string|null>(null);
  // Modale refus
  const [refuseOrder, setRefuseOrder] = useState<Order|null>(null);
  const [refuseReason, setRefuseReason] = useState("");
  const [refuseNote, setRefuseNote] = useState("");
  // Modale photo
  const [photoOrder, setPhotoOrder] = useState<Order|null>(null);
  const [photoFile, setPhotoFile] = useState<File|null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // Modale rating
  const [ratingOrder, setRatingOrder] = useState<Order|null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { setLoading(false); return; }
      setUid(u.uid);
      const q = query(
        collection(db, "orders"),
        where("driverId", "==", u.uid),
        where("status", "in", [
          "assigned", "navigating_pickup", "arrived_store",
          "picked_up", "navigating_dropoff", "arrived_client", "delivered"
        ])
      );
      const unsubO = onSnapshot(q, snap => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false);
      });
      return () => unsubO();
    });
    return () => unsub();
  }, []);

  // ─── Navigation GPS ──────────────────────────────────────────────────────
  function navigateTo(o: Order, phase: "pickup"|"dropoff") {
    const dest  = phase==="pickup" ? o.storeAddress||"" : o.deliveryAddress||"";
    const lat   = phase==="pickup" ? o.storeLat||0      : o.deliveryLat||0;
    const lng   = phase==="pickup" ? o.storeLng||0      : o.deliveryLng||0;
    const p = new URLSearchParams({
      orderId:o.id, phase, dest,
      lat:String(lat), lng:String(lng),
      client:o.clientName||"", phone:o.clientPhone||"",
    });
    router.push(`/driver/navigation?${p.toString()}`);
  }

  // ─── Avancer le statut ───────────────────────────────────────────────────
  async function advance(orderId: string, newStatus: string, extra: Record<string,any>={}) {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db,"orders",orderId), {
        status: newStatus, updatedAt: serverTimestamp(), ...extra,
      });
    } catch(e){ console.error(e); }
    finally { setUpdating(null); }
  }

  // ─── Refuser commande ────────────────────────────────────────────────────
  async function submitRefuse() {
    if (!refuseOrder || !refuseReason) return;
    setUpdating(refuseOrder.id);
    try {
      await updateDoc(doc(db,"orders",refuseOrder.id), {
        status: "refused", refusedAt: serverTimestamp(),
        refuseReason, refuseNote, refusedBy: uid,
        driverId: null,
      });
      // Notif admin
      await addDoc(collection(db,"notifications"), {
        userId:"admin", userType:"admin", type:"order_refused",
        title:"❌ Commande refusée",
        body:`Commande #${refuseOrder.orderNumber||refuseOrder.id.slice(-6)} refusée: ${refuseReason}`,
        orderId:refuseOrder.id, read:false, createdAt:serverTimestamp(),
      });
      setRefuseOrder(null); setRefuseReason(""); setRefuseNote("");
    } catch(e){ console.error(e); }
    finally { setUpdating(null); }
  }

  // ─── Upload photo livraison ───────────────────────────────────────────────
  async function submitPhoto() {
    if (!photoOrder || !photoFile) return;
    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `delivery_photos/${photoOrder.id}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, photoFile);
      const url = await getDownloadURL(storageRef);
      await advance(photoOrder.id, "delivered", {
        deliveryPhotoUrl: url, deliveredAt: serverTimestamp(),
      });
      // Ouvrir rating
      setPhotoOrder(null); setPhotoFile(null); setPhotoPreview("");
      setRatingOrder(photoOrder);
    } catch(e){ console.error(e); }
    finally { setUploadingPhoto(false); }
  }

  // ─── Soumettre rating ─────────────────────────────────────────────────────
  async function submitRating() {
    if (!ratingOrder) return;
    setSubmittingRating(true);
    try {
      await advance(ratingOrder.id, "rated", { driverRating: stars, driverComment: comment });
      await addDoc(collection(db,"order_ratings"), {
        orderId:ratingOrder.id, driverId:uid,
        stars, comment, createdAt:serverTimestamp(),
      });
      setRatingOrder(null); setStars(5); setComment("");
    } catch(e){ console.error(e); }
    finally { setSubmittingRating(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-28">
      <h1 className="text-xl font-bold text-white">🚗 Mes livraisons</h1>

      {orders.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-3xl p-10 text-center border border-white/5">
          <Bike className="h-12 w-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucune livraison active</p>
          <p className="text-gray-600 text-sm mt-1">Les commandes assignées apparaissent ici</p>
        </div>
      ) : orders.map(o => (
        <OrderCard key={o.id} o={o} uid={uid} updating={updating}
          onNavigate={navigateTo} onAdvance={advance}
          onRefuse={() => setRefuseOrder(o)}
          onPhoto={() => setPhotoOrder(o)}
          onRate={() => setRatingOrder(o)}
        />
      ))}

      {/* ── MODALE REFUS ── */}
      {refuseOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-lg">Refuser la commande</p>
              <button onClick={() => setRefuseOrder(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm">Sélectionne une raison :</p>
            <div className="space-y-2">
              {REFUSE_REASONS.map(r => (
                <button key={r} onClick={() => setRefuseReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors ${
                    refuseReason===r ? "border-red-500 bg-red-500/10 text-red-400" : "border-white/10 text-gray-300"
                  }`}>{r}</button>
              ))}
            </div>
            <textarea value={refuseNote} onChange={e=>setRefuseNote(e.target.value)}
              placeholder="Note additionnelle (optionnel)"
              className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
              rows={2} />
            <button onClick={submitRefuse} disabled={!refuseReason || updating===refuseOrder.id}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {updating===refuseOrder.id ? <Loader2 className="h-5 w-5 animate-spin"/> : <ThumbsDown className="h-5 w-5"/>}
              Confirmer le refus
            </button>
          </div>
        </div>
      )}

      {/* ── MODALE PHOTO ── */}
      {photoOrder && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-white font-bold text-lg">📸 Photo de livraison obligatoire</p>
          <p className="text-gray-400 text-sm text-center">Prends une photo devant la porte du client</p>
          {photoPreview ? (
            <img src={photoPreview} className="w-full max-w-xs rounded-2xl object-cover" style={{maxHeight:280}} />
          ) : (
            <div onClick={() => fileRef.current?.click()}
              className="w-48 h-48 bg-[#1a1a1a] border-2 border-dashed border-orange-500/40 rounded-3xl flex flex-col items-center justify-center cursor-pointer gap-2">
              <Camera className="h-10 w-10 text-orange-400" />
              <p className="text-orange-400 text-sm font-semibold">Prendre une photo</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
            }} />
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={() => { setPhotoOrder(null); setPhotoFile(null); setPhotoPreview(""); }}
              className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold">Annuler</button>
            <button onClick={photoPreview ? submitPhoto : () => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex-1 bg-orange-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin"/> : photoPreview ? "✅ Confirmer" : <><Camera className="h-4 w-4"/>Photo</>}
            </button>
          </div>
        </div>
      )}

      {/* ── MODALE RATING ── */}
      {ratingOrder && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-white font-bold text-xl">Livraison complétée ! 🎉</p>
              <p className="text-gray-400 text-sm mt-1">#{ratingOrder.orderNumber||ratingOrder.id.slice(-6)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm text-center mb-3">Note ta livraison</p>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)}>
                    <Star className={`h-9 w-9 ${s<=stars ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={comment} onChange={e=>setComment(e.target.value)}
              placeholder="Commentaire (optionnel)"
              className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"
              rows={3} />
            <button onClick={submitRating} disabled={submittingRating}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {submittingRating ? <Loader2 className="h-5 w-5 animate-spin"/> : "Terminer la livraison"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant carte commande ─────────────────────────────────────────────
function OrderCard({ o, uid, updating, onNavigate, onAdvance, onRefuse, onPhoto, onRate }: {
  o: Order; uid: string; updating: string|null;
  onNavigate: (o:Order, phase:"pickup"|"dropoff")=>void;
  onAdvance: (id:string, status:string, extra?:Record<string,any>)=>void;
  onRefuse: ()=>void; onPhoto: ()=>void; onRate: ()=>void;
}) {
  const isUpdating = updating === o.id;

  const STATUS_LABEL: Record<string,string> = {
    assigned:            "🔔 Nouvelle commande",
    navigating_pickup:   "🗺️ Navigation vers commerce",
    arrived_store:       "🏪 Arrivé au commerce",
    picked_up:           "📦 Commande récupérée",
    navigating_dropoff:  "🚗 En route vers client",
    arrived_client:      "🏠 Arrivé chez le client",
    delivered:           "✅ Livré — en attente note",
  };

  const STATUS_COLOR: Record<string,string> = {
    assigned: "#f59e0b", navigating_pickup:"#3b82f6", arrived_store:"#8b5cf6",
    picked_up:"#f97316", navigating_dropoff:"#06b6d4", arrived_client:"#10b981",
    delivered:"#22c55e",
  };

  const color = STATUS_COLOR[o.status] || "#6b7280";

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border overflow-hidden" style={{borderColor:color+"33"}}>
      {/* Header statut */}
      <div className="px-5 py-3 flex items-center justify-between" style={{background:color+"11"}}>
        <span className="text-sm font-bold" style={{color}}>{STATUS_LABEL[o.status]||o.status}</span>
        <span className="text-xs text-gray-500">#{o.orderNumber||o.id.slice(-6)}</span>
      </div>

      <div className="p-5 space-y-4">

        {/* ── ÉTAPE 1 : Nouvelle commande ── */}
        {o.status === "assigned" && (
          <>
            {/* Infos commerce + distance */}
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
              <Store className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Commerce</p>
                <p className="text-sm font-bold text-white">{o.storeName}</p>
                <p className="text-xs text-gray-500">{o.storeAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
              <MapPin className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Livrer à</p>
                <p className="text-sm font-bold text-white">{o.deliveryAddress}</p>
              </div>
            </div>
            {/* Distance + montant */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {icon:"📍", label:"Distance", val: o.driverDistance ? `${o.driverDistance.toFixed(1)} km` : "—"},
                {icon:"⏱️", label:"ETA store", val: o.driverEta || "—"},
                {icon:"💵", label:"Vos gains", val: `$${((o.deliveryFee||5)*0.8).toFixed(2)}`},
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-2xl p-3 text-center">
                  <p className="text-lg">{item.icon}</p>
                  <p className="text-white font-bold text-sm">{item.val}</p>
                  <p className="text-gray-500 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
            {/* Articles */}
            {o.items && o.items.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                {o.items.slice(0,4).map((item,i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-400">
                    <span>{item.name}</span><span>×{item.qty||1}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Accepter / Refuser */}
            <div className="flex gap-3">
              <button onClick={onRefuse}
                className="flex-1 py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2">
                <ThumbsDown className="h-4 w-4" />Refuser
              </button>
              <button onClick={() => onAdvance(o.id, "navigating_pickup")} disabled={isUpdating}
                className="flex-[2] py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <><ThumbsUp className="h-4 w-4"/>Accepter</>}
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 2 : Navigation vers commerce ── */}
        {o.status === "navigating_pickup" && (
          <>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <Store className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs text-blue-400 font-semibold">Destination</p>
                <p className="text-sm font-bold text-white">{o.storeName}</p>
                <p className="text-xs text-gray-400">{o.storeAddress}</p>
              </div>
            </div>
            <button onClick={() => onNavigate(o,"pickup")}
              className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2">
              <Navigation className="h-5 w-5"/>Ouvrir la navigation GPS
            </button>
            <button onClick={() => onAdvance(o.id,"arrived_store")} disabled={isUpdating}
              className="w-full py-3 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "🏪 Je suis arrivé au commerce"}
            </button>
          </>
        )}

        {/* ── ÉTAPE 3 : Arrivé au commerce ── */}
        {o.status === "arrived_store" && (
          <>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center">
              <p className="text-purple-300 font-bold text-lg">🏪 Vous êtes au commerce</p>
              <p className="text-gray-400 text-sm mt-1">Récupérez la commande puis appuyez sur le bouton</p>
            </div>
            {o.storePhone && (
              <a href={`tel:${o.storePhone}`} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 text-blue-400 font-semibold text-sm">
                <Phone className="h-4 w-4"/>Appeler le commerce
              </a>
            )}
            {o.items && o.items.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                <p className="text-xs text-gray-400 font-semibold mb-2">Articles à récupérer :</p>
                {o.items.map((item,i) => (
                  <div key={i} className="flex justify-between text-sm text-white">
                    <span>{item.name}</span><span className="text-orange-400">×{item.qty||1}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => onAdvance(o.id,"picked_up")} disabled={isUpdating}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {isUpdating ? <Loader2 className="h-5 w-5 animate-spin"/> : <><CheckCircle2 className="h-5 w-5"/>📦 Commande récupérée</>}
            </button>
          </>
        )}

        {/* ── ÉTAPE 4 : Commande récupérée → navigation client ── */}
        {o.status === "picked_up" && (
          <>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
              <p className="text-orange-400 font-bold">📦 Commande en main</p>
              <p className="text-white font-semibold mt-1">{o.deliveryAddress}</p>
              {o.clientName && <p className="text-gray-400 text-sm mt-0.5">Pour : {o.clientName}</p>}
              {o.deliveryInstructions && (
                <div className="mt-2 p-2 bg-white/5 rounded-xl">
                  <p className="text-xs text-yellow-400 font-semibold">📋 Instructions client :</p>
                  <p className="text-xs text-gray-300 mt-0.5">{o.deliveryInstructions}</p>
                </div>
              )}
              {o.deliveryType === "door" && (
                <p className="text-xs text-orange-300 mt-2 font-semibold">⚠️ Livraison devant la porte — photo obligatoire</p>
              )}
            </div>
            {o.clientPhone && (
              <a href={`tel:${o.clientPhone}`} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 text-green-400 font-semibold text-sm">
                <Phone className="h-4 w-4"/>Appeler le client
              </a>
            )}
            <button onClick={() => onNavigate(o,"dropoff")}
              className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2">
              <Navigation className="h-5 w-5"/>Naviguer vers le client
            </button>
            <button onClick={() => onAdvance(o.id,"navigating_dropoff")} disabled={isUpdating}
              className="w-full py-2.5 rounded-2xl border border-white/10 text-gray-400 text-sm flex items-center justify-center gap-2">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Continuer sans GPS"}
            </button>
          </>
        )}

        {/* ── ÉTAPE 5 : Navigation vers client ── */}
        {o.status === "navigating_dropoff" && (
          <>
            <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-cyan-400 font-semibold">Destination client</p>
                <p className="text-sm font-bold text-white">{o.deliveryAddress}</p>
                <p className="text-xs text-gray-400">{o.clientName}</p>
              </div>
            </div>
            <button onClick={() => onNavigate(o,"dropoff")}
              className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-bold flex items-center justify-center gap-2">
              <Navigation className="h-5 w-5"/>Ouvrir la navigation GPS
            </button>
            <button onClick={() => onAdvance(o.id,"arrived_client")} disabled={isUpdating}
              className="w-full py-3 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "🏠 Je suis arrivé chez le client"}
            </button>
          </>
        )}

        {/* ── ÉTAPE 6 : Arrivé chez le client ── */}
        {o.status === "arrived_client" && (
          <>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
              <p className="text-green-400 font-bold text-lg">🏠 Vous êtes chez le client</p>
              {o.deliveryType === "meet" ? (
                <p className="text-gray-300 text-sm mt-1">Remise en main propre au client</p>
              ) : (
                <p className="text-orange-300 text-sm mt-1 font-semibold">📸 Photo obligatoire avant la porte</p>
              )}
            </div>
            {o.clientPhone && (
              <a href={`tel:${o.clientPhone}`} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 text-green-400 font-semibold text-sm">
                <Phone className="h-4 w-4"/>Appeler le client
              </a>
            )}
            {o.deliveryInstructions && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-xs text-yellow-400 font-semibold">📋 Instructions</p>
                <p className="text-sm text-gray-300 mt-1">{o.deliveryInstructions}</p>
              </div>
            )}
            {o.deliveryType === "door" ? (
              <button onClick={onPhoto}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2">
                <Camera className="h-5 w-5"/>📸 Prendre la photo et livrer
              </button>
            ) : (
              <button onClick={() => onAdvance(o.id,"delivered",{deliveredAt:serverTimestamp()})} disabled={isUpdating}
                className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin"/> : <><CheckCircle2 className="h-5 w-5"/>Commande livrée ✅</>}
              </button>
            )}
          </>
        )}

        {/* ── ÉTAPE 7 : Livré → Rating ── */}
        {o.status === "delivered" && (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-white font-bold">Commande livrée !</p>
            <button onClick={onRate}
              className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-bold flex items-center justify-center gap-2">
              <Star className="h-5 w-5"/>⭐ Évaluer et terminer
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
