"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import {
  ArrowLeft, Phone, Star, MapPin, Clock, CheckCircle2,
  Package, Truck, Store, MessageCircle, Plus, Minus,
  ChevronRight, Navigation, Zap, Coffee, X
} from "lucide-react";

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

// ── Statuts avec progression ──────────────────────────────────────────────
const STEPS = [
  { key: "pending",             icon: "⏳", label: "Commande reçue",          sub: "Votre commande est confirmée" },
  { key: "assigned",            icon: "🚗", label: "Chauffeur assigné",        sub: "Un chauffeur prend en charge" },
  { key: "navigating_pickup",   icon: "🗺️", label: "En route vers le store",   sub: "Le chauffeur arrive au commerce" },
  { key: "arrived_store",       icon: "🏪", label: "Arrivé au commerce",       sub: "Récupération de votre commande" },
  { key: "picked_up",           icon: "📦", label: "Commande récupérée",       sub: "Le chauffeur est en route vers vous" },
  { key: "navigating_dropoff",  icon: "🚀", label: "En route vers vous",       sub: "Votre commande arrive bientôt!" },
  { key: "arrived_client",      icon: "📍", label: "Chauffeur arrivé",         sub: "Le chauffeur est devant chez vous" },
  { key: "delivered",           icon: "🎉", label: "Livré!",                   sub: "Profitez bien de votre commande" },
];

const STEP_IDX: Record<string, number> = {};
STEPS.forEach((s, i) => { STEP_IDX[s.key] = i; });

