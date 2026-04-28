"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft, Phone, CheckCircle2, Loader2, Volume2, VolumeX,
  RotateCcw, Clock, MapPin, Navigation, Coffee, AlertTriangle
} from "lucide-react";

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

// ── Flèche manœuvre ───────────────────────────────────────────────────────
function ManeuverArrow({ maneuver, color }: { maneuver: string; color: string }) {
  const m = (maneuver || "").toLowerCase();
  let rotate = 0;
  if (m.includes("right")) rotate = 90;
  else if (m.includes("left")) rotate = -90;
  else if (m.includes("u-turn") || m.includes("uturn")) rotate = 180;
  if (m.includes("slight-right") || m.includes("slight_right")) rotate = 45;
  if (m.includes("slight-left") || m.includes("slight_left")) rotate = -45;
  if (m.includes("roundabout")) return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 6 A14 14 0 1 1 6 20" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <polygon points="20,2 14,10 26,10" fill={color} transform="rotate(30,20,20)"/>
    </svg>
  );
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.4s" }}>
      <line x1="20" y1="36" x2="20" y2="10" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <polygon points="20,4 12,15 28,15" fill={color}/>
    </svg>
  );
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g," ").replace(/&rsquo;/g,"'").trim();
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.Map) { resolve(); return; }
    if (document.querySelector("#gmaps-nav")) {
      const check = setInterval(() => {
        if (window.google?.maps?.Map) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    (window as any).__navResolve = resolve;
    const s = document.createElement("script");
    s.id = "gmaps-nav";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=__navResolve`;
    s.async = true;
    document.head.appendChild(s);
  });
}

export default function NavigationContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const mapDiv = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const driverMarker = useRef<any>(null);
  const watchId = useRef<number | null>(null);
  const stepsArr = useRef<any[]>([]);
  const stepIdx = useRef(0);
  const muted = useRef(false);
  const lastSpoken = useRef("");
  const uid = useRef("");

  const [ready, setReady] = useState(false);
  const [muteUI, setMuteUI] = useState(false);
  const [heading, setHeading] = useState(0);
  const [maneuver, setManeuver] = useState("");
  const [instruction, setInstruction] = useState("Calcul en cours…");
  const [distStep, setDistStep] = useState("");
  const [nextInstr, setNextInstr] = useState("");
  const [eta, setEta] = useState("");
  const [distStore, setDistStore] = useState("");
  const [distClient, setDistClient] = useState("");
  const [distTotal, setDistTotal] = useState("");
  const [arrived, setArrived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [coffee, setCoffee] = useState(false);
  const paused = useRef(false);

  // Params URL
  const phase      = (sp.get("phase") || "pickup") as "pickup"|"dropoff";
  const orderId    = sp.get("orderId") || "";
  const storeName  = sp.get("storeName") || "Commerce";
  const storeLat   = parseFloat(sp.get("storeLat") || sp.get("lat") || "0");
  const storeLng   = parseFloat(sp.get("storeLng") || sp.get("lng") || "0");
  const storePhone = sp.get("storePhone") || "";
  const storeDest  = sp.get("storeDest") || sp.get("dest") || "";
  const clientName = sp.get("clientName") || sp.get("client") || "Client";
  const clientLat  = parseFloat(sp.get("clientLat") || "0");
  const clientLng  = parseFloat(sp.get("clientLng") || "0");
  const clientDest = sp.get("clientDest") || "";
  const clientPhone= sp.get("clientPhone") || sp.get("phone") || "";
  const isPickup   = phase === "pickup";
  const activeColor= isPickup ? "#3b82f6" : "#22c55e";
  const destLabel  = isPickup ? storeName : clientName;
  const destAddr   = isPickup ? storeDest : clientDest;
  const phoneCall  = isPickup ? storePhone : clientPhone;

  useEffect(() => {
    const u = onAuthStateChanged(auth, (u) => { if (u) uid.current = u.uid; });
    return () => u();
  }, []);

  // ── Initialisation principale ──────────────────────────────────────────
  useEffect(() => {
    if (!storeLat || !storeLng) return;
    let cancelled = false;

    async function init() {
      await loadGoogleMaps();
      if (cancelled || !mapDiv.current) return;

      // Créer la carte
      const g = window.google.maps;
      map.current = new g.Map(mapDiv.current, {
        zoom: 16,
        center: { lat: storeLat, lng: storeLng },
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

      // Demander position GPS
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.current.setCenter(origin);
          placeDriverMarker(origin, 0);
          drawRoutes(origin);
          startWatch();
        },
        () => {
          // Fallback: utiliser le store comme origine approx
          const origin = { lat: storeLat - 0.01, lng: storeLng - 0.01 };
          drawRoutes(origin);
          startWatch();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    init();
    return () => { cancelled = true; };
  }, [storeLat, storeLng]);

  // ── Marqueur chauffeur (flèche orange) ───────────────────────────────
  function placeDriverMarker(loc: { lat: number; lng: number }, hdg: number) {
    const g = window.google.maps;
    const icon = {
      path: "M 0,-1 L 0.6,0.8 L 0,0.4 L -0.6,0.8 Z",
      scale: 28,
      fillColor: "#f97316",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      rotation: hdg,
      anchor: new g.Point(0, 0),
    };
    if (!driverMarker.current) {
      driverMarker.current = new g.Marker({ position: loc, map: map.current, icon, zIndex: 20 });
    } else {
      driverMarker.current.setPosition(loc);
      driverMarker.current.setIcon(icon);
    }
  }

  // ── Marqueur coloré avec label ────────────────────────────────────────
  function placeMarker(pos: { lat: number; lng: number }, color: string, label: string, title: string) {
    const g = window.google.maps;
    new g.Marker({
      position: pos, map: map.current, zIndex: 15, title,
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: color, fillOpacity: 1,
        strokeColor: "#ffffff", strokeWeight: 3,
      },
    });
    new g.Marker({
      position: pos, map: map.current, zIndex: 16,
      label: { text: label, fontSize: "14px" },
      icon: { path: g.SymbolPath.CIRCLE, scale: 0 },
    });
  }

  // ── Tracer les 2 routes ───────────────────────────────────────────────
  function drawRoutes(origin: { lat: number; lng: number }) {
    const g = window.google.maps;
    const DS = new g.DirectionsService();

    // Marqueur store
    placeMarker({ lat: storeLat, lng: storeLng }, "#3b82f6", "🏪", storeName);

    // Marqueur client si coords disponibles
    if (clientLat && clientLng) {
      placeMarker({ lat: clientLat, lng: clientLng }, "#22c55e", "📦", clientName);
    }

    // ── Route 1 : chauffeur → store (bleue) ──────────────────────────
    const r1 = new g.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 6, strokeOpacity: 0.9 },
    });
    r1.setMap(map.current);

    DS.route({
      origin,
      destination: { lat: storeLat, lng: storeLng },
      travelMode: g.TravelMode.DRIVING,
    }, (res: any, status: string) => {
      if (status !== "OK") {
        console.error("Route 1 error:", status);
        return;
      }
      r1.setDirections(res);
      const leg = res.routes[0].legs[0];
      setDistStore(leg.distance.text);

      // Calculer distance totale
      if (clientLat && clientLng) {
        DS.route({
          origin: { lat: storeLat, lng: storeLng },
          destination: { lat: clientLat, lng: clientLng },
          travelMode: g.TravelMode.DRIVING,
        }, (res2: any, s2: string) => {
          if (s2 !== "OK") return;

          // Route 2 : store → client (verte pointillée)
          const r2 = new g.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#22c55e", strokeWeight: 5, strokeOpacity: 0.7 },
          });
          r2.setMap(map.current);
          r2.setDirections(res2);

          const leg2 = res2.routes[0].legs[0];
          setDistClient(leg2.distance.text);
          const totalM = leg.distance.value + leg2.distance.value;
          setDistTotal(totalM >= 1000 ? `${(totalM/1000).toFixed(1)} km` : `${totalM} m`);
          const totalMin = Math.round((leg.duration.value + leg2.duration.value) / 60);
          setEta(`${totalMin} min`);
        });
      } else {
        setDistTotal(leg.distance.text);
        setEta(leg.duration.text);
      }

      // Navigation active sur le bon segment
      const activeSteps = isPickup ? leg.steps : [];
      if (!isPickup && clientLat && clientLng) {
        DS.route({
          origin,
          destination: { lat: clientLat, lng: clientLng },
          travelMode: g.TravelMode.DRIVING,
        }, (rDrop: any, sDrop: string) => {
          if (sDrop !== "OK") return;
          const dropLeg = rDrop.routes[0].legs[0];
          initSteps(dropLeg.steps);
        });
      } else {
        initSteps(leg.steps);
      }

      // Zoom sur tous les points
      const bounds = new g.LatLngBounds();
      bounds.extend(origin);
      bounds.extend({ lat: storeLat, lng: storeLng });
      if (clientLat && clientLng) bounds.extend({ lat: clientLat, lng: clientLng });
      map.current.fitBounds(bounds, { top: 80, bottom: 200, left: 20, right: 20 });
    });
  }

  function initSteps(steps: any[]) {
    stepsArr.current = steps;
    stepIdx.current = 0;
    if (steps.length > 0) {
      const s = steps[0];
      setInstruction(stripHtml(s.instructions));
      setDistStep(s.distance.text);
      setManeuver(s.maneuver || "");
      if (steps[1]) setNextInstr(`${steps[1].distance.text} · ${stripHtml(steps[1].instructions)}`);
      speak(stripHtml(s.instructions));
    }
  }

  // ── Suivi GPS en temps réel ──────────────────────────────────────────
  function startWatch() {
    if (!navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (paused.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const hdg = pos.coords.heading ?? 0;
        setHeading(hdg);
        placeDriverMarker(loc, hdg);
        if (hdg > 5) map.current?.setHeading(hdg);
        map.current?.panTo(loc);
        updateFirestore(loc, hdg);
        checkProgress(loc);
      },
      (e) => console.warn("GPS watch:", e.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }

  function checkProgress(loc: { lat: number; lng: number }) {
    const steps = stepsArr.current;
    const idx = stepIdx.current;
    if (!steps.length || !window.google) return;
    const g = window.google.maps;
    const curr = steps[idx];
    if (!curr) return;

    const dist = g.geometry.spherical.computeDistanceBetween(
      new g.LatLng(loc.lat, loc.lng),
      curr.end_location
    );
    if (dist < 20 && idx < steps.length - 1) {
      const ni = idx + 1;
      stepIdx.current = ni;
      const ns = steps[ni];
      const instr = stripHtml(ns.instructions);
      setInstruction(instr);
      setDistStep(ns.distance.text);
      setManeuver(ns.maneuver || "");
      if (steps[ni + 1]) setNextInstr(`${steps[ni+1].distance.text} · ${stripHtml(steps[ni+1].instructions)}`);
      else setNextInstr("");
      speak(instr);
    }

    // Détection arrivée (15m de la dernière étape)
    const last = steps[steps.length - 1];
    const dFin = g.geometry.spherical.computeDistanceBetween(
      new g.LatLng(loc.lat, loc.lng), last.end_location
    );
    if (dFin < 15) setArrived(true);
  }

  function speak(text: string) {
    if (muted.current || !window.speechSynthesis || text === lastSpoken.current) return;
    lastSpoken.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }

  function recalc() {
    stepsArr.current = [];
    stepIdx.current = 0;
    setInstruction("Recalcul en cours…");
    setDistStep(""); setManeuver("");
    navigator.geolocation.getCurrentPosition(
      (pos) => drawRoutes({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function updateFirestore(loc: { lat: number; lng: number }, hdg: number) {
    if (!uid.current) return;
    try {
      await updateDoc(doc(db, "driver_profiles", uid.current), {
        last_lat: loc.lat, last_lng: loc.lng,
        heading: hdg, updatedAt: serverTimestamp(),
      });
    } catch {}
  }

  async function confirmArrival() {
    if (!orderId || confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/driver/order-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId, driverId: uid.current,
          action: isPickup ? "arrived_store" : "arrived_client",
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

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col" style={{ zIndex: 100 }}>

      {/* ══ HEADER manœuvre ══ */}
      <div className="shrink-0 bg-[#111]/95 backdrop-blur-sm border-b border-white/5">

        {/* Ligne 1 : flèche + instruction + son */}
        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
          <button onClick={() => {
            if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
            window.speechSynthesis?.cancel();
            router.back();
          }} className="p-2 rounded-xl bg-white/5 text-white shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Icône manœuvre */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "25" }}>
            <ManeuverArrow maneuver={maneuver} color={activeColor} />
          </div>

          <div className="flex-1 min-w-0">
            {distStep && <p className="text-2xl font-black text-white leading-none">{distStep}</p>}
            <p className="text-sm font-semibold text-gray-200 leading-tight line-clamp-2 mt-0.5">{instruction}</p>
          </div>

          <button onClick={() => { muted.current = !muted.current; setMuteUI(m => !m); }}
            className="p-2 rounded-xl bg-white/5 text-gray-400 shrink-0">
            {muteUI ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Ligne 2 : prochaine étape */}
        {nextInstr && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-gray-500" />
            <p className="text-xs text-gray-400 truncate">Ensuite · {nextInstr}</p>
          </div>
        )}

        {/* Ligne 3 : ETA + distances + recalc */}
        <div className="flex items-center gap-3 px-4 pb-2 border-t border-white/5 pt-2">
          {eta && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-sm font-black text-white">{eta}</span>
            </div>
          )}
          {distStore && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">{distStore} store</span>
            </div>
          )}
          {distClient && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs text-gray-400">{distClient} client</span>
            </div>
          )}
          {distTotal && (
            <span className="ml-auto text-xs font-bold text-gray-500">Total {distTotal}</span>
          )}
          <button onClick={recalc} className="p-1.5 rounded-lg bg-white/8 text-gray-400 shrink-0">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ══ CARTE ══ */}
      <div className="flex-1 relative overflow-hidden">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Chargement navigation…</p>
            </div>
          </div>
        )}
        <div ref={mapDiv} className="w-full h-full" />

        {/* Boussole */}
        <button onClick={() => map.current?.setHeading(0)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center border border-white/10">
          <div style={{ transform: `rotate(${-heading}deg)`, transition: "transform 0.4s" }}>
            <Navigation className="h-5 w-5 text-red-400" />
          </div>
        </button>

        {/* Légende */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-2xl px-3 py-2 space-y-1.5 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-xs text-gray-300 font-medium">Vous</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-xs text-gray-300">🏪 {storeName}</span>
          </div>
          {clientLat > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs text-gray-300">📦 {clientName}</span>
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="shrink-0 bg-[#111] border-t border-white/5 px-4 pt-3 pb-6">

        {/* Destination + actions */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "25" }}>
            <MapPin className="h-4 w-4" style={{ color: activeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 font-medium">{isPickup ? "Commerce" : "Livraison pour"}</p>
            <p className="text-sm font-bold text-white truncate">{destLabel}</p>
            <p className="text-xs text-gray-500 truncate">{destAddr}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { paused.current = true; setCoffee(true); }}
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

        {/* Bouton arrivée */}
        <button onClick={confirmArrival} disabled={confirming}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: arrived ? activeColor : "#1f2937" }}>
          {confirming
            ? <><Loader2 className="h-4 w-4 animate-spin" />Confirmation…</>
            : <><CheckCircle2 className="h-5 w-5" />{isPickup ? "✅ Arrivé au commerce" : "✅ Arrivé chez le client"}</>}
        </button>
        {!arrived && (
          <p className="text-center text-xs text-gray-600 mt-1.5">S&apos;active automatiquement à l&apos;arrivée</p>
        )}
      </div>

      {/* Modal pause café */}
      {coffee && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white">Pause café</p>
                <p className="text-xs text-gray-400">Navigation en pause</p>
              </div>
            </div>
            <button onClick={() => { paused.current = false; setCoffee(false); }}
              className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm">
              ▶ Reprendre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
