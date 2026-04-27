"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft, Phone, CheckCircle2, Loader2, Volume2, VolumeX,
  RotateCcw, Clock, MapPin, Navigation, Coffee, AlertTriangle
} from "lucide-react";

declare global { interface Window { google: any; initNavMap: () => void; } }

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

// ── Manœuvre → flèche SVG ──────────────────────────────────────────────────
function ManeuverIcon({ maneuver, color }: { maneuver: string; color: string }) {
  const m = (maneuver || "").toLowerCase();
  let rotate = 0;
  if (m.includes("turn-right") || m.includes("turn_right")) rotate = 90;
  else if (m.includes("turn-left") || m.includes("turn_left")) rotate = -90;
  else if (m.includes("slight-right") || m.includes("slight_right")) rotate = 45;
  else if (m.includes("slight-left") || m.includes("slight_left")) rotate = -45;
  else if (m.includes("u-turn") || m.includes("uturn")) rotate = 180;
  else if (m.includes("left")) rotate = -90;
  else if (m.includes("right")) rotate = 90;

  if (m.includes("roundabout")) {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <path d="M22 8 A14 14 0 1 1 8 22" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none"/>
        <polygon points="22,4 18,12 26,12" fill={color} transform={`rotate(45,22,22)`}/>
      </svg>
    );
  }

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.3s" }}>
      <line x1="22" y1="38" x2="22" y2="10" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <polygon points="22,4 14,16 30,16" fill={color}/>
    </svg>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "'").trim();
}

interface StepInfo { instruction: string; distance: string; maneuver: string; }

// ── Composant Pause café ───────────────────────────────────────────────────
function CoffeeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-white">Pause café</p>
            <p className="text-xs text-gray-400">La navigation est en pause</p>
          </div>
        </div>
        <p className="text-sm text-gray-300">
          La livraison est mise en attente. Appuyez sur Reprendre quand vous êtes prêt.
        </p>
        <button onClick={onClose}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors">
          ▶ Reprendre la navigation
        </button>
      </div>
    </div>
  );
}

