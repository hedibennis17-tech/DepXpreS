"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  CheckCircle2, Clock, MapPin, Phone, Truck,
  Store, Navigation, RefreshCw, User
} from "lucide-react";

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

const STEPS = [
  { key: "pending",            icon: "⏳", label: "Commande reçue",          color: "#6b7280" },
  { key: "assigned",           icon: "🚗", label: "Chauffeur assigné",        color: "#6366f1" },
  { key: "navigating_pickup",  icon: "🗺️", label: "En route → Commerce",     color: "#3b82f6" },
  { key: "arrived_store",      icon: "🏪", label: "Arrivé au commerce",       color: "#8b5cf6" },
  { key: "picked_up",          icon: "📦", label: "Commande récupérée",       color: "#f97316" },
  { key: "navigating_dropoff", icon: "🚀", label: "En route → Client",        color: "#06b6d4" },
  { key: "arrived_client",     icon: "📍", label: "Arrivé chez le client",    color: "#10b981" },
  { key: "delivered",          icon: "✅", label: "Livraison complétée",      color: "#22c55e" },
];
const STEP_IDX: Record<string, number> = {};
STEPS.forEach((s, i) => { STEP_IDX[s.key] = i; });

let gmapsLoaded = false;
let gmapsLoading: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (gmapsLoaded) return Promise.resolve();
  if (gmapsLoading) return gmapsLoading;
  gmapsLoading = new Promise((res, rej) => {
    if ((window as any).google?.maps?.Map) { gmapsLoaded = true; res(); return; }
    const cb = `__gm_admin_${Date.now()}`;
    (window as any)[cb] = () => { gmapsLoaded = true; delete (window as any)[cb]; res(); };
    const s = document.createElement("script");
    s.onerror = () => rej(new Error("Maps failed"));
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=${cb}`;
    document.head.appendChild(s);
    setTimeout(() => rej(new Error("Timeout")), 15000);
  });
  return gmapsLoading;
}

export default function LiveOrderTracker({ orderId }: { orderId: string }) {
  const mapDiv  = useRef<HTMLDivElement>(null);
  const mapObj  = useRef<any>(null);
  const driverMk = useRef<any>(null);
  const storeMk  = useRef<any>(null);
  const clientMk = useRef<any>(null);
  const polyRef  = useRef<any>(null);

  const [order,    setOrder]    = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  // ── Realtime Firestore ──────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setOrder({ id: snap.id, ...d });
        if (d.driverLastSeen?.toDate) setLastSeen(d.driverLastSeen.toDate());
      }
    });
    return () => unsub();
  }, [orderId]);

  // ── Init carte ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!order || mapObj.current || !mapDiv.current) return;
    loadMaps().then(() => {
      if (!mapDiv.current) return;
      const g = window.google.maps;
      mapObj.current = new g.Map(mapDiv.current, {
        zoom: 13,
        center: { lat: order.storeLat || 45.57, lng: order.storeLng || -73.74 },
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        gestureHandling: "cooperative",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road.arterial", stylers: [{ color: "#efefef" }] },
          { featureType: "water", stylers: [{ color: "#c8e6f5" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      setMapReady(true);
    }).catch(() => {});
  }, [order?.id]);

  // ── Mettre à jour marqueurs quand order change ──────────────────────
  useEffect(() => {
    if (!mapReady || !order || !window.google) return;
    const g = window.google.maps;
    const bounds = new g.LatLngBounds();
    let pts = 0;

    // Store
    if (order.storeLat && order.storeLng) {
      const pos = { lat: order.storeLat, lng: order.storeLng };
      if (!storeMk.current) {
        storeMk.current = new g.Marker({
          position: pos, map: mapObj.current, zIndex: 10,
          icon: { path: g.SymbolPath.CIRCLE, scale: 12, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2.5 },
          label: { text: "🏪", fontSize: "12px" },
        });
      } else storeMk.current.setPosition(pos);
      bounds.extend(pos); pts++;
    }

    // Client
    if (order.deliveryLat && order.deliveryLng) {
      const pos = { lat: order.deliveryLat, lng: order.deliveryLng };
      if (!clientMk.current) {
        clientMk.current = new g.Marker({
          position: pos, map: mapObj.current, zIndex: 10,
          icon: { path: g.SymbolPath.CIRCLE, scale: 12, fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2.5 },
          label: { text: "📍", fontSize: "12px" },
        });
      } else clientMk.current.setPosition(pos);
      bounds.extend(pos); pts++;
    }

    // Chauffeur (temps réel)
    if (order.driverLat && order.driverLng) {
      const pos = { lat: order.driverLat, lng: order.driverLng };
      const icon = {
        path: "M 0,-1.4 L 1,0.9 L 0,0.3 L -1,0.9 Z",
        scale: 18, fillColor: "#f97316", fillOpacity: 1,
        strokeColor: "#fff", strokeWeight: 2,
        rotation: order.driverHeading || 0,
      };
      if (!driverMk.current) {
        driverMk.current = new g.Marker({ position: pos, map: mapObj.current, zIndex: 20, icon, title: order.driverName || "Chauffeur" });
      } else {
        driverMk.current.setPosition(pos);
        driverMk.current.setIcon(icon);
      }
      bounds.extend(pos); pts++;
    }

    if (pts > 1) {
      mapObj.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    } else if (pts === 1) {
      mapObj.current.setZoom(15);
    }
  }, [order?.driverLat, order?.driverLng, order?.storeLat, order?.deliveryLat, mapReady]);

  if (!order) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Chargement du suivi…
    </div>
  );

  const currentIdx = STEP_IDX[order.status] ?? 0;
  const currentStep = STEPS[currentIdx];
  const progressPct = Math.round((currentIdx / (STEPS.length - 1)) * 100);
  const hasDriver = !!order.driverName;
  const isLive = ["navigating_pickup","arrived_store","picked_up","navigating_dropoff","arrived_client"].includes(order.status);

  return (
    <div className="space-y-4">

      {/* ── Carte ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
        <div ref={mapDiv} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-gray-300 animate-pulse" />
          </div>
        )}
        {/* Badge statut */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/95 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-sm">{currentStep?.icon}</span>
            <span className="text-xs font-bold text-gray-800">{currentStep?.label}</span>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
          </div>
        </div>
        {/* Légende */}
        <div className="absolute bottom-3 left-3 bg-white/90 rounded-xl px-2.5 py-1.5 space-y-0.5">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"/><span className="text-[10px] text-gray-600">Chauffeur</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/><span className="text-[10px] text-gray-600">Store</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"/><span className="text-[10px] text-gray-600">Client</span></div>
        </div>
        {/* Last seen */}
        {lastSeen && (
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-2 py-1">
            <span className="text-[10px] text-gray-500">
              GPS {Math.round((Date.now() - lastSeen.getTime()) / 1000)}s
            </span>
          </div>
        )}
      </div>

      {/* ── Barre de progression ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-700">Progression</span>
          <span className="text-xs font-black text-orange-500">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: currentStep?.color || "#f97316" }} />
        </div>
      </div>

      {/* ── Timeline étapes ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-700 mb-3">Suivi étapes</p>
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const done   = i < currentIdx;
            const active = i === currentIdx;
            const future = i > currentIdx;
            return (
              <div key={step.key} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    done ? "bg-green-500" : active ? "" : "bg-gray-100"
                  }`} style={active ? { background: step.color } : {}}>
                    {done
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      : <span className={future ? "opacity-30 text-xs" : "text-xs"}>{step.icon}</span>}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px flex-1 my-0.5 min-h-[16px] ${done ? "bg-green-300" : "bg-gray-100"}`} />
                  )}
                </div>
                <div className={`pb-3 flex-1 flex items-center justify-between ${future ? "opacity-30" : ""}`}>
                  <span className={`text-xs font-semibold ${active ? "text-gray-900" : done ? "text-gray-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                  {active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"
                      style={{ background: step.color }}>
                      EN COURS
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Infos chauffeur + client ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        {/* Chauffeur */}
        {hasDriver && (
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Truck className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Chauffeur</p>
              <p className="text-sm font-bold text-gray-900 truncate">{order.driverName}</p>
              {order.driverRating && (
                <p className="text-xs text-yellow-600">⭐ {order.driverRating}/5</p>
              )}
            </div>
            {order.driverPhone && (
              <a href={`tel:${order.driverPhone}`}
                className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-green-600" />
              </a>
            )}
          </div>
        )}

        {/* Client */}
        {order.clientName && (
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Client</p>
              <p className="text-sm font-bold text-gray-900 truncate">{order.clientName}</p>
              <p className="text-xs text-gray-400 truncate">{order.deliveryAddress}</p>
            </div>
            {order.clientPhone && (
              <a href={`tel:${order.clientPhone}`}
                className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-green-600" />
              </a>
            )}
          </div>
        )}

        {/* Store */}
        {order.storeName && (
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Commerce</p>
              <p className="text-sm font-bold text-gray-900 truncate">{order.storeName}</p>
              <p className="text-xs text-gray-400 truncate">{order.storeAddress}</p>
            </div>
            {order.storePhone && (
              <a href={`tel:${order.storePhone}`}
                className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
              </a>
            )}
          </div>
        )}
      </div>

      {isLive && (
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Suivi en temps réel via GPS
        </p>
      )}
    </div>
  );
}
