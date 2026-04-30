"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft, Volume2, VolumeX, RotateCcw,
  Clock, MapPin, Coffee, AlertTriangle, Phone,
  CheckCircle2, Loader2, Navigation
} from "lucide-react";

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";
// ⬇️ Remplacer par ton Map ID vectoriel Google Cloud
const MAP_ID = "5988f952fa7dbd4b9b70abd9";

// ── Routes API ────────────────────────────────────────────────────────────────
async function fetchRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoint?: { lat: number; lng: number }
) {
  const body: any = {
    origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
    destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE_OPTIMAL",
    languageCode: "fr-CA",
    units: "METRIC",
    polylineQuality: "HIGH_QUALITY",
    polylineEncoding: "ENCODED_POLYLINE",
  };
  if (waypoint) {
    body.intermediates = [{ location: { latLng: { latitude: waypoint.lat, longitude: waypoint.lng } } }];
  }
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GMAPS_KEY,
      "X-Goog-FieldMask": [
        "routes.duration",
        "routes.distanceMeters",
        "routes.polyline.encodedPolyline",
        "routes.legs.steps.navigationInstruction",
        "routes.legs.steps.distanceMeters",
        "routes.legs.steps.polyline.encodedPolyline",
        "routes.legs.steps.startLocation",
        "routes.legs.steps.endLocation",
      ].join(","),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Routes API ${res.status}`);
  return res.json();
}

// ── Décoder polyline encodée ──────────────────────────────────────────────────
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, b: number;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

// ── Calculer bearing entre 2 points ──────────────────────────────────────────
function computeBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (to.lat * Math.PI) / 180;
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ── Flèche manœuvre ───────────────────────────────────────────────────────────
function ManeuverArrow({ maneuver, color }: { maneuver: string; color: string }) {
  const m = (maneuver || "").toLowerCase();
  let rotate = 0;
  if (m.includes("right") && !m.includes("slight")) rotate = 90;
  else if (m.includes("left") && !m.includes("slight")) rotate = -90;
  else if (m.includes("slight_right") || m.includes("slight-right")) rotate = 45;
  else if (m.includes("slight_left") || m.includes("slight-left")) rotate = -45;
  else if (m.includes("u_turn") || m.includes("uturn")) rotate = 180;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.3s" }}>
      <line x1="18" y1="32" x2="18" y2="6" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <polygon points="18,2 10,12 26,12" fill={color}/>
    </svg>
  );
}

// ── Loader Google Maps SDK ────────────────────────────────────────────────────
let _mapsPromise: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (_mapsPromise) return _mapsPromise;
  _mapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.Map) { resolve(); return; }
    const cb = `__gmNav${Date.now()}`;
    (window as any)[cb] = () => { delete (window as any)[cb]; resolve(); };
    const s = document.createElement("script");
    s.onerror = () => { _mapsPromise = null; reject(new Error("Maps SDK failed")); };
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry,marker&callback=${cb}&loading=async`;
    document.head.appendChild(s);
    setTimeout(() => { _mapsPromise = null; reject(new Error("Maps timeout")); }, 15000);
  });
  return _mapsPromise;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// ═════════════════════════════════════════════════════════════════════════════