// ── Termes de rating positifs ─────────────────────────────────────────────
const TAGS_POSITIVE = [
  "⚡ Ultra rapide", "😊 Très sympa", "📦 Colis intact",
  "🎯 Précis & ponctuel", "🤝 Professionnel", "🔔 Bien communiqué",
  "🛡️ Livraison soignée", "⭐ Je recommande",
];
const TAGS_NEGATIVE = [
  "🐢 Un peu lent", "📞 Difficile à joindre", "📦 Emballage abîmé",
  "🗺️ Mauvaise adresse", "😕 Peu professionnel", "🔇 Pas de communication",
];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.Map) { resolve(); return; }
    const cb = `__gmclient${Date.now()}`;
    (window as any)[cb] = () => { delete (window as any)[cb]; resolve(); };
    const s = document.createElement("script");
    s.onerror = () => reject(new Error("Google Maps non disponible"));
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=${cb}`;
    document.head.appendChild(s);
    setTimeout(() => reject(new Error("Timeout")), 15000);
  });
}

export default function TrackOrderPage() {
  const router = useRouter();
  const { orderId } = useParams() as { orderId: string };
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const driverMk = useRef<any>(null);
  const storeMk = useRef<any>(null);
  const clientMk = useRef<any>(null);
  const routeLine = useRef<any>(null);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [ratingDone, setRatingDone] = useState(false);
  const [tipDone, setTipDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Auth + Firestore realtime ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push("/client/login"); return; }
      const unsubOrder = onSnapshot(doc(db, "orders", orderId), snap => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
          if (snap.data()?.status === "delivered" && !ratingDone) {
            setTimeout(() => setShowRating(true), 2000);
          }
        }
        setLoading(false);
      });
      return () => unsubOrder();
    });
    return () => unsub();
  }, [orderId]);

  // ── Init carte ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!order || mapObj.current) return;
    loadGoogleMaps().then(() => {
      if (!mapDiv.current) return;
      const g = window.google.maps;
      const center = {
        lat: order.deliveryLat || order.storeLat || 45.57,
        lng: order.deliveryLng || order.storeLng || -73.74,
      };
      mapObj.current = new g.Map(mapDiv.current, {
        zoom: 14,
        center,
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f8f8f8" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road.arterial", stylers: [{ color: "#f0f0f0" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8ff" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      setMapReady(true);
      updateMap(order);
    }).catch(() => {});
  }, [order?.id]);

  // ── Mettre à jour la carte quand l'ordre change ───────────────────────
  useEffect(() => {
    if (mapReady && order) updateMap(order);
  }, [order?.driverLat, order?.driverLng, order?.status, mapReady]);

  function putMarker(ref: any, pos: {lat:number;lng:number}, color: string, emoji: string, title: string) {
    const g = window.google.maps;
    const icon = {
      path: g.SymbolPath.CIRCLE,
      scale: 14, fillColor: color, fillOpacity: 1,
      strokeColor: "#fff", strokeWeight: 3,
    };
    if (!ref.current) {
      ref.current = new g.Marker({ position: pos, map: mapObj.current, icon, zIndex: 10, title });
      new g.Marker({
        position: pos, map: mapObj.current, zIndex: 11,
        label: { text: emoji, fontSize: "13px" },
        icon: { path: g.SymbolPath.CIRCLE, scale: 0 },
      });
    } else {
      ref.current.setPosition(pos);
    }
  }

  function updateMap(o: any) {
    if (!mapObj.current || !window.google) return;
    const g = window.google.maps;
    const bounds = new g.LatLngBounds();
    let hasPoints = false;

    if (o.storeLat && o.storeLng) {
      const pos = { lat: o.storeLat, lng: o.storeLng };
      putMarker(storeMk, pos, "#3b82f6", "🏪", o.storeName || "Store");
      bounds.extend(pos); hasPoints = true;
    }
    if (o.deliveryLat && o.deliveryLng) {
      const pos = { lat: o.deliveryLat, lng: o.deliveryLng };
      putMarker(clientMk, pos, "#22c55e", "📍", "Votre adresse");
      bounds.extend(pos); hasPoints = true;
    }
    // Chauffeur (mis à jour en temps réel)
    if (o.driverLat && o.driverLng) {
      const pos = { lat: o.driverLat, lng: o.driverLng };
      if (!driverMk.current) {
        driverMk.current = new g.Marker({
          position: pos, map: mapObj.current, zIndex: 20, title: "Chauffeur",
          icon: {
            path: "M 0,-1.5 L 1,1 L 0,0.3 L -1,1 Z",
            scale: 20, fillColor: "#f97316", fillOpacity: 1,
            strokeColor: "#fff", strokeWeight: 2, rotation: o.driverHeading || 0,
          },
        });
      } else {
        driverMk.current.setPosition(pos);
        driverMk.current.setIcon({
          path: "M 0,-1.5 L 1,1 L 0,0.3 L -1,1 Z",
          scale: 20, fillColor: "#f97316", fillOpacity: 1,
          strokeColor: "#fff", strokeWeight: 2, rotation: o.driverHeading || 0,
        });
      }
      bounds.extend(pos); hasPoints = true;
    }
    if (hasPoints) {
      mapObj.current.fitBounds(bounds, { top: 30, bottom: 30, left: 30, right: 30 });
    }
  }

  // ── Rating submit ──────────────────────────────────────────────────────
  async function submitRating() {
    if (!rating) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "order_ratings"), {
        orderId, driverId: order?.driverId,
        stars: rating, tags: selectedTags, comment,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "orders", orderId), {
        driverRating: rating, driverComment: comment,
        ratingTags: selectedTags, ratedAt: serverTimestamp(),
      });
      setRatingDone(true);
      setShowRating(false);
      if (tipAmount > 0) setShowTip(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  // ── Tip submit ──────────────────────────────────────────────────────────
  async function submitTip() {
    const amount = parseFloat(customTip || String(tipAmount)) || 0;
    if (!amount) { setShowTip(false); setTipDone(true); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "driver_tips"), {
        orderId, driverId: order?.driverId,
        amount, method: order?.paymentMethod || "wallet",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "orders", orderId), {
        tip: amount, tipPaidAt: serverTimestamp(),
      });
      setTipDone(true);
      setShowTip(false);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Zap className="h-6 w-6 text-white fill-white" />
        </div>
        <p className="text-gray-500 text-sm">Chargement du suivi…</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-gray-500 mb-4">Commande introuvable</p>
        <button onClick={() => router.push("/client/orders")}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm">
          Mes commandes
        </button>
      </div>
    </div>
  );

  const currentIdx = STEP_IDX[order.status] ?? 0;
  const isDelivered = order.status === "delivered";
  const hasDriver = !!order.driverName;
  const ETA = order.estimatedDelivery ? `~${order.estimatedDelivery} min` : null;

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">

      {/* ══ HEADER ══ */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Suivi de commande</p>
          <p className="text-xs text-gray-400">#{order.orderNumber || orderId.slice(-6).toUpperCase()}</p>
        </div>
        {ETA && (
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-sm font-black text-orange-600">{ETA}</span>
          </div>
        )}
      </div>

      {/* ══ CARTE ══ */}
      <div className="relative" style={{ height: 240 }}>
        <div ref={mapDiv} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <Navigation className="h-6 w-6 text-gray-400 animate-pulse" />
          </div>
        )}
        {/* Badge statut sur la carte */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-gray-100">
            <span className="text-base">{STEPS[currentIdx]?.icon}</span>
            <span className="text-sm font-bold text-gray-900">{STEPS[currentIdx]?.label}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">

        {/* ══ CHAUFFEUR CARD ══ */}
        {hasDriver && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{order.driverName}</p>
                <p className="text-xs text-gray-400">Votre chauffeur FastDép</p>
                {order.driverRating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-500">{order.driverRating}/5</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {order.driverPhone && (
                  <a href={`tel:${order.driverPhone}`}
                    className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-green-600" />
                  </a>
                )}
                {!ratingDone && isDelivered && (
                  <button onClick={() => setShowRating(true)}
                    className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                  </button>
                )}
                {!tipDone && isDelivered && (
                  <button onClick={() => setShowTip(true)}
                    className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-orange-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEPS TIMELINE ══ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-gray-900 text-sm mb-4">Progression de la livraison</p>
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const done  = i < currentIdx;
              const active = i === currentIdx;
              const future = i > currentIdx;
              return (
                <div key={step.key} className="flex gap-3">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                      done ? "bg-green-500" : active ? "bg-orange-500" : "bg-gray-100"
                    }`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-white" />
                             : <span className={future ? "grayscale opacity-40" : ""}>{step.icon}</span>}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${done ? "bg-green-300" : "bg-gray-100"}`} />
                    )}
                  </div>
                  {/* Text */}
                  <div className={`pb-4 flex-1 min-w-0 ${future ? "opacity-40" : ""}`}>
                    <p className={`text-sm font-semibold ${active ? "text-orange-600" : done ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {(done || active) && (
                      <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ ADRESSE ══ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Livraison à</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{order.deliveryAddress || "—"}</p>
            </div>
          </div>
        </div>

        {/* ══ STORE ══ */}
        {order.storeName && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Commerce</p>
                <p className="text-sm font-bold text-gray-900">{order.storeName}</p>
              </div>
              {order.storePhone && (
                <a href={`tel:${order.storePhone}`}
                  className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ══ NOTE (si livré et tip/rating déjà fait) ══ */}
        {isDelivered && ratingDone && tipDone && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-green-800">Merci pour votre commande!</p>
            <p className="text-sm text-green-600 mt-1">À très bientôt sur FastDép</p>
            <button onClick={() => router.push("/client")}
              className="mt-3 px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm">
              Nouvelle commande
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          🔄 Suivi en temps réel · Mise à jour automatique
        </p>
      </div>

      {/* ══ MODAL RATING ══ */}
      {showRating && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-gray-900 text-lg">Évaluer {order.driverName}</p>
                <p className="text-sm text-gray-400">Comment s'est passée la livraison?</p>
              </div>
              <button onClick={() => setShowRating(false)} className="p-1.5 rounded-xl bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Étoiles */}
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90">
                  <Star className={`h-10 w-10 ${s <= (hoverStar || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm font-semibold text-gray-600">
                {["","😕 Mauvais","😐 Passable","🙂 Bien","😊 Très bien","🤩 Excellent!"][rating]}
              </p>
            )}

            {/* Tags */}
            {rating > 0 && (
              <div className="flex flex-wrap gap-2">
                {(rating >= 4 ? TAGS_POSITIVE : TAGS_NEGATIVE).map(tag => (
                  <button key={tag}
                    onClick={() => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Commentaire */}
            <textarea rows={2} placeholder="Commentaire (optionnel)"
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none" />

            <button onClick={submitRating} disabled={!rating || submitting}
              className="w-full bg-orange-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm">
              {submitting ? "Envoi…" : "Envoyer l'évaluation"}
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL TIP ══ */}
      {showTip && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-gray-900 text-lg">Laisser un pourboire</p>
                <p className="text-sm text-gray-400">100% va directement au chauffeur</p>
              </div>
              <button onClick={() => { setShowTip(false); setTipDone(true); }}
                className="p-1.5 rounded-xl bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Montants rapides */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map(amt => (
                <button key={amt} onClick={() => { setTipAmount(amt); setCustomTip(""); }}
                  className={`py-3 rounded-2xl font-bold text-sm transition-colors ${
                    tipAmount === amt && !customTip
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                  ${amt}
                </button>
              ))}
            </div>

            {/* Montant custom */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input type="number" min="0" step="0.5" placeholder="Autre montant"
                value={customTip}
                onChange={e => { setCustomTip(e.target.value); setTipAmount(0); }}
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
            </div>

            <button onClick={submitTip} disabled={submitting}
              className="w-full bg-orange-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm">
              {submitting ? "Envoi…"
                : tipAmount || customTip
                ? `Envoyer $${customTip || tipAmount} de pourboire 🙏`
                : "Passer (sans pourboire)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