export default function NavigationContent() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const route2Ref = useRef<any>(null);
  const watchRef = useRef<number | null>(null);
  const stepsRef = useRef<any[]>([]);
  const stepIdxRef = useRef(0);
  const routeDrawnRef = useRef(false);
  const lastSpokenRef = useRef("");
  const mutableRef = useRef({ muted: false, paused: false });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [uid, setUid] = useState("");
  const [step, setStep] = useState<StepInfo>({ instruction: "Calcul en cours...", distance: "", maneuver: "" });
  const [nextStep, setNextStep] = useState<StepInfo | null>(null);
  const [eta, setEta] = useState("");
  const [totalDist, setTotalDist] = useState("");
  const [distToStore, setDistToStore] = useState("");
  const [distToClient, setDistToClient] = useState("");
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showCoffee, setShowCoffee] = useState(false);
  const [heading, setHeading] = useState(0);

  // Params depuis URL
  const [params, setParams] = useState({
    orderId: "", phase: "pickup" as "pickup" | "dropoff",
    storeDest: "", storeLat: 0, storeLng: 0, storePhone: "", storeName: "",
    clientDest: "", clientLat: 0, clientLng: 0, clientName: "", clientPhone: "",
  });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setParams({
      orderId:    p.get("orderId") || "",
      phase:      (p.get("phase") || "pickup") as "pickup" | "dropoff",
      storeDest:  p.get("storeDest") || p.get("dest") || "",
      storeLat:   parseFloat(p.get("storeLat") || p.get("lat") || "0"),
      storeLng:   parseFloat(p.get("storeLng") || p.get("lng") || "0"),
      storePhone: p.get("storePhone") || "",
      storeName:  p.get("storeName") || "",
      clientDest: p.get("clientDest") || "",
      clientLat:  parseFloat(p.get("clientLat") || "0"),
      clientLng:  parseFloat(p.get("clientLng") || "0"),
      clientName: p.get("clientName") || p.get("client") || "",
      clientPhone:p.get("clientPhone") || p.get("phone") || "",
    });
  }, []);

  useEffect(() => { mutableRef.current.muted = muted; }, [muted]);
  useEffect(() => { mutableRef.current.paused = paused; }, [paused]);

  useEffect(() => {
    const u = onAuthStateChanged(auth, u => { if (u) setUid(u.uid); });
    return () => u();
  }, []);

  // Charger Google Maps
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    if (document.querySelector('script[data-nav-map]')) {
      window.initNavMap = () => setMapLoaded(true);
      return;
    }
    window.initNavMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.setAttribute("data-nav-map", "1");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=initNavMap&loading=async`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Init carte — style dark Uber
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInst.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current, {
      zoom: 17,
      center: { lat: 45.540, lng: -73.680 },
      mapTypeId: "roadmap",
      disableDefaultUI: true,
      tilt: 0,
      heading: 0,
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
    setLoading(false);
    startGPS();
  }, [mapLoaded]);

  // Déclencher calcRoute quand params + carte prêts
  useEffect(() => {
    if (!params.storeLat || !params.storeLng || !mapInst.current) return;
    if (!routeDrawnRef.current) {
      navigator.geolocation.getCurrentPosition(
        pos => calcRoute({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [params, mapLoaded]);

  function startGPS() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (mutableRef.current.paused) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const hdg = pos.coords.heading ?? 0;
        setHeading(hdg);
        updateMarker(loc, hdg);
        updateFirestore(loc, hdg);
        if (!routeDrawnRef.current && params.storeLat && params.storeLng) {
          calcRoute(loc);
        } else if (routeDrawnRef.current && stepsRef.current.length > 0) {
          checkStep(loc);
        }
      },
      err => console.warn("GPS:", err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  }

  function updateMarker(loc: { lat: number; lng: number }, hdg: number) {
    if (!mapInst.current || !window.google) return;
    const icon = {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 8,
      fillColor: "#f97316",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2.5,
      rotation: hdg,
      anchor: new window.google.maps.Point(0, 2.5),
    };
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: loc, map: mapInst.current, icon, zIndex: 20,
      });
    } else {
      markerRef.current.setPosition(loc);
      markerRef.current.setIcon(icon);
    }
    // Carte centrée sur chauffeur, orientée dans la direction de conduite
    mapInst.current.panTo(loc);
    if (hdg > 0) mapInst.current.setHeading(hdg);
  }

  function calcRoute(origin: { lat: number; lng: number }) {
    if (!window.google || !params.storeLat) return;
    if (routeDrawnRef.current) return;

    const DS = new window.google.maps.DirectionsService();
    const isPickup = params.phase === "pickup";

    // ── Segment 1 : chauffeur → store (toujours) ─────────────────────────
    const renderer1 = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 5, strokeOpacity: 0.85 },
    });
    renderer1.setMap(mapInst.current);
    routeRef.current = renderer1;

    DS.route({
      origin,
      destination: { lat: params.storeLat, lng: params.storeLng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (r: any, s: string) => {
      if (s !== "OK") return;
      renderer1.setDirections(r);
      const leg1 = r.routes[0].legs[0];
      setDistToStore(leg1.distance.text);

      // Marqueur store
      placeMarker(
        { lat: params.storeLat, lng: params.storeLng },
        "#3b82f6", "🏪", params.storeName || "Store"
      );

      // ── Segment 2 : store → client (si les coords existent) ────────────
      if (params.clientLat && params.clientLng) {
        const renderer2 = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#22c55e", strokeWeight: 5, strokeOpacity: 0.6, strokeDasharray: "8 4" },
        });
        renderer2.setMap(mapInst.current);
        route2Ref.current = renderer2;

        DS.route({
          origin: { lat: params.storeLat, lng: params.storeLng },
          destination: { lat: params.clientLat, lng: params.clientLng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (r2: any, s2: string) => {
          if (s2 !== "OK") return;
          renderer2.setDirections(r2);
          const leg2 = r2.routes[0].legs[0];
          setDistToClient(leg2.distance.text);

          // Distance totale
          const totalM = leg1.distance.value + leg2.distance.value;
          setTotalDist(totalM >= 1000 ? `${(totalM / 1000).toFixed(1)} km` : `${totalM} m`);
          const totalSec = leg1.duration.value + leg2.duration.value;
          const totalMin = Math.round(totalSec / 60);
          setEta(`${totalMin} min`);

          placeMarker(
            { lat: params.clientLat, lng: params.clientLng },
            "#22c55e", "📦", params.clientName || "Client"
          );
        });
      } else {
        // Juste store → pas de client coords
        setTotalDist(leg1.distance.text);
        setEta(leg1.duration.text);
      }

      // Navigation active sur le segment courant
      const activeLeg = isPickup ? leg1 : (null);
      if (isPickup) {
        stepsRef.current = leg1.steps;
        stepIdxRef.current = 0;
        routeDrawnRef.current = true;
        if (leg1.steps.length > 0) {
          const s0 = leg1.steps[0];
          setStep({ instruction: stripHtml(s0.instructions), distance: s0.distance.text, maneuver: s0.maneuver || "" });
          if (leg1.steps.length > 1) {
            const s1 = leg1.steps[1];
            setNextStep({ instruction: stripHtml(s1.instructions), distance: s1.distance.text, maneuver: s1.maneuver || "" });
          }
          speak(stripHtml(s0.instructions));
        }
      }
    });

    // Si phase dropoff : calculer route store → client pour navigation
    if (!isPickup && params.clientLat && params.clientLng) {
      DS.route({
        origin,
        destination: { lat: params.clientLat, lng: params.clientLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (r: any, s: string) => {
        if (s !== "OK") return;
        const leg = r.routes[0].legs[0];
        stepsRef.current = leg.steps;
        stepIdxRef.current = 0;
        routeDrawnRef.current = true;
        setDistToClient(leg.distance.text);
        if (leg.steps.length > 0) {
          const s0 = leg.steps[0];
          setStep({ instruction: stripHtml(s0.instructions), distance: s0.distance.text, maneuver: s0.maneuver || "" });
          if (leg.steps.length > 1) {
            const s1 = leg.steps[1];
            setNextStep({ instruction: stripHtml(s1.instructions), distance: s1.distance.text, maneuver: s1.maneuver || "" });
          }
          speak(stripHtml(s0.instructions));
        }
      });
    }
  }

  function placeMarker(pos: { lat: number; lng: number }, color: string, emoji: string, title: string) {
    if (!window.google || !mapInst.current) return;
    // Marqueur coloré
    new window.google.maps.Marker({
      position: pos,
      map: mapInst.current,
      zIndex: 15,
      title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    // Label emoji
    new window.google.maps.Marker({
      position: pos,
      map: mapInst.current,
      zIndex: 16,
      label: { text: emoji, fontSize: "16px" },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 0,
      },
    });
  }

  function checkStep(loc: { lat: number; lng: number }) {
    const steps = stepsRef.current;
    const idx = stepIdxRef.current;
    if (!steps.length || !window.google) return;

    if (idx < steps.length) {
      const endLoc = steps[idx].end_location;
      const d = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(loc.lat, loc.lng), endLoc
      );
      if (d < 25 && idx < steps.length - 1) {
        const newIdx = idx + 1;
        stepIdxRef.current = newIdx;
        const next = steps[newIdx];
        const instr = stripHtml(next.instructions);
        setStep({ instruction: instr, distance: next.distance.text, maneuver: next.maneuver || "" });
        // Prochaine étape
        if (newIdx + 1 < steps.length) {
          const n2 = steps[newIdx + 1];
          setNextStep({ instruction: stripHtml(n2.instructions), distance: n2.distance.text, maneuver: n2.maneuver || "" });
        } else {
          setNextStep(null);
        }
        speak(instr);
      }
    }

    const last = steps[steps.length - 1];
    const dFinal = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(loc.lat, loc.lng), last.end_location
    );
    if (dFinal < 15) setArrived(true);
  }

  function speak(text: string) {
    if (mutableRef.current.muted || !window.speechSynthesis || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

  function recalculate() {
    if (!mapInst.current) return;
    routeDrawnRef.current = false;
    stepsRef.current = [];
    stepIdxRef.current = 0;
    routeRef.current?.setMap(null);
    route2Ref.current?.setMap(null);
    navigator.geolocation.getCurrentPosition(
      pos => calcRoute({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function updateFirestore(loc: { lat: number; lng: number }, hdg: number) {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "driver_profiles", uid), {
        last_lat: loc.lat, last_lng: loc.lng,
        heading: hdg, updatedAt: serverTimestamp(),
      });
    } catch { }
  }

  async function confirmArrival() {
    if (!params.orderId || !uid || confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/driver/order-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: params.orderId, driverId: uid,
          action: params.phase === "pickup" ? "arrived_store" : "arrived_client",
        }),
      });
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      window.speechSynthesis?.cancel();
      router.push("/driver/orders");
    } catch (e) { console.error(e); }
    finally { setConfirming(false); }
  }

  useEffect(() => () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  const isPickup = params.phase === "pickup";
  const activeColor = isPickup ? "#3b82f6" : "#22c55e";
  const destLabel = isPickup ? (params.storeName || "Commerce") : (params.clientName || "Client");
  const destAddr = isPickup ? params.storeDest : params.clientDest;
  const phoneToCall = isPickup ? params.storePhone : params.clientPhone;

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col" style={{ zIndex: 100 }}>

      {/* ═══════════════ HEADER — Style Uber ═══════════════ */}
      <div className="shrink-0" style={{ zIndex: 10 }}>

        {/* Prochaine manœuvre principale */}
        <div className="bg-[#111]/95 backdrop-blur-md px-4 pt-4 pb-2 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
            window.speechSynthesis?.cancel();
            router.back();
          }} className="p-2 rounded-xl bg-white/5 text-white shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Icône manœuvre */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "22" }}>
            <ManeuverIcon maneuver={step.maneuver} color={activeColor} />
          </div>

          {/* Instruction + distance */}
          <div className="flex-1 min-w-0">
            {step.distance && (
              <p className="text-2xl font-black text-white leading-none mb-0.5">{step.distance}</p>
            )}
            <p className="text-sm font-bold text-gray-200 leading-tight line-clamp-2">
              {step.instruction}
            </p>
          </div>

          {/* Son */}
          <button onClick={() => setMuted(m => !m)}
            className="p-2 rounded-xl bg-white/5 text-gray-400 shrink-0">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Prochaine étape (after next) */}
        {nextStep && (
          <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-60"
              style={{ background: activeColor + "15" }}>
              <ManeuverIcon maneuver={nextStep.maneuver} color={activeColor} />
            </div>
            <p className="text-xs text-gray-400 flex-1 truncate">
              Ensuite · {nextStep.distance} · {nextStep.instruction}
            </p>
          </div>
        )}

        {/* Barre ETA + distances */}
        <div className="bg-[#111]/95 px-4 py-2 flex items-center gap-4 border-b border-white/5">
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-sm font-black text-white">{eta || "—"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" />
            {distToStore || "—"} store
          </div>
          {distToClient && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
              {distToClient} client
            </div>
          )}
          {totalDist && (
            <div className="ml-auto text-xs font-bold text-gray-400">
              Total {totalDist}
            </div>
          )}
          <button onClick={recalculate}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 shrink-0">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════ CARTE ═══════════════ */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Chargement navigation...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Boussole orientation */}
        <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center border border-white/10">
          <div style={{ transform: `rotate(${-heading}deg)`, transition: "transform 0.3s" }}>
            <Navigation className="h-5 w-5 text-red-500" />
          </div>
        </div>

        {/* Légende 3 points */}
        <div className="absolute top-3 left-3 bg-black/70 rounded-2xl px-3 py-2 space-y-1.5 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-xs text-gray-300">Vous</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-xs text-gray-300">🏪 {params.storeName || "Store"}</span>
          </div>
          {params.clientLat > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs text-gray-300">📦 {params.clientName || "Client"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ BOTTOM BAR — Style Uber ═══════════════ */}
      <div className="shrink-0 bg-[#111] border-t border-white/5">

        {/* Destination info */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: activeColor + "22" }}>
            <MapPin className="h-4 w-4" style={{ color: activeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">{isPickup ? "Commerce" : "Livraison pour"}</p>
            <p className="text-sm font-bold text-white truncate">{destLabel}</p>
            <p className="text-xs text-gray-500 truncate">{destAddr}</p>
          </div>
          {/* Actions rapides */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Pause café */}
            <button onClick={() => { setPaused(true); setShowCoffee(true); }}
              className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"
              title="Pause café">
              <Coffee className="h-4 w-4 text-amber-400" />
            </button>
            {/* Urgence 911 */}
            <a href="tel:911"
              className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center"
              title="Urgence 911">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </a>
            {/* Appel client/store */}
            {phoneToCall && (
              <a href={`tel:${phoneToCall}`}
                className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center"
                title="Appeler">
                <Phone className="h-4 w-4 text-green-400" />
              </a>
            )}
          </div>
        </div>

        {/* Bouton arrivée */}
        <div className="px-4 pb-5">
          <button onClick={confirmArrival} disabled={confirming}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
            style={{ background: arrived ? activeColor : "#1f2937" }}>
            {confirming
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Confirmation...</>
              : <><CheckCircle2 className="h-5 w-5" />{isPickup ? "✅ Arrivé au commerce" : "✅ Arrivé chez le client"}</>
            }
          </button>
          {!arrived && (
            <p className="text-center text-xs text-gray-600 mt-1.5">
              S&apos;active automatiquement à l&apos;arrivée
            </p>
          )}
        </div>
      </div>

      {/* Modal pause café */}
      {showCoffee && (
        <CoffeeModal onClose={() => { setPaused(false); setShowCoffee(false); }} />
      )}
    </div>
  );
}