export default function NavigationContent() {
  const router = useRouter();
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const watchId = useRef<number | null>(null);
  const prevPos = useRef<{ lat: number; lng: number } | null>(null);
  const routePolyRef = useRef<any>(null);
  const route2PolyRef = useRef<any>(null);
  const storeMkRef = useRef<any>(null);
  const clientMkRef = useRef<any>(null);
  const driverElRef = useRef<HTMLDivElement | null>(null);
  const driverMkRef = useRef<any>(null);
  const stepsRef = useRef<any[]>([]);
  const stepIdxRef = useRef(0);
  const mutedRef = useRef(false);
  const pausedRef = useRef(false);
  const lastSpokenRef = useRef("");
  const uidRef = useRef("");
  const routeDrawnRef = useRef(false);
  const bearingRef = useRef(0);

  // UI States
  const [ready, setReady] = useState(false);
  const [mapErr, setMapErr] = useState("");
  const [mutedUI, setMutedUI] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [instruction, setInstruction] = useState("Calcul de l'itinéraire…");
  const [distStep, setDistStep] = useState("");
  const [maneuver, setManeuver] = useState("");
  const [nextInstr, setNextInstr] = useState("");
  const [eta, setEta] = useState("");
  const [distStore, setDistStore] = useState("");
  const [distClient, setDistClient] = useState("");
  const [distTotal, setDistTotal] = useState("");
  const [arrived, setArrived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [coffee, setCoffee] = useState(false);
  const [vehicle, setVehicle] = useState<"car" | "moto" | "bike">("car");
  const [showVehicle, setShowVehicle] = useState(false);

  // Auth
  useEffect(() => {
    return onAuthStateChanged(auth, u => { if (u) uidRef.current = u.uid; });
  }, []);

  // ── Lire params URL ───────────────────────────────────────────────────────
  const getParams = useCallback(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      phase: (p.get("phase") || "pickup") as "pickup" | "dropoff",
      orderId: p.get("orderId") || "",
      storeName: p.get("storeName") || "Commerce",
      storeLat: parseFloat(p.get("storeLat") || p.get("lat") || "0"),
      storeLng: parseFloat(p.get("storeLng") || p.get("lng") || "0"),
      storePhone: p.get("storePhone") || "",
      storeDest: p.get("storeDest") || p.get("dest") || "",
      clientName: p.get("clientName") || p.get("client") || "Client",
      clientLat: parseFloat(p.get("clientLat") || "0"),
      clientLng: parseFloat(p.get("clientLng") || "0"),
      clientDest: p.get("clientDest") || "",
      clientPhone: p.get("clientPhone") || p.get("phone") || "",
    };
  }, []);

  // ── Init carte vectorielle WebGL ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try { await loadMaps(); } catch (e: any) { if (!cancelled) setMapErr(e.message); return; }
      if (cancelled || !mapDiv.current) return;
      const g = window.google.maps;
      mapObj.current = new g.Map(mapDiv.current, {
        zoom: 18,
        center: { lat: 45.57, lng: -73.74 },
        mapId: MAP_ID,           // ← Carte vectorielle WebGL
        disableDefaultUI: true,
        gestureHandling: "greedy",
        tilt: 45,
        heading: 0,
      });
      setReady(true);
      // GPS immédiat
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled) return;
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          prevPos.current = loc;
          placeDriverMarker(loc, 0);
          mapObj.current.moveCamera({ center: loc, zoom: 18, tilt: 45, heading: 0 });
          drawRoutes(loc);
          startWatch();
        },
        () => {
          // Fallback sans GPS
          const p = getParams();
          if (p.storeLat && p.storeLng) {
            const approx = { lat: p.storeLat - 0.008, lng: p.storeLng };
            drawRoutes(approx);
          }
          startWatch();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  // ── Placer flèche chauffeur custom (AdvancedMarkerElement) ────────────────
  function placeDriverMarker(loc: { lat: number; lng: number }, hdg: number) {
    if (!mapObj.current || !window.google) return;
    const g = window.google.maps;
    if (!driverElRef.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 56px; height: 56px;
        display: flex; align-items: center; justify-content: center;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
        transform-origin: center center;
      `;
      el.innerHTML = `
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(249,115,22,0.2);
          border:2px solid rgba(249,115,22,0.5);display:flex;align-items:center;justify-content:center;">
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
            <polygon points="16,2 30,36 16,26 2,36" fill="#f97316" stroke="white" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>`;
      driverElRef.current = el;
      // Utiliser AdvancedMarkerElement si disponible (carte vectorielle)
      if (g.marker?.AdvancedMarkerElement) {
        driverMkRef.current = new g.marker.AdvancedMarkerElement({
          position: loc,
          map: mapObj.current,
          content: el,
          zIndex: 20,
        });
      } else {
        // Fallback Marker classique
        driverMkRef.current = new g.Marker({
          position: loc,
          map: mapObj.current,
          zIndex: 20,
          icon: { path: g.SymbolPath.CIRCLE, scale: 0 },
        });
      }
    } else {
      if (driverMkRef.current.position !== undefined) {
        driverMkRef.current.position = loc;
      } else {
        driverMkRef.current.setPosition(loc);
      }
    }
    // Tourner la flèche selon le bearing
    if (driverElRef.current) {
      driverElRef.current.style.transform = `rotate(${hdg}deg)`;
    }
  }

  // ── Dessiner routes avec Routes API ──────────────────────────────────────
  async function drawRoutes(origin: { lat: number; lng: number }) {
    if (!mapObj.current || !window.google || routeDrawnRef.current) return;
    routeDrawnRef.current = true;
    const p = getParams();
    const g = window.google.maps;
    if (!p.storeLat || !p.storeLng) {
      // Géocoder l'adresse
      const geo = new g.Geocoder();
      geo.geocode({ address: p.storeDest + ", Québec, Canada" }, (res: any, st: string) => {
        if (st === "OK" && res?.[0]) {
          const loc = res[0].geometry.location;
          drawRoutesWithCoords(origin, { lat: loc.lat(), lng: loc.lng() }, p);
        } else setInstruction("Impossible de localiser le store");
      });
      return;
    }
    drawRoutesWithCoords(origin, { lat: p.storeLat, lng: p.storeLng }, p);
  }

  async function drawRoutesWithCoords(
    origin: { lat: number; lng: number },
    storeLoc: { lat: number; lng: number },
    p: ReturnType<typeof getParams>
  ) {
    if (!mapObj.current || !window.google) return;
    const g = window.google.maps;
    const bounds = new g.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(storeLoc);

    // ── Marqueur store ────────────────────────────────────────────────────
    placeStaticMarker(storeMkRef, storeLoc, "#3b82f6", "🏪", p.storeName);

    // ── Marqueur client ───────────────────────────────────────────────────
    const clientLoc = p.clientLat && p.clientLng ? { lat: p.clientLat, lng: p.clientLng } : null;
    if (clientLoc) {
      placeStaticMarker(clientMkRef, clientLoc, "#22c55e", "📦", p.clientName);
      bounds.extend(clientLoc);
    }

    try {
      // ── Route 1: chauffeur → store (Routes API) ───────────────────────
      const route1 = await fetchRoute(origin, storeLoc);
      if (route1.routes?.[0]) {
        const r = route1.routes[0];
        const pts = decodePolyline(r.polyline.encodedPolyline);
        drawPolyline(routePolyRef, pts, "#3b82f6", 6);
        setDistStore(r.distanceMeters >= 1000 ? `${(r.distanceMeters / 1000).toFixed(1)} km` : `${r.distanceMeters} m`);

        // Steps pour navigation active (pickup)
        if (p.phase === "pickup" && r.legs?.[0]?.steps) {
          initSteps(r.legs[0].steps, "routes");
        }

        // ── Route 2: store → client ───────────────────────────────────
        if (clientLoc) {
          const route2 = await fetchRoute(storeLoc, clientLoc);
          if (route2.routes?.[0]) {
            const r2 = route2.routes[0];
            const pts2 = decodePolyline(r2.polyline.encodedPolyline);
            drawPolyline(route2PolyRef, pts2, "#22c55e", 5, true);
            setDistClient(r2.distanceMeters >= 1000 ? `${(r2.distanceMeters / 1000).toFixed(1)} km` : `${r2.distanceMeters} m`);
            const totalM = r.distanceMeters + r2.distanceMeters;
            setDistTotal(totalM >= 1000 ? `${(totalM / 1000).toFixed(1)} km` : `${totalM} m`);
            const totalSec = parseInt(r.duration) + parseInt(r2.duration);
            setEta(`${Math.round(totalSec / 60)} min`);

            if (p.phase === "dropoff" && route2.routes[0].legs?.[0]?.steps) {
              // Pour dropoff: recalculer depuis la position actuelle vers client
              const routeDrop = await fetchRoute(origin, clientLoc);
              if (routeDrop.routes?.[0]?.legs?.[0]?.steps) {
                initSteps(routeDrop.routes[0].legs[0].steps, "routes");
              }
            }
          }
        } else {
          setDistTotal(distStore);
          setEta(`${Math.round(parseInt(r.duration) / 60)} min`);
        }
      }
    } catch (e) {
      console.error("Routes API error:", e);
      // Fallback Directions API
      fallbackDirections(origin, storeLoc, clientLoc, p);
    }

    // Zoom sur tous les points pendant 4s puis mode conduite
    mapObj.current.fitBounds(bounds, { top: 120, bottom: 220, left: 30, right: 30 });
    setTimeout(() => {
      if (!mapObj.current) return;
      const pos = prevPos.current || origin;
      mapObj.current.moveCamera({ center: pos, zoom: 18, tilt: 45, heading: bearingRef.current });
    }, 4000);
  }

  function drawPolyline(ref: any, pts: { lat: number; lng: number }[], color: string, weight: number, dashed = false) {
    if (!window.google || !mapObj.current) return;
    ref.current?.setMap(null);
    ref.current = new window.google.maps.Polyline({
      path: pts,
      strokeColor: color,
      strokeWeight: weight,
      strokeOpacity: dashed ? 0.7 : 0.9,
      icons: dashed ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }] : [],
      map: mapObj.current,
    });
  }

  function placeStaticMarker(ref: any, pos: { lat: number; lng: number }, color: string, emoji: string, title: string) {
    if (!window.google || !mapObj.current) return;
    const g = window.google.maps;
    if (!ref.current) {
      ref.current = new g.Marker({
        position: pos, map: mapObj.current, zIndex: 15, title,
        icon: { path: g.SymbolPath.CIRCLE, scale: 14, fillColor: color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
        label: { text: emoji, fontSize: "13px" },
      });
    }
  }

  // ── Initialiser les steps de navigation ───────────────────────────────────
  function initSteps(steps: any[], source: "routes" | "directions") {
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    if (!steps.length) return;
    const s = steps[0];
    const instr = source === "routes"
      ? stripHtml(s.navigationInstruction?.instructions || "Continuer")
      : stripHtml(s.instructions || "Continuer");
    const man = source === "routes"
      ? (s.navigationInstruction?.maneuver || "")
      : (s.maneuver || "");
    const dist = source === "routes"
      ? `${(s.distanceMeters / 1000).toFixed(1)} km`
      : s.distance?.text || "";
    setInstruction(instr);
    setDistStep(dist);
    setManeuver(man);
    if (steps[1]) {
      const s1 = steps[1];
      const i1 = source === "routes"
        ? stripHtml(s1.navigationInstruction?.instructions || "")
        : stripHtml(s1.instructions || "");
      setNextInstr(`${source === "routes" ? `${(s1.distanceMeters / 1000).toFixed(1)} km` : s1.distance?.text} · ${i1}`);
    }
    speak(instr);
  }

  // ── Fallback Directions API ───────────────────────────────────────────────
  function fallbackDirections(
    origin: { lat: number; lng: number },
    storeLoc: { lat: number; lng: number },
    clientLoc: { lat: number; lng: number } | null,
    p: ReturnType<typeof getParams>
  ) {
    if (!window.google || !mapObj.current) return;
    const DS = new window.google.maps.DirectionsService();
    const dest = p.phase === "pickup" ? storeLoc : (clientLoc || storeLoc);
    DS.route({
      origin, destination: dest,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (res: any, status: string) => {
      if (status !== "OK") { setInstruction("Erreur itinéraire"); return; }
      const leg = res.routes[0].legs[0];
      const pts = res.routes[0].overview_path.map((lp: any) => ({ lat: lp.lat(), lng: lp.lng() }));
      drawPolyline(routePolyRef, pts, "#3b82f6", 6);
      setDistTotal(leg.distance.text);
      setEta(leg.duration.text);
      initSteps(leg.steps, "directions");
    });
  }

  // ── GPS Watch ─────────────────────────────────────────────────────────────
  function startWatch() {
    if (!navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        if (pausedRef.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // Calculer le vrai bearing entre la position précédente et actuelle
        let hdg = pos.coords.heading ?? 0;
        if (prevPos.current && (prevPos.current.lat !== loc.lat || prevPos.current.lng !== loc.lng)) {
          const computed = computeBearing(prevPos.current, loc);
          // Utiliser le bearing calculé si le GPS heading n'est pas fiable
          if (computed > 0) hdg = computed;
        }
        prevPos.current = loc;
        bearingRef.current = hdg;
        setBearing(hdg);

        // Mettre à jour la flèche chauffeur (elle tourne avec le bearing)
        placeDriverMarker(loc, hdg);

        // moveCamera atomique — carte tourne selon le bearing
        if (mapObj.current) {
          mapObj.current.moveCamera({
            center: loc,
            zoom: 18,
            tilt: 45,
            heading: hdg,
          });
        }

        updateFirestore(loc, hdg);
        advanceStep(loc);
      },
      err => console.warn("GPS:", err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  }

  // ── Avancer dans les steps ────────────────────────────────────────────────
  function advanceStep(loc: { lat: number; lng: number }) {
    const steps = stepsRef.current;
    const idx = stepIdxRef.current;
    if (!steps.length || !window.google) return;
    const g = window.google.maps;
    const curr = steps[idx];
    if (!curr) return;

    // Détecter la fin de step selon la source (Routes API vs Directions API)
    const endLoc = curr.endLocation
      ? { lat: curr.endLocation.latLng?.latitude || curr.endLocation.lat, lng: curr.endLocation.latLng?.longitude || curr.endLocation.lng }
      : (curr.end_location ? { lat: curr.end_location.lat(), lng: curr.end_location.lng() } : null);

    if (!endLoc) return;
    const dist = g.geometry.spherical.computeDistanceBetween(
      new g.LatLng(loc.lat, loc.lng),
      new g.LatLng(endLoc.lat, endLoc.lng)
    );

    if (dist < 20 && idx < steps.length - 1) {
      const ni = idx + 1;
      stepIdxRef.current = ni;
      const ns = steps[ni];
      const isRoutes = !!ns.navigationInstruction;
      const instr = isRoutes ? stripHtml(ns.navigationInstruction?.instructions || "") : stripHtml(ns.instructions || "");
      const man = isRoutes ? (ns.navigationInstruction?.maneuver || "") : (ns.maneuver || "");
      const dist2 = isRoutes ? `${(ns.distanceMeters / 1000).toFixed(1)} km` : ns.distance?.text || "";
      setInstruction(instr); setDistStep(dist2); setManeuver(man);
      if (steps[ni + 1]) {
        const n2 = steps[ni + 1];
        const i2 = isRoutes ? stripHtml(n2.navigationInstruction?.instructions || "") : stripHtml(n2.instructions || "");
        setNextInstr(`${isRoutes ? `${(n2.distanceMeters / 1000).toFixed(1)} km` : n2.distance?.text} · ${i2}`);
      } else setNextInstr("");
      speak(instr);
    }

    // Arrivée finale
    const last = steps[steps.length - 1];
    const lastEnd = last.endLocation
      ? { lat: last.endLocation.latLng?.latitude || last.endLocation.lat, lng: last.endLocation.latLng?.longitude || last.endLocation.lng }
      : (last.end_location ? { lat: last.end_location.lat(), lng: last.end_location.lng() } : null);
    if (lastEnd) {
      const dFin = g.geometry.spherical.computeDistanceBetween(
        new g.LatLng(loc.lat, loc.lng),
        new g.LatLng(lastEnd.lat, lastEnd.lng)
      );
      if (dFin < 15) setArrived(true);
    }
  }

  function speak(text: string) {
    if (mutedRef.current || !window.speechSynthesis || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-CA"; u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }

  async function updateFirestore(loc: { lat: number; lng: number }, hdg: number) {
    if (!uidRef.current) return;
    const p = getParams();
    try {
      await updateDoc(doc(db, "driver_profiles", uidRef.current), {
        last_lat: loc.lat, last_lng: loc.lng, heading: hdg, updatedAt: serverTimestamp(),
      });
      if (p.orderId) {
        await updateDoc(doc(db, "orders", p.orderId), {
          driverLat: loc.lat, driverLng: loc.lng, driverHeading: hdg, driverLastSeen: serverTimestamp(),
        });
      }
    } catch { }
  }

  function recalc() {
    routeDrawnRef.current = false;
    stepsRef.current = []; stepIdxRef.current = 0;
    routePolyRef.current?.setMap(null); routePolyRef.current = null;
    route2PolyRef.current?.setMap(null); route2PolyRef.current = null;
    setInstruction("Recalcul…"); setDistStep(""); setManeuver("");
    setDistStore(""); setDistClient(""); setDistTotal(""); setEta("");
    navigator.geolocation.getCurrentPosition(
      pos => drawRoutes({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function confirmArrival() {
    const p = getParams();
    if (!p.orderId || confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/driver/order-action", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: p.orderId, driverId: uidRef.current,
          action: p.phase === "pickup" ? "arrived_store" : "arrived_client",
        }),
      });
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      window.speechSynthesis?.cancel();
      router.push("/driver/orders");
    } catch { } finally { setConfirming(false); }
  }

  useEffect(() => () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    window.speechSynthesis?.cancel();
  }, []);

  // UI helpers
  const p = typeof window !== "undefined" ? getParams() : null;
  const isPickup = p?.phase === "pickup";
  const activeColor = isPickup ? "#3b82f6" : "#22c55e";
  const destLabel = isPickup ? (p?.storeName || "Commerce") : (p?.clientName || "Client");
  const destAddr = isPickup ? (p?.storeDest || "") : (p?.clientDest || "");
  const phoneCall = isPickup ? (p?.storePhone || "") : (p?.clientPhone || "");
  const storeName = p?.storeName || "Store";
  const clientName = p?.clientName || "Client";
  const clientLat = p?.clientLat || 0;

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
            <p className="text-sm font-semibold text-gray-200 leading-tight line-clamp-2 mt-0.5">{instruction}</p>
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

        <div className="flex items-center gap-3 px-4 pb-2 border-t border-white/5 pt-2">
          {eta && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-orange-400" /><span className="text-sm font-black text-white">{eta}</span></div>}
          {distStore && <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-400">{distStore} → 🏪</span></div>}
          {distClient && <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-gray-400">{distClient} → 📦</span></div>}
          {distTotal && <span className="ml-auto text-xs font-bold text-gray-400">Total {distTotal}</span>}
          <button onClick={recalc} className="p-1.5 rounded-lg bg-white/5 text-gray-400"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* ══ CARTE ══ */}
      <div className="flex-1 relative overflow-hidden">
        {!ready && !mapErr && (
          <div className="absolute inset-0 bg-[#0f0f0f] z-10 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Chargement navigation…</p>
            </div>
          </div>
        )}
        {mapErr && (
          <div className="absolute inset-0 bg-[#0f0f0f] z-10 flex items-center justify-center px-6">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">Carte indisponible</p>
              <p className="text-gray-400 text-sm mb-4">{mapErr}</p>
              <button onClick={() => { setMapErr(""); _mapsPromise = null; window.location.reload(); }}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold">Réessayer</button>
            </div>
          </div>
        )}

        <div ref={mapDiv} className="w-full h-full" />

        {/* Boussole */}
        {ready && (
          <button onClick={() => mapObj.current?.moveCamera({ heading: 0, tilt: 45, zoom: 18 })}
            className="absolute top-3 right-3 w-12 h-12 rounded-full bg-black/80 flex flex-col items-center justify-center border border-white/15 gap-0.5">
            <div style={{ transform: `rotate(${-bearing}deg)`, transition: "transform 0.3s" }}>
              <svg width="22" height="22" viewBox="0 0 22 22">
                <polygon points="11,2 14,11 11,9 8,11" fill="#ef4444" />
                <polygon points="11,20 14,11 11,13 8,11" fill="white" />
              </svg>
            </div>
            <span className="text-[8px] text-gray-400 font-bold">N</span>
          </button>
        )}

        {/* Sélecteur véhicule */}
        {ready && (
          <button onClick={() => setShowVehicle(v => !v)}
            className="absolute top-3 left-3 w-12 h-12 rounded-full bg-black/80 flex items-center justify-center border border-white/15 text-xl">
            {vehicle === "car" ? "🚗" : vehicle === "moto" ? "🏍️" : "🚲"}
          </button>
        )}
        {showVehicle && (
          <div className="absolute top-16 left-3 bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden z-20">
            {(["car", "moto", "bike"] as const).map(v => (
              <button key={v} onClick={() => { setVehicle(v); setShowVehicle(false); }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left text-sm ${vehicle === v ? "bg-orange-500/20 text-orange-400" : "text-gray-300"}`}>
                <span className="text-xl">{v === "car" ? "🚗" : v === "moto" ? "🏍️" : "🚲"}</span>
                <span>{v === "car" ? "Voiture" : v === "moto" ? "Moto" : "Vélo / Bixi"}</span>
                {vehicle === v && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Légende */}
        {ready && (
          <div className="absolute bottom-3 left-3 bg-black/70 rounded-2xl px-3 py-2 space-y-1.5 border border-white/10">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-xs text-gray-300 font-medium">Vous</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-gray-300">🏪 {storeName}</span></div>
            {clientLat > 0 && <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-xs text-gray-300">📦 {clientName}</span></div>}
          </div>
        )}
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="shrink-0 bg-[#111] border-t border-white/5 px-4 pt-3 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: activeColor + "25" }}>
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
          {confirming ? <><Loader2 className="h-4 w-4 animate-spin" />Confirmation…</> : <><CheckCircle2 className="h-5 w-5" />{isPickup ? "✅ Arrivé au commerce" : "✅ Arrivé chez le client"}</>}
        </button>
        <p className="text-center text-xs text-gray-600 mt-1.5">S&apos;active automatiquement à l&apos;arrivée</p>
      </div>

      {/* Modal pause café */}
      {coffee && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
              <div><p className="font-bold text-white">Pause café ☕</p><p className="text-xs text-gray-400">Navigation en pause</p></div>
            </div>
            <button onClick={() => { pausedRef.current = false; setCoffee(false); }}
              className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm">▶ Reprendre</button>
          </div>
        </div>
      )}
    </div>
  );
}
