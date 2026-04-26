"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import {
  Navigation, ArrowLeft, Phone, CheckCircle2,
  Loader2, AlertTriangle, Volume2, VolumeX,
  RotateCcw, Clock, MapPin
} from "lucide-react";

declare global { interface Window { google: any; initNavMap: () => void; } }

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

interface StepInfo {
  instruction: string;
  distance: string;
  maneuver: string;
}

function getManeuverArrow(maneuver: string): string {
  const m = maneuver?.toLowerCase() || "";
  if (m.includes("turn-left") || m.includes("turn_left")) return "↰";
  if (m.includes("turn-right") || m.includes("turn_right")) return "↱";
  if (m.includes("slight-left") || m.includes("slight_left")) return "↖";
  if (m.includes("slight-right") || m.includes("slight_right")) return "↗";
  if (m.includes("u-turn") || m.includes("uturn")) return "⟳";
  if (m.includes("roundabout")) return "↻";
  if (m.includes("merge")) return "⬆";
  if (m.includes("ramp")) return "↗";
  return "⬆";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export default function NavigationContent() {
  const router = useRouter();
  // Lire les params depuis window.location (pas de useSearchParams = pas de Suspense requis)
  const [orderId, setOrderId] = useState("");
  const [phase, setPhase] = useState<"pickup"|"dropoff">("pickup");
  const [destAddr, setDestAddr] = useState("");
  const [destLat, setDestLat] = useState(0);
  const [destLng, setDestLng] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setOrderId(p.get("orderId") || "");
    setPhase((p.get("phase") || "pickup") as "pickup"|"dropoff");
    setDestAddr(p.get("dest") || "");
    setDestLat(parseFloat(p.get("lat") || "0"));
    setDestLng(parseFloat(p.get("lng") || "0"));
    setClientName(p.get("client") || "");
    setClientPhone(p.get("phone") || "");
  }, []);

  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInst   = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeRef  = useRef<any>(null);
  const watchRef  = useRef<number | null>(null);
  const stepIdxRef = useRef(0);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [uid, setUid] = useState("");
  const [currentStep, setCurrentStep] = useState<StepInfo>({ instruction: "Calcul de l'itinéraire...", distance: "", maneuver: "" });
  const [allSteps, setAllSteps] = useState<any[]>([]);
  const [eta, setEta] = useState("");
  const [totalDist, setTotalDist] = useState("");
  const [userPos, setUserPos] = useState<{lat:number;lng:number}|null>(null);
  const [muted, setMuted] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [routeDrawn, setRouteDrawn] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenRef = useRef("");

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (u) setUid(u.uid); });
    return () => unsub();
  }, []);

  // Charger Google Maps
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    window.initNavMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=initNavMap`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Init carte
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInst.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current, {
      zoom: 16,
      center: { lat: 45.530, lng: -73.650 },
      mapTypeId: "roadmap",
      disableDefaultUI: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#374151" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#4b5563" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#6b7280" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    startGPS();
  }, [mapLoaded]);

  function startGPS() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(loc);
        updateDriverLocation(loc, pos.coords.heading || 0);
        updateDriverMarker(loc, pos.coords.heading || 0);
        if (!routeDrawn && destLat && destLng) {
          calculateRoute(loc);
        } else if (routeDrawn && allSteps.length > 0) {
          updateNavStep(loc);
        }
      },
      err => console.error("GPS:", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }

  function updateDriverMarker(loc: {lat:number;lng:number}, heading: number) {
    if (!mapInst.current || !window.google) return;
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: loc,
        map: mapInst.current,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: "#f97316",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          rotation: heading,
          anchor: new window.google.maps.Point(0, 3),
        },
        zIndex: 10,
      });
    } else {
      markerRef.current.setPosition(loc);
      const icon = markerRef.current.getIcon();
      markerRef.current.setIcon({ ...icon, rotation: heading });
    }
    mapInst.current.panTo(loc);
  }

  function calculateRoute(origin: {lat:number;lng:number}) {
    if (!window.google || !destLat || !destLng) return;
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#f97316",
        strokeWeight: 5,
        strokeOpacity: 0.9,
      },
    });
    directionsRenderer.setMap(mapInst.current);
    routeRef.current = directionsRenderer;

    directionsService.route({
      origin,
      destination: { lat: destLat, lng: destLng },
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: "bestguess",
      },
    }, (result: any, status: string) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        const leg = result.routes[0].legs[0];
        setEta(leg.duration_in_traffic?.text || leg.duration.text);
        setTotalDist(leg.distance.text);
        const steps = leg.steps;
        setAllSteps(steps);
        stepIdxRef.current = 0;
        if (steps.length > 0) {
          setCurrentStep({
            instruction: stripHtml(steps[0].instructions),
            distance: steps[0].distance.text,
            maneuver: steps[0].maneuver || "",
          });
          speak(stripHtml(steps[0].instructions));
        }
        setRouteDrawn(true);

        // Marker destination
        new window.google.maps.Marker({
          position: { lat: destLat, lng: destLng },
          map: mapInst.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: phase === "pickup" ? "#3b82f6" : "#22c55e",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
      }
    });
  }

  function updateNavStep(loc: {lat:number;lng:number}) {
    if (!allSteps.length || !window.google) return;
    const idx = stepIdxRef.current;
    if (idx >= allSteps.length) return;
    const step = allSteps[idx];
    const endLoc = step.end_location;
    const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(loc.lat, loc.lng),
      new window.google.maps.LatLng(endLoc.lat(), endLoc.lng())
    );
    // Passer au step suivant si < 30m
    if (dist < 30 && idx < allSteps.length - 1) {
      stepIdxRef.current = idx + 1;
      const next = allSteps[idx + 1];
      const instr = stripHtml(next.instructions);
      setCurrentStep({
        instruction: instr,
        distance: next.distance.text,
        maneuver: next.maneuver || "",
      });
      speak(instr);
    }
    // Arrivée si < 20m du dernier step
    const lastStep = allSteps[allSteps.length - 1];
    const distFinal = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(loc.lat, loc.lng),
      new window.google.maps.LatLng(lastStep.end_location.lat(), lastStep.end_location.lng())
    );
    if (distFinal < 20) setArrived(true);
  }

  function speak(text: string) {
    if (muted || !window.speechSynthesis || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "fr-FR";
    utt.rate = 1.0;
    speechRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  async function updateDriverLocation(loc: {lat:number;lng:number}, heading: number) {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "driver_profiles", uid), {
        last_lat: loc.lat, last_lng: loc.lng,
        heading, updatedAt: serverTimestamp(),
      });
    } catch {}
  }

  async function confirmArrival() {
    if (!orderId || !uid || updating) return;
    setUpdating(true);
    try {
      const nextStatus = phase === "pickup" ? "picked_up" : "delivered";
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        ...(nextStatus === "delivered" ? { deliveredAt: serverTimestamp() } : {}),
      });
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      window.speechSynthesis?.cancel();
      router.push("/driver/orders");
    } catch(e) { console.error(e); }
    finally { setUpdating(false); }
  }

  function recalculate() {
    if (!userPos) return;
    if (routeRef.current) routeRef.current.setMap(null);
    setRouteDrawn(false);
    setAllSteps([]);
    stepIdxRef.current = 0;
    calculateRoute(userPos);
  }

  const phaseColor = phase === "pickup" ? "#3b82f6" : "#22c55e";
  const phaseLabel = phase === "pickup" ? "🏪 Récupération" : "📦 Livraison";
  const actionLabel = phase === "pickup" ? "✅ Arrivé au commerce" : "📦 Livraison confirmée";

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col" style={{ zIndex: 100 }}>

      {/* ── CHROME NAVIGATION (style Uber) ── */}
      <div className="shrink-0 bg-[#111] border-b border-white/5" style={{ zIndex: 10 }}>
        {/* Barre manœuvre */}
        <div className="flex items-center gap-0" style={{ background: "#111" }}>
          <button onClick={() => { if(watchRef.current) navigator.geolocation.clearWatch(watchRef.current); router.back(); }}
            className="p-4 text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-3 px-2 py-3">
            {/* Flèche manœuvre */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-4xl font-bold"
              style={{ background: phaseColor + "22", color: phaseColor }}>
              {getManeuverArrow(currentStep.maneuver)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: phaseColor }}>{currentStep.distance}</p>
              <p className="text-white font-bold text-base leading-tight truncate">{currentStep.instruction}</p>
            </div>
          </div>
          <button onClick={() => setMuted(m => !m)} className="p-4 text-gray-400">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* ETA + distance */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-sm font-bold text-white">{eta || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm text-gray-400">{totalDist || "—"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: phaseColor + "22", color: phaseColor }}>
              {phaseLabel}
            </span>
            <button onClick={recalculate} className="p-1.5 rounded-xl bg-white/5 text-gray-400">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CARTE ── */}
      <div className="flex-1 relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Chargement navigation...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div className="shrink-0 bg-[#111] border-t border-white/5 px-4 py-4 space-y-3">
        {/* Destination */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: phaseColor + "22" }}>
            <Navigation className="h-4 w-4" style={{ color: phaseColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{phase === "pickup" ? "Récupérer chez" : "Livrer à"}</p>
            <p className="text-sm font-bold text-white truncate">{destAddr || "—"}</p>
            {clientName && <p className="text-xs text-gray-500">{clientName}</p>}
          </div>
          {clientPhone && (
            <a href={`tel:${clientPhone}`}
              className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Phone className="h-4 w-4 text-green-400" />
            </a>
          )}
        </div>

        {/* Bouton action */}
        {arrived ? (
          <button onClick={confirmArrival} disabled={updating}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-colors"
            style={{ background: phaseColor }}>
            {updating
              ? <><Loader2 className="h-5 w-5 animate-spin" />Confirmation...</>
              : <><CheckCircle2 className="h-5 w-5" />{actionLabel}</>}
          </button>
        ) : (
          <button onClick={() => setArrived(true)}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-colors"
            style={{ background: "#374151" }}>
            <CheckCircle2 className="h-5 w-5" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
