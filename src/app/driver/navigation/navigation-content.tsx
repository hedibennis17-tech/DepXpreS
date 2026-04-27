"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Phone, CheckCircle2, Loader2, Volume2, VolumeX, RotateCcw, Clock, MapPin, Navigation } from "lucide-react";

declare global { interface Window { google: any; initNavMap: () => void; } }

const GMAPS_KEY = "AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8";

function getManeuverArrow(maneuver: string): string {
  const m = (maneuver||"").toLowerCase();
  if (m.includes("turn-left")||m.includes("turn_left")) return "↰";
  if (m.includes("turn-right")||m.includes("turn_right")) return "↱";
  if (m.includes("slight-left")||m.includes("slight_left")) return "↖";
  if (m.includes("slight-right")||m.includes("slight_right")) return "↗";
  if (m.includes("u-turn")||m.includes("uturn")) return "⟳";
  if (m.includes("roundabout")) return "↻";
  if (m.includes("merge")||m.includes("ramp")) return "⬆";
  if (m.includes("left")) return "↰";
  if (m.includes("right")) return "↱";
  return "⬆";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&rsquo;/g,"'").trim();
}

interface StepInfo { instruction:string; distance:string; maneuver:string; }

export default function NavigationContent() {
  const router = useRouter();
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInst   = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeRef  = useRef<any>(null);
  const watchRef  = useRef<number|null>(null);
  const stepsRef  = useRef<any[]>([]);
  const stepIdxRef = useRef(0);
  const routeDrawnRef = useRef(false);
  const infoWinRef = useRef<any>(null);

  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [uid,        setUid]        = useState("");
  const [step,       setStep]       = useState<StepInfo>({instruction:"Calcul en cours...",distance:"",maneuver:""});
  const [eta,        setEta]        = useState("");
  const [dist,       setDist]       = useState("");
  const [muted,      setMuted]      = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [arrived,    setArrived]    = useState(false);
  const [confirming, setConfirming] = useState(false);
  const lastSpokenRef = useRef("");
  const mutableRef    = useRef({muted:false});

  // Params depuis URL
  const [params, setParams] = useState({
    orderId:"", phase:"pickup" as "pickup"|"dropoff",
    dest:"", lat:0, lng:0, client:"", phone:""
  });

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    setParams({
      orderId: p.get("orderId")||"",
      phase:   (p.get("phase")||"pickup") as "pickup"|"dropoff",
      dest:    p.get("dest")||"",
      lat:     parseFloat(p.get("lat")||"0"),
      lng:     parseFloat(p.get("lng")||"0"),
      client:  p.get("client")||"",
      phone:   p.get("phone")||"",
    });
  },[]);

  useEffect(()=>{ mutableRef.current.muted = muted; },[muted]);

  // Auth
  useEffect(()=>{
    const u = onAuthStateChanged(auth, u=>{ if(u) setUid(u.uid); });
    return ()=>u();
  },[]);

  // Charger Google Maps UNE SEULE FOIS avec loading=async
  useEffect(()=>{
    if (window.google?.maps) { setMapLoaded(true); return; }
    if (document.querySelector('script[data-nav-map]')) {
      // Script déjà en cours de chargement — attendre
      window.initNavMap = () => setMapLoaded(true);
      return;
    }
    window.initNavMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.setAttribute("data-nav-map","1");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=geometry&callback=initNavMap&loading=async`;
    s.async = true;
    document.head.appendChild(s);
    return ()=>{};
  },[]);

  // Init carte
  useEffect(()=>{
    if (!mapLoaded||!mapRef.current||mapInst.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current,{
      zoom:17,
      center:{lat:45.540,lng:-73.680},
      mapTypeId:"roadmap",
      disableDefaultUI:true,
      zoomControl:true,
      tilt:0,
      heading:0,
      styles:[
        {elementType:"geometry",stylers:[{color:"#1a1a2e"}]},
        {elementType:"labels.text.fill",stylers:[{color:"#9ca3af"}]},
        {elementType:"labels.text.stroke",stylers:[{color:"#1a1a2e"}]},
        {featureType:"road",elementType:"geometry",stylers:[{color:"#374151"}]},
        {featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#4b5563"}]},
        {featureType:"road.highway",elementType:"geometry",stylers:[{color:"#6b7280"}]},
        {featureType:"water",elementType:"geometry",stylers:[{color:"#0f172a"}]},
        {featureType:"poi",stylers:[{visibility:"off"}]},
        {featureType:"transit",stylers:[{visibility:"off"}]},
      ],
    });
    infoWinRef.current = new window.google.maps.InfoWindow();
    setLoading(false);
    startGPS();
  },[mapLoaded]);

  function startGPS(){
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      pos=>{
        const loc = {lat:pos.coords.latitude, lng:pos.coords.longitude};
        const heading = pos.coords.heading ?? 0;
        updateMarker(loc, heading);
        updateFirestore(loc, heading);
        if (!routeDrawnRef.current && params.lat && params.lng) {
          calcRoute(loc);
        } else if (routeDrawnRef.current && stepsRef.current.length>0) {
          checkStep(loc);
        }
      },
      err=>console.warn("GPS:",err.message),
      {enableHighAccuracy:true, maximumAge:1000, timeout:15000}
    );
  }

  // Re-démarrer GPS quand params chargés
  useEffect(()=>{
    if (!params.lat||!params.lng||!mapInst.current) return;
    if (!routeDrawnRef.current) {
      // Forcer recalcul si on a la position
      navigator.geolocation.getCurrentPosition(pos=>{
        const loc = {lat:pos.coords.latitude, lng:pos.coords.longitude};
        calcRoute(loc);
      },{},{enableHighAccuracy:true,timeout:10000});
    }
  },[params]);

  function updateMarker(loc:{lat:number;lng:number}, heading:number){
    if (!mapInst.current||!window.google) return;

    // Icône flèche orientée selon le vrai heading GPS
    const icon = {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: "#f97316",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
      rotation: heading, // heading = 0=Nord, 90=Est, 180=Sud, 270=Ouest
      anchor: new window.google.maps.Point(0, 2.5),
    };

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position:loc, map:mapInst.current, icon, zIndex:10,
      });
    } else {
      markerRef.current.setPosition(loc);
      markerRef.current.setIcon(icon);
    }

    // Centrer la carte sur le chauffeur avec bon heading
    mapInst.current.panTo(loc);
    // Orienter la carte dans la direction de conduite
    if (heading > 0) {
      mapInst.current.setHeading(heading);
    }
  }

  function calcRoute(origin:{lat:number;lng:number}){
    if (!window.google||!params.lat||!params.lng) return;
    if (routeDrawnRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers:true,
      polylineOptions:{strokeColor:"#f97316",strokeWeight:6,strokeOpacity:0.9},
    });
    directionsRenderer.setMap(mapInst.current);
    routeRef.current = directionsRenderer;

    directionsService.route({
      origin,
      destination:{lat:params.lat, lng:params.lng},
      travelMode:window.google.maps.TravelMode.DRIVING,
      drivingOptions:{
        departureTime:new Date(),
        trafficModel:"bestguess",
      },
    },(result:any, status:string)=>{
      if (status!=="OK") { console.error("Directions:", status); return; }
      directionsRenderer.setDirections(result);
      const leg = result.routes[0].legs[0];
      setEta(leg.duration_in_traffic?.text||leg.duration.text);
      setDist(leg.distance.text);
      stepsRef.current = leg.steps;
      stepIdxRef.current = 0;
      routeDrawnRef.current = true;

      if (leg.steps.length>0) {
        const s0 = leg.steps[0];
        const instr = stripHtml(s0.instructions);
        setStep({instruction:instr, distance:s0.distance.text, maneuver:s0.maneuver||""});
        speak(instr);
      }

      // Marker destination
      new window.google.maps.Marker({
        position:{lat:params.lat,lng:params.lng},
        map:mapInst.current,
        icon:{
          path:window.google.maps.SymbolPath.CIRCLE,
          scale:10,
          fillColor: params.phase==="pickup" ? "#3b82f6" : "#22c55e",
          fillOpacity:1,
          strokeColor:"#fff",
          strokeWeight:2,
        },
      });
    });
  }

  function checkStep(loc:{lat:number;lng:number}){
    const steps = stepsRef.current;
    const idx = stepIdxRef.current;
    if (!steps.length||!window.google) return;

    // Vérifier distance au prochain waypoint
    if (idx < steps.length) {
      const endLoc = steps[idx].end_location;
      const d = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(loc.lat,loc.lng),
        endLoc
      );
      if (d<25 && idx<steps.length-1) {
        stepIdxRef.current = idx+1;
        const next = steps[idx+1];
        const instr = stripHtml(next.instructions);
        setStep({instruction:instr, distance:next.distance.text, maneuver:next.maneuver||""});
        speak(instr);
      }
    }

    // Arrivée — distance au dernier point
    const last = steps[steps.length-1];
    const dFinal = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(loc.lat,loc.lng),
      last.end_location
    );
    if (dFinal<15) setArrived(true);
  }

  function speak(text:string){
    if (mutableRef.current.muted||!window.speechSynthesis||text===lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang="fr-FR"; u.rate=1.0;
    window.speechSynthesis.speak(u);
  }

  function recalculate(){
    if (!mapInst.current) return;
    routeDrawnRef.current = false;
    stepsRef.current = [];
    stepIdxRef.current = 0;
    routeRef.current?.setMap(null);
    navigator.geolocation.getCurrentPosition(pos=>{
      calcRoute({lat:pos.coords.latitude, lng:pos.coords.longitude});
    },{},{enableHighAccuracy:true,timeout:10000});
  }

  async function updateFirestore(loc:{lat:number;lng:number}, heading:number){
    if (!uid) return;
    try {
      await updateDoc(doc(db,"driver_profiles",uid),{
        last_lat:loc.lat, last_lng:loc.lng,
        heading, updatedAt:serverTimestamp(),
      });
    } catch{}
  }

  async function confirmArrival(){
    if (!params.orderId||!uid||confirming) return;
    setConfirming(true);
    try {
      await fetch("/api/driver/order-action",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          orderId:params.orderId,
          driverId:uid,
          action: params.phase==="pickup" ? "arrived_store" : "arrived_client",
        }),
      });
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      window.speechSynthesis?.cancel();
      router.push("/driver/orders");
    } catch(e){console.error(e);}
    finally{setConfirming(false);}
  }

  // Nettoyage
  useEffect(()=>()=>{
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
  },[]);

  const color = params.phase==="pickup" ? "#3b82f6" : "#22c55e";
  const label = params.phase==="pickup" ? "🏪 Vers le commerce" : "📦 Vers le client";
  const btnLabel = params.phase==="pickup" ? "✅ Arrivé au commerce" : "✅ Arrivé chez le client";

  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col" style={{zIndex:100}}>

      {/* ── HEADER NAVIGATION ── */}
      <div className="shrink-0 bg-[#111] border-b border-white/5" style={{zIndex:10}}>
        {/* Manœuvre */}
        <div className="flex items-center">
          <button onClick={()=>{
            if(watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
            window.speechSynthesis?.cancel();
            router.back();
          }} className="p-4 text-white shrink-0">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <div className="flex-1 flex items-center gap-3 px-2 py-3">
            {/* Flèche */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-4xl font-bold"
              style={{background:color+"22",color}}>
              {getManeuverArrow(step.maneuver)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{color}}>{step.distance}</p>
              <p className="text-white font-bold text-base leading-tight line-clamp-2">{step.instruction}</p>
            </div>
          </div>
          <button onClick={()=>setMuted(m=>!m)} className="p-4 text-gray-400 shrink-0">
            {muted ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
          </button>
        </div>

        {/* ETA + info */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400"/>
              <span className="text-sm font-bold text-white">{eta||"—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-400"/>
              <span className="text-sm text-gray-400">{dist||"—"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={{background:color+"22",color}}>{label}</span>
            <button onClick={recalculate}
              className="p-1.5 rounded-xl bg-white/5 text-gray-400">
              <RotateCcw className="h-3.5 w-3.5"/>
            </button>
          </div>
        </div>
      </div>

      {/* ── CARTE ── */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2"/>
              <p className="text-gray-400 text-sm">Chargement navigation...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full"/>
      </div>

      {/* ── BOTTOM ── */}
      <div className="shrink-0 bg-[#111] border-t border-white/5 px-4 py-4 space-y-3">
        {/* Destination */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{background:color+"22"}}>
            <Navigation className="h-4 w-4" style={{color}}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{params.phase==="pickup"?"Commerce":"Livraison"}</p>
            <p className="text-sm font-bold text-white truncate">{params.dest||"—"}</p>
            {params.client && <p className="text-xs text-gray-500">{params.client}</p>}
          </div>
          {params.phone && (
            <a href={`tel:${params.phone}`}
              className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Phone className="h-4 w-4 text-green-400"/>
            </a>
          )}
        </div>

        {/* Bouton arrivée */}
        <button onClick={confirmArrival} disabled={confirming}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{background: arrived ? color : "#374151"}}>
          {confirming
            ? <><Loader2 className="h-5 w-5 animate-spin"/>Confirmation...</>
            : <><CheckCircle2 className="h-5 w-5"/>{btnLabel}</>}
        </button>
        {!arrived && (
          <p className="text-center text-xs text-gray-500">
            Le bouton s&apos;active automatiquement à l&apos;arrivée
          </p>
        )}
      </div>
    </div>
  );
}
