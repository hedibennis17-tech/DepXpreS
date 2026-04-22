"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";

declare global { interface Window { google: any; initMap: () => void; } }

const REGION_STYLE: Record<string, { fill: string; stroke: string; label: string }> = {
  laval:         { fill: "#f97316", stroke: "#ea6c00", label: "Laval" },
  montreal:      { fill: "#3b82f6", stroke: "#2563eb", label: "Montréal" },
  west_extended: { fill: "#ec4899", stroke: "#db2777", label: "Ouest / West Island" },
  south_west:    { fill: "#ef4444", stroke: "#dc2626", label: "Sud-Ouest" },
};

interface Driver { id:string; name:string; lat:number; lng:number; status:string; zone:string; }

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const drawnItems = useRef<any[]>([]);
  const geoData = useRef<any>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoLoaded, setGeoLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set(Object.keys(REGION_STYLE)));
  const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    window.initMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=initMap`;
    s.async = true; document.head.appendChild(s);
  }, []);

  useEffect(() => {
    fetch("/montreal_zones.json")
      .then(r => r.json())
      .then(d => { geoData.current = d; setGeoLoaded(true); })
      .catch(() => setGeoLoaded(true));
  }, []);

  useEffect(() => {
    if (!mapLoaded || !geoLoaded || !mapRef.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.530, lng: -73.650 },
      zoom: 11,
      styles: [{ featureType:"poi", stylers:[{visibility:"off"}] }],
      streetViewControl: false,
    });
    drawAll(activeRegions);
    setLoading(false);
  }, [mapLoaded, geoLoaded]);

  useEffect(() => {
    if (!mapInst.current) return;
    drawAll(activeRegions);
  }, [activeRegions]);

  function drawAll(active: Set<string>) {
    drawnItems.current.forEach(item => { item.poly?.setMap(null); item.label?.setMap(null); });
    drawnItems.current = [];
    const infoWin = new window.google.maps.InfoWindow();
    if (!geoData.current) return;

    geoData.current.features.forEach((feat: any) => {
      const region = feat.properties.region;
      if (!active.has(region)) return;
      const s = REGION_STYLE[region];
      const geom = feat.geometry;
      const allRings = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];

      // Calculer centre
      let latSum = 0, lngSum = 0, count = 0;
      allRings[0][0].forEach(([lng, lat]: number[]) => { latSum += lat; lngSum += lng; count++; });
      const center = { lat: latSum/count, lng: lngSum/count };

      allRings.forEach((ring: number[][][]) => {
        const paths = ring.map((loop: number[][]) =>
          loop.map(([lng, lat]: number[]) => ({ lat, lng }))
        );
        const poly = new window.google.maps.Polygon({
          paths,
          strokeColor: s.stroke, strokeOpacity: 1, strokeWeight: 1.5,
          fillColor: s.fill, fillOpacity: 0.22,
          map: mapInst.current,
        });
        poly.addListener("click", (e: any) => {
          infoWin.setContent(`<div style="font-family:sans-serif;padding:6px 12px">
            <b style="font-size:14px">${feat.properties.name}</b><br/>
            <span style="font-size:12px;color:#6b7280">${s.label}</span>
          </div>`);
          infoWin.setPosition(e.latLng);
          infoWin.open(mapInst.current);
        });
        drawnItems.current.push({ poly });
      });

      // Label au centre
      const label = new window.google.maps.Marker({
        position: center,
        map: mapInst.current,
        icon: { path: "M 0,0", scale: 0 },
        label: { text: feat.properties.name, color: s.stroke, fontSize: "10px", fontWeight: "700" },
        zIndex: 5,
      });
      drawnItems.current.push({ poly: label });
    });
  }

  useEffect(() => {
    if (!mapLoaded) return;
    const q = query(collection(db, "driver_profiles"), where("driver_status","in",["online","delivering","available"]));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.filter(d => d.data().last_lat).map(d => ({
        id: d.id, name: d.data().full_name||"Chauffeur",
        lat: d.data().last_lat, lng: d.data().last_lng,
        status: d.data().driver_status||"offline", zone: d.data().zone_name||"",
      }));
      setDrivers(list); updateMarkers(list);
    });
    return () => unsub();
  }, [mapLoaded]);

  function updateMarkers(list: Driver[]) {
    if (!mapInst.current || !window.google) return;
    markers.current.forEach(m => m.setMap(null)); markers.current = [];
    list.forEach(d => {
      const color = d.status==="delivering" ? "#3b82f6" : "#22c55e";
      const m = new window.google.maps.Marker({
        map: mapInst.current, position:{lat:d.lat,lng:d.lng},
        icon:{path:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",fillColor:color,fillOpacity:1,strokeColor:"#fff",strokeWeight:2,scale:1.8,anchor:new window.google.maps.Point(12,22)},
        title:d.name, zIndex:10,
      });
      const info = new window.google.maps.InfoWindow({content:`<div style="font-family:sans-serif;padding:8px"><b>${d.name}</b><br><span style="color:#6b7280;font-size:12px">${d.zone||"—"}</span><br><span style="color:${color};font-size:12px;font-weight:600">${d.status==="delivering"?"🚗 En livraison":"🟢 Disponible"}</span></div>`});
      m.addListener("click",()=>info.open(mapInst.current,m));
      markers.current.push(m);
    });
  }

  function toggleRegion(r: string) {
    setActiveRegions(prev => { const n=new Set(prev); n.has(r)?n.delete(r):n.add(r); return n; });
  }

  const online = drivers.filter(d=>d.status!=="offline").length;
  const delivering = drivers.filter(d=>d.status==="delivering").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">🗺️ Carte live — Grand Montréal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>Temps réel
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {label:"Zones chargées", value:geoData.current?.features?.length||0, color:"text-blue-600", bg:"bg-blue-50 border-blue-200"},
          {label:"Chauffeurs en ligne", value:online, color:"text-green-600", bg:"bg-green-50 border-green-200"},
          {label:"En livraison", value:delivering, color:"text-orange-600", bg:"bg-orange-50 border-orange-200"},
          {label:"Disponibles", value:online-delivering, color:"text-gray-700", bg:"bg-gray-50 border-gray-200"},
        ].map(s=>(
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-semibold mr-1">Filtrer :</span>
        {Object.entries(REGION_STYLE).map(([region,s])=>{
          const active=activeRegions.has(region);
          return (
            <button key={region} onClick={()=>toggleRegion(region)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${active?"opacity-100 shadow-sm":"opacity-35"}`}
              style={{borderColor:s.stroke,background:active?s.fill+"22":"#f9fafb",color:s.stroke}}>
              <span className="w-2.5 h-2.5 rounded-full" style={{background:s.fill}}/>
              {s.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"/><span className="text-xs text-gray-500">Disponible</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"/><span className="text-xs text-gray-500">En livraison</span></div>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {(!mapLoaded||loading)&&(
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2"/>
              <p className="text-sm text-gray-500">Chargement des polygones...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{height:"650px",width:"100%"}}/>
      </div>
    </div>
  );
}
