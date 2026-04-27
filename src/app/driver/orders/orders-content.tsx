"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Package, MapPin, Phone, Store, CheckCircle2, Navigation,
  Loader2, Star, X, Camera, Clock, ThumbsUp, ThumbsDown, Bike
} from "lucide-react";

const REFUSE_REASONS = [
  "Trop loin","Pas assez payante","Pause / toilettes",
  "Problème véhicule","Zone dangereuse","Autre",
];

interface Order {
  id:string; status:string; orderNumber?:string;
  storeName?:string; storeAddress?:string; storeLat?:number; storeLng?:number; storePhone?:string;
  clientName?:string; clientPhone?:string; deliveryAddress?:string;
  deliveryLat?:number; deliveryLng?:number; deliveryInstructions?:string;
  deliveryType?:"door"|"meet"; total?:number; deliveryFee?:number;
  driverDistance?:number; driverEta?:string;
  items?:{name:string;qty:number;price?:number}[];
}

export default function DriverOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string|null>(null);
  // Modales
  const [refuseOrder, setRefuseOrder] = useState<Order|null>(null);
  const [refuseReason, setRefuseReason] = useState("");
  const [refuseNote, setRefuseNote] = useState("");
  const [photoOrder, setPhotoOrder] = useState<Order|null>(null);
  const [photoFile, setPhotoFile] = useState<File|null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<Order|null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{
      if(!u){setLoading(false);return;}
      setUid(u.uid);
      const q = query(collection(db,"orders"),
        where("driverId","==",u.uid),
        where("status","in",["assigned","navigating_pickup","arrived_store","picked_up","navigating_dropoff","arrived_client","delivered"])
      );
      const unsubO = onSnapshot(q, snap=>{
        setOrders(snap.docs.map(d=>({id:d.id,...d.data()} as Order)));
        setLoading(false);
      });
      return ()=>unsubO();
    });
    return ()=>unsub();
  },[]);

  // Appel API centralisée avec notifications
  async function doAction(orderId:string, action:string, extra:Record<string,any>={}) {
    setActing(orderId+action);
    try {
      const res = await fetch("/api/driver/order-action",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({orderId, driverId:uid, action, ...extra}),
      });
      const data = await res.json();
      if(!data.ok) console.error("Action error:", data.error);
    } catch(e){ console.error(e); }
    finally { setActing(null); }
  }

  // Refus
  async function submitRefuse(){
    if(!refuseOrder||!refuseReason) return;
    await doAction(refuseOrder.id,"refuse",{reason:refuseReason,note:refuseNote});
    setRefuseOrder(null); setRefuseReason(""); setRefuseNote("");
  }

  // Photo livraison
  async function submitPhoto(){
    if(!photoOrder||!photoFile) return;
    setUploadingPhoto(true);
    try{
      const storageRef = ref(storage,`delivery_photos/${photoOrder.id}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, photoFile);
      const url = await getDownloadURL(storageRef);
      await doAction(photoOrder.id,"delivered",{photoUrl:url});
      setPhotoOrder(null); setPhotoFile(null); setPhotoPreview("");
      setRatingOrder(photoOrder);
    }catch(e){console.error(e);}
    finally{setUploadingPhoto(false);}
  }

  // Rating
  async function submitRating(){
    if(!ratingOrder) return;
    await doAction(ratingOrder.id,"rated",{rating:stars,comment});
    setRatingOrder(null); setStars(5); setComment("");
  }

  function navigateTo(o:Order, phase:"pickup"|"dropoff"){
    const dest  = phase==="pickup" ? o.storeAddress||"" : o.deliveryAddress||"";
    const lat   = phase==="pickup" ? o.storeLat||0      : o.deliveryLat||0;
    const lng   = phase==="pickup" ? o.storeLng||0      : o.deliveryLng||0;
    router.push(`/driver/navigation?${new URLSearchParams({
      orderId:o.id, phase, dest,
      lat:String(lat), lng:String(lng),
      client:o.clientName||"", phone:o.clientPhone||"",
    })}`);
  }

  const isActing = (id:string, action:string) => acting === id+action;

  if(loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500"/></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-28">
      <h1 className="text-xl font-bold text-white">🚗 Mes livraisons</h1>

      {orders.length===0 ? (
        <div className="bg-[#1a1a1a] rounded-3xl p-10 text-center border border-white/5">
          <Bike className="h-12 w-12 text-gray-700 mx-auto mb-3"/>
          <p className="text-gray-400 font-medium">Aucune livraison active</p>
        </div>
      ) : orders.map(o=>(
        <div key={o.id} className="bg-[#1a1a1a] rounded-3xl border overflow-hidden" style={{borderColor:statusColor(o.status)+"33"}}>
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{background:statusColor(o.status)+"11"}}>
            <span className="text-sm font-bold" style={{color:statusColor(o.status)}}>{statusLabel(o.status)}</span>
            <span className="text-xs text-gray-500">#{o.orderNumber||o.id.slice(-6)}</span>
          </div>

          <div className="p-5 space-y-3">

            {/* ── ÉTAPE 1: Nouvelle commande ── */}
            {o.status==="assigned" && <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {e:"📍",l:"Distance",v:o.driverDistance?`${o.driverDistance.toFixed(1)} km`:"—"},
                  {e:"⏱️",l:"ETA",v:o.driverEta||"—"},
                  {e:"💵",l:"Gains",v:`$${((o.deliveryFee||5)*0.8).toFixed(2)}`},
                ].map(s=>(
                  <div key={s.l} className="bg-white/5 rounded-2xl p-3 text-center">
                    <p className="text-lg">{s.e}</p>
                    <p className="text-white font-bold text-sm">{s.v}</p>
                    <p className="text-gray-500 text-xs">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-orange-400 shrink-0"/>
                  <div><p className="text-xs text-gray-400">Commerce</p><p className="text-sm font-bold text-white">{o.storeName}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400 shrink-0"/>
                  <div><p className="text-xs text-gray-400">Livraison</p><p className="text-sm font-bold text-white">{o.deliveryAddress}</p></div>
                </div>
              </div>
              {o.items && o.items.length>0 && (
                <div className="bg-white/5 rounded-2xl p-3 space-y-1">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Articles</p>
                  {o.items.map((item,i)=>(
                    <div key={i} className="flex justify-between text-sm text-gray-300">
                      <span>{item.name}</span><span className="text-orange-400">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setRefuseOrder(o)}
                  className="flex-1 py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm flex items-center justify-center gap-2">
                  <ThumbsDown className="h-4 w-4"/>Refuser
                </button>
                <button onClick={()=>doAction(o.id,"accept")} disabled={!!acting}
                  className="flex-[2] py-3.5 rounded-2xl bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {isActing(o.id,"accept") ? <Loader2 className="h-4 w-4 animate-spin"/> : <><ThumbsUp className="h-4 w-4"/>Accepter</>}
                </button>
              </div>
            </>}

            {/* ── ÉTAPE 2: Navigation vers commerce ── */}
            {o.status==="navigating_pickup" && <>
              <InfoRow icon={<Store className="h-4 w-4 text-blue-400"/>} label="Commerce" value={`${o.storeName} — ${o.storeAddress}`}/>
              <button onClick={()=>navigateTo(o,"pickup")}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2">
                <Navigation className="h-5 w-5"/>Ouvrir la navigation GPS
              </button>
              <button onClick={()=>doAction(o.id,"arrived_store")} disabled={!!acting}
                className="w-full py-3 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
                {isActing(o.id,"arrived_store") ? <Loader2 className="h-4 w-4 animate-spin"/> : "🏪 Je suis arrivé au commerce"}
              </button>
            </>}

            {/* ── ÉTAPE 3: Arrivé au commerce ── */}
            {o.status==="arrived_store" && <>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center">
                <p className="text-purple-300 font-bold">🏪 Vous êtes au commerce</p>
                <p className="text-gray-400 text-sm mt-1">Récupérez la commande</p>
              </div>
              {o.storePhone && <CallBtn phone={o.storePhone} label="Appeler le commerce"/>}
              {o.items && o.items.length>0 && (
                <div className="bg-white/5 rounded-2xl p-3">
                  <p className="text-xs text-gray-400 font-semibold mb-2">Articles à récupérer</p>
                  {o.items.map((item,i)=>(
                    <div key={i} className="flex justify-between text-sm text-white py-0.5">
                      <span>{item.name}</span><span className="text-orange-400">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>doAction(o.id,"picked_up")} disabled={!!acting}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {isActing(o.id,"picked_up") ? <Loader2 className="h-5 w-5 animate-spin"/> : <><CheckCircle2 className="h-5 w-5"/>📦 Commande récupérée</>}
              </button>
            </>}

            {/* ── ÉTAPE 4: Commande récupérée → navigation client ── */}
            {o.status==="picked_up" && <>
              <InfoRow icon={<MapPin className="h-4 w-4 text-orange-400"/>} label={`Pour : ${o.clientName}`} value={o.deliveryAddress||""}/>
              {o.deliveryInstructions && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                  <p className="text-xs text-yellow-400 font-semibold">📋 Instructions</p>
                  <p className="text-xs text-gray-300 mt-1">{o.deliveryInstructions}</p>
                </div>
              )}
              {o.deliveryType==="door" && <p className="text-xs text-orange-300 font-semibold">⚠️ Photo obligatoire à la livraison</p>}
              {o.clientPhone && <CallBtn phone={o.clientPhone} label="Appeler le client"/>}
              <button onClick={()=>{doAction(o.id,"navigating_dropoff");navigateTo(o,"dropoff");}}
                className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2">
                <Navigation className="h-5 w-5"/>Naviguer vers le client
              </button>
            </>}

            {/* ── ÉTAPE 5: Navigation vers client ── */}
            {o.status==="navigating_dropoff" && <>
              <InfoRow icon={<MapPin className="h-4 w-4 text-cyan-400"/>} label={o.clientName||""} value={o.deliveryAddress||""}/>
              <button onClick={()=>navigateTo(o,"dropoff")}
                className="w-full py-4 rounded-2xl bg-cyan-500 text-white font-bold flex items-center justify-center gap-2">
                <Navigation className="h-5 w-5"/>Ouvrir la navigation GPS
              </button>
              <button onClick={()=>doAction(o.id,"arrived_client")} disabled={!!acting}
                className="w-full py-3 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
                {isActing(o.id,"arrived_client") ? <Loader2 className="h-4 w-4 animate-spin"/> : "🏠 Je suis arrivé chez le client"}
              </button>
            </>}

            {/* ── ÉTAPE 6: Arrivé chez client ── */}
            {o.status==="arrived_client" && <>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                <p className="text-green-400 font-bold text-lg">🏠 Vous êtes chez le client</p>
                {o.deliveryType==="door"
                  ? <p className="text-orange-300 text-sm mt-1 font-semibold">📸 Photo obligatoire</p>
                  : <p className="text-gray-300 text-sm mt-1">Remise en main propre</p>}
              </div>
              {o.deliveryInstructions && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                  <p className="text-xs text-yellow-400 font-semibold">📋 Instructions</p>
                  <p className="text-sm text-gray-300 mt-1">{o.deliveryInstructions}</p>
                </div>
              )}
              {o.clientPhone && <CallBtn phone={o.clientPhone} label="Appeler le client"/>}
              {o.deliveryType==="door" ? (
                <button onClick={()=>setPhotoOrder(o)}
                  className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5"/>📸 Prendre photo et livrer
                </button>
              ) : (
                <button onClick={()=>{doAction(o.id,"delivered");setRatingOrder(o);}} disabled={!!acting}
                  className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {isActing(o.id,"delivered") ? <Loader2 className="h-5 w-5 animate-spin"/> : <><CheckCircle2 className="h-5 w-5"/>Commande livrée ✅</>}
                </button>
              )}
            </>}

            {/* ── ÉTAPE 7: Livré → Rating ── */}
            {o.status==="delivered" && (
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto"/>
                <p className="text-white font-bold">Commande livrée!</p>
                <button onClick={()=>setRatingOrder(o)}
                  className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-bold flex items-center justify-center gap-2">
                  <Star className="h-5 w-5"/>⭐ Évaluer et terminer
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── MODALE REFUS ── */}
      {refuseOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-lg">Refuser la commande</p>
              <button onClick={()=>setRefuseOrder(null)}><X className="h-5 w-5 text-gray-400"/></button>
            </div>
            <p className="text-gray-400 text-sm">Raison :</p>
            <div className="space-y-2">
              {REFUSE_REASONS.map(r=>(
                <button key={r} onClick={()=>setRefuseReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors ${refuseReason===r?"border-red-500 bg-red-500/10 text-red-400":"border-white/10 text-gray-300"}`}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={refuseNote} onChange={e=>setRefuseNote(e.target.value)}
              placeholder="Note additionnelle..." rows={2}
              className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"/>
            <button onClick={submitRefuse} disabled={!refuseReason||!!acting}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {acting ? <Loader2 className="h-5 w-5 animate-spin"/> : <><ThumbsDown className="h-5 w-5"/>Confirmer le refus</>}
            </button>
          </div>
        </div>
      )}

      {/* ── MODALE PHOTO ── */}
      {photoOrder && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-white font-bold text-lg">📸 Photo obligatoire</p>
          <p className="text-gray-400 text-sm text-center">Prends une photo devant la porte</p>
          {photoPreview
            ? <img src={photoPreview} className="w-full max-w-xs rounded-2xl object-cover" style={{maxHeight:280}}/>
            : <div onClick={()=>fileRef.current?.click()}
                className="w-48 h-48 bg-[#1a1a1a] border-2 border-dashed border-orange-500/40 rounded-3xl flex flex-col items-center justify-center cursor-pointer gap-2">
                <Camera className="h-10 w-10 text-orange-400"/>
                <p className="text-orange-400 text-sm font-semibold">Prendre une photo</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f){setPhotoFile(f);setPhotoPreview(URL.createObjectURL(f));}}}/>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={()=>{setPhotoOrder(null);setPhotoFile(null);setPhotoPreview("");}}
              className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold">Annuler</button>
            <button onClick={photoPreview ? submitPhoto : ()=>fileRef.current?.click()} disabled={uploadingPhoto}
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
                <CheckCircle2 className="h-8 w-8 text-green-400"/>
              </div>
              <p className="text-white font-bold text-xl">Livraison complétée! 🎉</p>
              <p className="text-gray-400 text-sm mt-1">#{ratingOrder.orderNumber||ratingOrder.id.slice(-6)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm text-center mb-3">Note ta livraison</p>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(s=>(
                  <button key={s} onClick={()=>setStars(s)}>
                    <Star className={`h-9 w-9 ${s<=stars?"text-yellow-400 fill-yellow-400":"text-gray-600"}`}/>
                  </button>
                ))}
              </div>
            </div>
            <textarea value={comment} onChange={e=>setComment(e.target.value)}
              placeholder="Commentaire..." rows={3}
              className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none outline-none"/>
            <button onClick={submitRating} disabled={!!acting}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {acting ? <Loader2 className="h-5 w-5 animate-spin"/> : "Terminer la livraison"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function statusColor(s:string){
  const m:Record<string,string>={assigned:"#f59e0b",navigating_pickup:"#3b82f6",arrived_store:"#8b5cf6",picked_up:"#f97316",navigating_dropoff:"#06b6d4",arrived_client:"#10b981",delivered:"#22c55e"};
  return m[s]||"#6b7280";
}
function statusLabel(s:string){
  const m:Record<string,string>={assigned:"🔔 Nouvelle commande",navigating_pickup:"🗺️ En route vers commerce",arrived_store:"🏪 Arrivé au commerce",picked_up:"📦 Commande récupérée",navigating_dropoff:"🚗 En route vers client",arrived_client:"🏠 Arrivé chez client",delivered:"✅ Livré"};
  return m[s]||s;
}
function InfoRow({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){
  return(
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-bold text-white">{value}</p></div>
    </div>
  );
}
function CallBtn({phone,label}:{phone:string;label:string}){
  return(
    <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 text-green-400 font-semibold text-sm">
      <Phone className="h-4 w-4"/>{label}
    </a>
  );
}
