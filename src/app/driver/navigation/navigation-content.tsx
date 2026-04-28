"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft, Phone, CheckCircle2, Loader2, Volume2, VolumeX,
  RotateCcw, Clock, MapPin, Navigation, Coffee, AlertTriangle
} from "lucide-react";

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

function ManeuverArrow({ maneuver, color }: { maneuver: string; color: string }) {
  const m = (maneuver || "").toLowerCase();
  let rotate = 0;
  if (m.includes("right")) rotate = 90;
  if (m.includes("left")) rotate = -90;
  if (m.includes("slight-right") || m.includes("slight_right")) rotate = 45;
  if (m.includes("slight-left") || m.includes("slight_left")) rotate = -45;
  if (m.includes("u-turn") || m.includes("uturn")) rotate = 180;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.3s" }}>
      <line x1="18" y1="32" x2="18" y2="8" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <polygon points="18,3 10,13 26,13" fill={color}/>
    </svg>
  );
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "'").trim();
}

// Charge Google Maps SDK de façon fiable
let gmapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.Map) { resolve(); return; }
    const cbName = `__gmcb${Date.now()}`;
    (window as any)[cbName] = () => { delete (window as any)[cbName]; resolve(); };
    const s = document.createElement("script");
    s.onerror = () => { gmapsPromise = null; reject(new Error("Échec chargement Google Maps")); };
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=${cbName}`;
    document.head.appendChild(s);
    setTimeout(() => { gmapsPromise = null; reject(new Error("Timeout Google Maps (15s)")); }, 15000);
  });
  return gmapsPromise;
}

export default function NavigationContent() {
  const router = useRouter();

  // ── Lire les params UNE SEULE FOIS depuis l'URL ──────────────────────────
  const P = useRef<Record<string,string>>({});
  useEffect(() => {
    P.current = Object.fromEntries(new URLSearchParams(window.location.search));
  }, []);

  // Tous les refs
  const mapDiv    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<any>(null);
  const driverMk  = useRef<any>(null);
  const watchId   = useRef<number|null>(null);
  const steps     = useRef<any[]>([]);
  const stepI     = useRef(0);
  const mutedRef  = useRef(false);
  const pausedRef = useRef(false);
  const lastSpoke = useRef("");
  const uidRef    = useRef("");
  const drawnRef  = useRef(false);

  // UI state
  const [ready,     setReady]     = useState(false);
  const [mapErr,    setMapErr]    = useState("");
  const [mutedUI,   setMutedUI]   = useState(false);
  const [heading,   setHeading]   = useState(0);
  const [maneuver,  setManeuver]  = useState("");
  const [instr,     setInstr]     = useState("Calcul de l'itinéraire…");
  const [distStep,  setDistStep]  = useState("");
  const [nextInstr, setNextInstr] = useState("");
  const [eta,       setEta]       = useState("");
  const [distStore, setDistStore] = useState("");
  const [distClient,setDistClient]= useState("");
  const [distTotal, setDistTotal] = useState("");
  const [arrived,   setArrived]   = useState(false);
  const [confirming,setConfirming]= useState(false);
  const [coffee,    setCoffee]    = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, u => { if (u) uidRef.current = u.uid; });
  }, []);

  // ── Init carte dès que le composant monte — PAS besoin de storeLat ───────
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      // 1. Charger SDK
      try { await loadGoogleMaps(); }
      catch (e: any) { if (!cancelled) setMapErr(e.message); return; }
      if (cancelled || !mapDiv.current) return;

      // 2. Créer la carte centrée sur Laval (fallback si pas de GPS)
      const g = window.google.maps;
      mapObj.current = new g.Map(mapDiv.current, {
        zoom: 14,
        center: { lat: 45.57, lng: -73.74 }, // Laval par défaut
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d3748" }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#374151" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4b5563" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      setReady(true);

      // 3. Demander GPS du chauffeur
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled) return;
          const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          mapObj.current.setCenter(origin);
          mapObj.current.setZoom(15);
          putDriverMarker(origin, 0);
          drawAllRoutes(origin);
          startWatch();
        },
        () => {
          // Pas de GPS — dessiner quand même avec coords du store
          const p = new URLSearchParams(window.location.search);
          const slat = parseFloat(p.get("storeLat") || p.get("lat") || "0");
          const slng = parseFloat(p.get("storeLng") || p.get("lng") || "0");
          if (slat && slng) {
            const fakeOrigin = { lat: slat - 0.008, lng: slng - 0.005 };
            drawAllRoutes(fakeOrigin);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    boot();
    return () => { cancelled = true; };
  }, []); // Une seule fois au mount

  // ── Placer la flèche chauffeur ──────────────────────────────────────────
  function putDriverMarker(loc: {lat:number;lng:number}, hdg: number) {
    if (!mapObj.current || !window.google) return;
    const g = window.google.maps;
    const icon = {
      path: "M 0,-1.2 L 0.7,0.8 L 0,0.3 L -0.7,0.8 Z",
      scale: 26,
      fillColor: "#f97316", fillOpacity: 1,
      strokeColor: "#ffffff", strokeWeight: 2,
      rotation: hdg,
      anchor: new g.Point(0, 0),
    };
    if (!driverMk.current) {
      driverMk.current = new g.Marker({ position: loc, map: mapObj.current, icon, zIndex: 20 });
    } else {
      driverMk.current.setPosition(loc);
      driverMk.current.setIcon(icon);
    }
  }

  // ── Marqueur coloré ─────────────────────────────────────────────────────
  function putMarker(pos: {lat:number;lng:number}, color: string, emoji: string, title: string) {
    if (!mapObj.current || !window.google) return;
    const g = window.google.maps;
    new g.Marker({
      position: pos, map: mapObj.current, zIndex: 15, title,
      icon: { path: g.SymbolPath.CIRCLE, scale: 14, fillColor: color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
    });
    new g.Marker({
      position: pos, map: mapObj.current, zIndex: 16,
      label: { text: emoji, fontSize: "14px" },
      icon: { path: g.SymbolPath.CIRCLE, scale: 0 },
    });
  }

  // ── Dessiner les 2 routes + calculs ─────────────────────────────────────
  function drawAllRoutes(origin: {lat:number;lng:number}) {
    if (!mapObj.current || !window.google || drawnRef.current) return;
    drawnRef.current = true;

    const p = new URLSearchParams(window.location.search);
    const phase    = p.get("phase") || "pickup";
    const slat     = parseFloat(p.get("storeLat") || p.get("lat") || "0");
    const slng     = parseFloat(p.get("storeLng") || p.get("lng") || "0");
    const clat     = parseFloat(p.get("clientLat") || "0");
    const clng     = parseFloat(p.get("clientLng") || "0");
    const sName    = p.get("storeName") || "Store";
    const cName    = p.get("clientName") || p.get("client") || "Client";

    if (!slat || !slng) {
      setInstr("Coordonnées du store manquantes");
      return;
    }

    const g = window.google.maps;
    const DS = new g.DirectionsService();

    // Marqueurs
    putMarker({ lat: slat, lng: slng }, "#3b82f6", "🏪", sName);
    if (clat && clng) putMarker({ lat: clat, lng: clng }, "#22c55e", "📦", cName);

    // Bounds pour zoom automatique
    const bounds = new g.LatLngBounds();
    bounds.extend(origin);
    bounds.extend({ lat: slat, lng: slng });
    if (clat && clng) bounds.extend({ lat: clat, lng: clng });

    // ── Route 1: chauffeur → store (bleue) ─────────────────────────────
    const r1 = new g.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 6, strokeOpacity: 0.9 },
    });
    r1.setMap(mapObj.current);

    DS.route({
      origin,
      destination: { lat: slat, lng: slng },
      travelMode: g.TravelMode.DRIVING,
    }, (res: any, status: string) => {
      if (status !== "OK") {
        setInstr(`Erreur route: ${status}`);
        return;
      }
      r1.setDirections(res);
      const leg1 = res.routes[0].legs[0];
      setDistStore(leg1.distance.text);

      // Navigation active sur segment courant
      if (phase === "pickup") {
        initNavSteps(leg1.steps);
      }

      // ── Route 2: store → client (verte) ────────────────────────────
      if (clat && clng) {
        const r2 = new g.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#22c55e", strokeWeight: 5, strokeOpacity: 0.75 },
        });
        r2.setMap(mapObj.current);

        DS.route({
          origin: { lat: slat, lng: slng },
          destination: { lat: clat, lng: clng },
          travelMode: g.TravelMode.DRIVING,
        }, (res2: any, s2: string) => {
          if (s2 !== "OK") return;
          r2.setDirections(res2);
          const leg2 = res2.routes[0].legs[0];
          setDistClient(leg2.distance.text);

          const totalM = leg1.distance.value + leg2.distance.value;
          setDistTotal(totalM >= 1000 ? `${(totalM/1000).toFixed(1)} km` : `${totalM} m`);
          const totalMin = Math.round((leg1.duration.value + leg2.duration.value) / 60);
          setEta(`${totalMin} min`);

          if (phase === "dropoff") initNavSteps(leg2.steps);
        });
      } else {
        setDistTotal(leg1.distance.text);
        setEta(leg1.duration.text);
      }

      mapObj.current.fitBounds(bounds, { top: 120, bottom: 220, left: 30, right: 30 });
    });
  }

  function initNavSteps(ss: any[]) {
    steps.current = ss;
    stepI.current = 0;
    if (!ss.length) return;
    const s0 = ss[0];
    setInstr(stripHtml(s0.instructions));
    setDistStep(s0.distance.text);
    setManeuver(s0.maneuver || "");
    if (ss[1]) setNextInstr(`${ss[1].distance.text} · ${stripHtml(ss[1].instructions)}`);
    speak(stripHtml(s0.instructions));
  }

  // ── GPS Watch ─────────────────────────────────────────────────────────
  function startWatch() {
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        if (pausedRef.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const hdg = pos.coords.heading ?? 0;
        setHeading(hdg);
        putDriverMarker(loc, hdg);
        if (hdg > 5) mapObj.current?.setHeading(hdg);
        mapObj.current?.panTo(loc);
        updateFS(loc, hdg);
        advanceStep(loc);
      },
      err => console.warn("GPS:", err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }

  function advanceStep(loc: {lat:number;lng:number}) {
    const ss = steps.current;
    const i  = stepI.current;
    if (!ss.length || !window.google) return;
    const g = window.google.maps;

    const d = g.geometry.spherical.computeDistanceBetween(
      new g.LatLng(loc.lat, loc.lng), ss[i].end_location
    );
    if (d < 20 && i < ss.length - 1) {
      const ni = i + 1;
      stepI.current = ni;
      const ns = ss[ni];
      const txt = stripHtml(ns.instructions);
      setInstr(txt); setDistStep(ns.distance.text); setManeuver(ns.maneuver || "");
      setNextInstr(ss[ni+1] ? `${ss[ni+1].distance.text} · ${stripHtml(ss[ni+1].instructions)}` : "");
      speak(txt);
    }
    const last = ss[ss.length-1];
    const dFin = g.geometry.spherical.computeDistanceBetween(
      new g.LatLng(loc.lat, loc.lng), last.end_location
    );
    if (dFin < 15) setArrived(true);
  }

  function speak(text: string) {
    if (mutedRef.current || !window.speechSynthesis || text === lastSpoke.current) return;
    lastSpoke.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }

  function recalc() {
    drawnRef.current = false;
    steps.current = []; stepI.current = 0;
    setInstr("Recalcul…"); setDistStep(""); setManeuver("");
    setDistStore(""); setDistClient(""); setDistTotal(""); setEta("");
    navigator.geolocation.getCurrentPosition(
      pos => drawAllRoutes({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function updateFS(loc: {lat:number;lng:number}, hdg: number) {
    if (!uidRef.current) return;
    try {
      await updateDoc(doc(db, "driver_profiles", uidRef.current), {
        last_lat: loc.lat, last_lng: loc.lng, heading: hdg, updatedAt: serverTimestamp(),
      });
    } catch {}
  }

  async function confirmArrival() {
    const p = new URLSearchParams(window.location.search);
    const orderId = p.get("orderId") || "";
    const phase   = p.get("phase") || "pickup";
    if (!orderId || confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/driver/order-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId, driverId: uidRef.current,
          action: phase === "pickup" ? "arrived_store" : "arrived_client",
        }),
      });
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      window.speechSynthesis?.cancel();
      router.push("/driver/orders");
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  }

  useEffect(() => () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    window.speechSynthesis?.cancel();
  }, []);

  // Lire phase/noms depuis URL pour l'UI
  const urlParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const phase      = urlParams.get("phase") || "pickup";
  const isPickup   = phase === "pickup";
  const activeColor = isPickup ? "#3b82f6" : "#22c55e";
  const destLabel  = isPickup
    ? (urlParams.get("storeName") || "Commerce")
    : (urlParams.get("clientName") || urlParams.get("client") || "Client");
  const destAddr   = isPickup
    ? (urlParams.get("storeDest") || urlParams.get("dest") || "")
    : (urlParams.get("clientDest") || "");
  const phoneCall  = isPickup
    ? (urlParams.get("storePhone") || "")
    : (urlParams.get("clientPhone") || urlParams.get("phone") || "");
  const sName      = urlParams.get("storeName") || "Store";
  const cName      = urlParams.get("clientName") || urlParams.get("client") || "Client";
  const cLat       = parseFloat(urlParams.get("clientLat") || "0");

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col" style={{ zIndex: 100 }}>

      {/* ══ HEADER ══ */}
      <div className="shrink-0 bg-[#111]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
          <button onClick={() => {
            if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
            window.speechSynthesis?.cancel();
            router.back();
          }} className="p-2 rounded-xl bg-white/5 text-white shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "25" }}>
            <ManeuverArrow maneuver={maneuver} color={activeColor} />
          </div>

          <div className="flex-1 min-w-0">
            {distStep && <p className="text-2xl font-black text-white leading-none">{distStep}</p>}
            <p className="text-sm font-semibold text-gray-200 leading-tight line-clamp-2 mt-0.5">{instr}</p>
          </div>

          <button onClick={() => { mutedRef.current = !mutedRef.current; setMutedUI(m => !m); }}
            className="p-2 rounded-xl bg-white/5 text-gray-400 shrink-0">
            {mutedUI ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {nextInstr && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-500" />
            <p className="text-xs text-gray-400 truncate">Ensuite · {nextInstr}</p>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 pb-2 border-t border-white/5 pt-2 flex-wrap">
          {eta && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-sm font-black text-white">{eta}</span>
            </div>
          )}
          {distStore && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">{distStore} → 🏪</span>
            </div>
          )}
          {distClient && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs text-gray-400">{distClient} → 📦</span>
            </div>
          )}
          {distTotal && (
            <span className="ml-auto text-xs font-bold text-gray-400">Total {distTotal}</span>
          )}
          <button onClick={recalc} className="p-1.5 rounded-lg bg-white/5 text-gray-400">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ══ CARTE ══ */}
      <div className="flex-1 relative overflow-hidden">
        {/* Overlay chargement */}
        {!ready && !mapErr && (
          <div className="absolute inset-0 bg-[#0f0f0f] z-10 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Chargement navigation…</p>
            </div>
          </div>
        )}
        {/* Overlay erreur */}
        {mapErr && (
          <div className="absolute inset-0 bg-[#0f0f0f] z-10 flex items-center justify-center px-6">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">Carte indisponible</p>
              <p className="text-gray-400 text-sm mb-4">{mapErr}</p>
              <button onClick={() => { setMapErr(""); gmapsPromise = null; }}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold">
                Réessayer
              </button>
            </div>
          </div>
        )}

        <div ref={mapDiv} className="w-full h-full" />

        {/* Légende */}
        {ready && (
          <div className="absolute top-3 left-3 bg-black/70 rounded-2xl px-3 py-2 space-y-1.5 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
              <span className="text-xs text-gray-300 font-medium">Vous</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-xs text-gray-300">🏪 {sName}</span>
            </div>
            {cLat > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-xs text-gray-300">📦 {cName}</span>
              </div>
            )}
          </div>
        )}

        {/* Boussole */}
        {ready && (
          <button onClick={() => mapObj.current?.setHeading(0)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center border border-white/10">
            <div style={{ transform: `rotate(${-heading}deg)`, transition: "transform 0.4s" }}>
              <Navigation className="h-5 w-5 text-red-400" />
            </div>
          </button>
        )}
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="shrink-0 bg-[#111] border-t border-white/5 px-4 pt-3 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "25" }}>
            <MapPin className="h-4 w-4" style={{ color: activeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 font-medium">{isPickup ? "Commerce" : "Livraison pour"}</p>
            <p className="text-sm font-bold text-white truncate">{destLabel}</p>
            {destAddr && <p className="text-xs text-gray-500 truncate">{destAddr}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { pausedRef.current = true; setCoffee(true); }}
              className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Coffee className="h-4 w-4 text-amber-400" />
            </button>
            <a href="tel:911" className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </a>
            {phoneCall && (
              <a href={`tel:${phoneCall}`} className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Phone className="h-4 w-4 text-green-400" />
              </a>
            )}
          </div>
        </div>

        <button onClick={confirmArrival} disabled={confirming}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: arrived ? activeColor : "#1f2937" }}>
          {confirming
            ? <><Loader2 className="h-4 w-4 animate-spin" />Confirmation…</>
            : <><CheckCircle2 className="h-5 w-5" />{isPickup ? "✅ Arrivé au commerce" : "✅ Arrivé chez le client"}</>}
        </button>
        <p className="text-center text-xs text-gray-600 mt-1.5">S&apos;active automatiquement à l&apos;arrivée</p>
      </div>

      {coffee && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white">Pause café ☕</p>
                <p className="text-xs text-gray-400">Navigation en pause</p>
              </div>
            </div>
            <button onClick={() => { pausedRef.current = false; setCoffee(false); }}
              className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm">
              ▶ Reprendre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
