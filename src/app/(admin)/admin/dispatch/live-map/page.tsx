"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";

declare global { interface Window { google: any; initMap: () => void; } }

const REGION_STYLE: Record<string, { fill: string; stroke: string; label: string }> = {
  laval:            { fill: "#f97316", stroke: "#ea6c00", label: "Laval" },
  montreal:         { fill: "#3b82f6", stroke: "#2563eb", label: "Montréal" },
  longueuil:        { fill: "#8b5cf6", stroke: "#7c3aed", label: "Longueuil" },
  north_shore:      { fill: "#10b981", stroke: "#059669", label: "Rive-Nord" },
  west_north_shore: { fill: "#06b6d4", stroke: "#0891b2", label: "Nord-Ouest" },
  west_extended:    { fill: "#ec4899", stroke: "#db2777", label: "Ouest / West Island" },
  south_shore_east: { fill: "#f59e0b", stroke: "#d97706", label: "Rive-Sud Est" },
  south_west:       { fill: "#ef4444", stroke: "#dc2626", label: "Sud-Ouest" },
};

const ZONES: { name: string; region: string; coords: {lat:number;lng:number}[] }[] = [
  // LAVAL
  { name:"Chomedey",            region:"laval", coords:[{lat:45.563,lng:-73.762},{lat:45.563,lng:-73.712},{lat:45.535,lng:-73.712},{lat:45.535,lng:-73.762}] },
  { name:"Laval-des-Rapides",   region:"laval", coords:[{lat:45.575,lng:-73.718},{lat:45.575,lng:-73.690},{lat:45.555,lng:-73.690},{lat:45.555,lng:-73.718}] },
  { name:"Pont-Viau",           region:"laval", coords:[{lat:45.584,lng:-73.700},{lat:45.584,lng:-73.678},{lat:45.567,lng:-73.678},{lat:45.567,lng:-73.700}] },
  { name:"Duvernay",            region:"laval", coords:[{lat:45.612,lng:-73.690},{lat:45.612,lng:-73.650},{lat:45.588,lng:-73.650},{lat:45.588,lng:-73.690}] },
  { name:"Vimont",              region:"laval", coords:[{lat:45.618,lng:-73.742},{lat:45.618,lng:-73.705},{lat:45.592,lng:-73.705},{lat:45.592,lng:-73.742}] },
  { name:"Auteuil",             region:"laval", coords:[{lat:45.567,lng:-73.780},{lat:45.567,lng:-73.745},{lat:45.542,lng:-73.745},{lat:45.542,lng:-73.780}] },
  { name:"Laval-Ouest",         region:"laval", coords:[{lat:45.558,lng:-73.815},{lat:45.558,lng:-73.783},{lat:45.533,lng:-73.783},{lat:45.533,lng:-73.815}] },
  { name:"Fabreville",          region:"laval", coords:[{lat:45.585,lng:-73.820},{lat:45.585,lng:-73.775},{lat:45.558,lng:-73.775},{lat:45.558,lng:-73.820}] },
  { name:"Sainte-Dorothée",     region:"laval", coords:[{lat:45.540,lng:-73.845},{lat:45.540,lng:-73.800},{lat:45.512,lng:-73.800},{lat:45.512,lng:-73.845}] },
  { name:"Sainte-Rose",         region:"laval", coords:[{lat:45.650,lng:-73.800},{lat:45.650,lng:-73.745},{lat:45.618,lng:-73.745},{lat:45.618,lng:-73.800}] },
  { name:"Saint-François",      region:"laval", coords:[{lat:45.660,lng:-73.710},{lat:45.660,lng:-73.655},{lat:45.628,lng:-73.655},{lat:45.628,lng:-73.710}] },
  { name:"St-Vincent-de-Paul",  region:"laval", coords:[{lat:45.628,lng:-73.670},{lat:45.628,lng:-73.630},{lat:45.598,lng:-73.630},{lat:45.598,lng:-73.670}] },
  { name:"Îles-Laval",          region:"laval", coords:[{lat:45.525,lng:-73.780},{lat:45.525,lng:-73.720},{lat:45.500,lng:-73.720},{lat:45.500,lng:-73.780}] },
  // MONTRÉAL
  { name:"Ahuntsic-Cartierville",  region:"montreal", coords:[{lat:45.580,lng:-73.725},{lat:45.580,lng:-73.648},{lat:45.548,lng:-73.648},{lat:45.548,lng:-73.725}] },
  { name:"Montréal-Nord",          region:"montreal", coords:[{lat:45.608,lng:-73.648},{lat:45.608,lng:-73.600},{lat:45.578,lng:-73.600},{lat:45.578,lng:-73.648}] },
  { name:"Saint-Laurent",          region:"montreal", coords:[{lat:45.535,lng:-73.720},{lat:45.535,lng:-73.655},{lat:45.495,lng:-73.655},{lat:45.495,lng:-73.720}] },
  { name:"Villeray–St-Michel",     region:"montreal", coords:[{lat:45.558,lng:-73.648},{lat:45.558,lng:-73.598},{lat:45.530,lng:-73.598},{lat:45.530,lng:-73.648}] },
  { name:"Rosemont–Pet.-Patrie",   region:"montreal", coords:[{lat:45.545,lng:-73.608},{lat:45.545,lng:-73.565},{lat:45.520,lng:-73.565},{lat:45.520,lng:-73.608}] },
  { name:"Plateau-Mont-Royal",     region:"montreal", coords:[{lat:45.530,lng:-73.582},{lat:45.530,lng:-73.558},{lat:45.512,lng:-73.558},{lat:45.512,lng:-73.582}] },
  { name:"Outremont",              region:"montreal", coords:[{lat:45.525,lng:-73.620},{lat:45.525,lng:-73.598},{lat:45.508,lng:-73.598},{lat:45.508,lng:-73.620}] },
  { name:"CDN–NDG",                region:"montreal", coords:[{lat:45.510,lng:-73.660},{lat:45.510,lng:-73.605},{lat:45.475,lng:-73.605},{lat:45.475,lng:-73.660}] },
  { name:"Ville-Marie",            region:"montreal", coords:[{lat:45.520,lng:-73.568},{lat:45.520,lng:-73.538},{lat:45.498,lng:-73.538},{lat:45.498,lng:-73.568}] },
  { name:"Le Sud-Ouest",           region:"montreal", coords:[{lat:45.488,lng:-73.598},{lat:45.488,lng:-73.558},{lat:45.458,lng:-73.558},{lat:45.458,lng:-73.598}] },
  { name:"Verdun",                 region:"montreal", coords:[{lat:45.472,lng:-73.578},{lat:45.472,lng:-73.548},{lat:45.452,lng:-73.548},{lat:45.452,lng:-73.578}] },
  { name:"LaSalle",                region:"montreal", coords:[{lat:45.448,lng:-73.650},{lat:45.448,lng:-73.605},{lat:45.422,lng:-73.605},{lat:45.422,lng:-73.650}] },
  { name:"Lachine",                region:"montreal", coords:[{lat:45.455,lng:-73.715},{lat:45.455,lng:-73.665},{lat:45.428,lng:-73.665},{lat:45.428,lng:-73.715}] },
  { name:"Pierrefonds-Roxboro",    region:"montreal", coords:[{lat:45.510,lng:-73.880},{lat:45.510,lng:-73.818},{lat:45.478,lng:-73.818},{lat:45.478,lng:-73.880}] },
  { name:"Île-Bizard",             region:"montreal", coords:[{lat:45.510,lng:-73.938},{lat:45.510,lng:-73.878},{lat:45.475,lng:-73.878},{lat:45.475,lng:-73.938}] },
  { name:"Anjou",                  region:"montreal", coords:[{lat:45.615,lng:-73.582},{lat:45.615,lng:-73.548},{lat:45.588,lng:-73.548},{lat:45.588,lng:-73.582}] },
  { name:"Saint-Léonard",          region:"montreal", coords:[{lat:45.605,lng:-73.608},{lat:45.605,lng:-73.575},{lat:45.578,lng:-73.575},{lat:45.578,lng:-73.608}] },
  { name:"Mercier–Hochelaga",      region:"montreal", coords:[{lat:45.578,lng:-73.562},{lat:45.578,lng:-73.505},{lat:45.545,lng:-73.505},{lat:45.545,lng:-73.562}] },
  { name:"Riv.-des-Prairies",      region:"montreal", coords:[{lat:45.658,lng:-73.550},{lat:45.658,lng:-73.488},{lat:45.620,lng:-73.488},{lat:45.620,lng:-73.550}] },
  { name:"Pointe-aux-Trembles",    region:"montreal", coords:[{lat:45.658,lng:-73.512},{lat:45.658,lng:-73.460},{lat:45.625,lng:-73.460},{lat:45.625,lng:-73.512}] },
  // LONGUEUIL
  { name:"Vieux-Longueuil",        region:"longueuil", coords:[{lat:45.542,lng:-73.528},{lat:45.542,lng:-73.488},{lat:45.508,lng:-73.488},{lat:45.508,lng:-73.528}] },
  { name:"Saint-Hubert",           region:"longueuil", coords:[{lat:45.522,lng:-73.442},{lat:45.522,lng:-73.412},{lat:45.495,lng:-73.412},{lat:45.495,lng:-73.442}] },
  { name:"Greenfield Park",        region:"longueuil", coords:[{lat:45.492,lng:-73.490},{lat:45.492,lng:-73.462},{lat:45.470,lng:-73.462},{lat:45.470,lng:-73.490}] },
  { name:"LeMoyne",                region:"longueuil", coords:[{lat:45.498,lng:-73.520},{lat:45.498,lng:-73.495},{lat:45.480,lng:-73.495},{lat:45.480,lng:-73.520}] },
  { name:"Saint-Bruno",            region:"longueuil", coords:[{lat:45.545,lng:-73.375},{lat:45.545,lng:-73.335},{lat:45.515,lng:-73.335},{lat:45.515,lng:-73.375}] },
  { name:"Brossard",               region:"longueuil", coords:[{lat:45.468,lng:-73.498},{lat:45.468,lng:-73.438},{lat:45.432,lng:-73.438},{lat:45.432,lng:-73.498}] },
  // RIVE-NORD
  { name:"Terrebonne",             region:"north_shore", coords:[{lat:45.718,lng:-73.660},{lat:45.718,lng:-73.595},{lat:45.682,lng:-73.595},{lat:45.682,lng:-73.660}] },
  { name:"Mascouche",              region:"north_shore", coords:[{lat:45.758,lng:-73.622},{lat:45.758,lng:-73.578},{lat:45.722,lng:-73.578},{lat:45.722,lng:-73.622}] },
  { name:"Repentigny",             region:"north_shore", coords:[{lat:45.745,lng:-73.478},{lat:45.745,lng:-73.428},{lat:45.708,lng:-73.428},{lat:45.708,lng:-73.478}] },
  { name:"L'Assomption",           region:"north_shore", coords:[{lat:45.845,lng:-73.448},{lat:45.845,lng:-73.398},{lat:45.808,lng:-73.398},{lat:45.808,lng:-73.448}] },
  { name:"Charlemagne",            region:"north_shore", coords:[{lat:45.724,lng:-73.508},{lat:45.724,lng:-73.478},{lat:45.700,lng:-73.478},{lat:45.700,lng:-73.508}] },
  // NORD-OUEST
  { name:"Saint-Jérôme",           region:"west_north_shore", coords:[{lat:45.790,lng:-74.020},{lat:45.790,lng:-73.970},{lat:45.755,lng:-73.970},{lat:45.755,lng:-74.020}] },
  { name:"Blainville",             region:"west_north_shore", coords:[{lat:45.680,lng:-73.900},{lat:45.680,lng:-73.848},{lat:45.648,lng:-73.848},{lat:45.648,lng:-73.900}] },
  { name:"Boisbriand",             region:"west_north_shore", coords:[{lat:45.648,lng:-73.858},{lat:45.648,lng:-73.828},{lat:45.625,lng:-73.828},{lat:45.625,lng:-73.858}] },
  { name:"Sainte-Thérèse",         region:"west_north_shore", coords:[{lat:45.645,lng:-73.848},{lat:45.645,lng:-73.820},{lat:45.628,lng:-73.820},{lat:45.628,lng:-73.848}] },
  { name:"Mirabel",                region:"west_north_shore", coords:[{lat:45.720,lng:-74.010},{lat:45.720,lng:-73.920},{lat:45.668,lng:-73.920},{lat:45.668,lng:-74.010}] },
  // OUEST / WEST ISLAND
  { name:"Dollard-des-Ormeaux",    region:"west_extended", coords:[{lat:45.498,lng:-73.830},{lat:45.498,lng:-73.800},{lat:45.472,lng:-73.800},{lat:45.472,lng:-73.830}] },
  { name:"Kirkland",               region:"west_extended", coords:[{lat:45.458,lng:-73.878},{lat:45.458,lng:-73.848},{lat:45.432,lng:-73.848},{lat:45.432,lng:-73.878}] },
  { name:"Pointe-Claire",          region:"west_extended", coords:[{lat:45.452,lng:-73.830},{lat:45.452,lng:-73.795},{lat:45.428,lng:-73.795},{lat:45.428,lng:-73.830}] },
  { name:"Beaconsfield",           region:"west_extended", coords:[{lat:45.438,lng:-73.880},{lat:45.438,lng:-73.848},{lat:45.408,lng:-73.848},{lat:45.408,lng:-73.880}] },
  { name:"Baie-d'Urfé",            region:"west_extended", coords:[{lat:45.418,lng:-73.920},{lat:45.418,lng:-73.888},{lat:45.395,lng:-73.888},{lat:45.395,lng:-73.920}] },
  { name:"Vaudreuil-Dorion",       region:"west_extended", coords:[{lat:45.408,lng:-74.042},{lat:45.408,lng:-73.995},{lat:45.378,lng:-73.995},{lat:45.378,lng:-74.042}] },
  // RIVE-SUD EST
  { name:"Boucherville",           region:"south_shore_east", coords:[{lat:45.608,lng:-73.458},{lat:45.608,lng:-73.412},{lat:45.568,lng:-73.412},{lat:45.568,lng:-73.458}] },
  { name:"Varennes",               region:"south_shore_east", coords:[{lat:45.700,lng:-73.445},{lat:45.700,lng:-73.398},{lat:45.658,lng:-73.398},{lat:45.658,lng:-73.445}] },
  { name:"Sainte-Julie",           region:"south_shore_east", coords:[{lat:45.596,lng:-73.352},{lat:45.596,lng:-73.310},{lat:45.560,lng:-73.310},{lat:45.560,lng:-73.352}] },
  { name:"Beloeil",                region:"south_shore_east", coords:[{lat:45.568,lng:-73.220},{lat:45.568,lng:-73.195},{lat:45.545,lng:-73.195},{lat:45.545,lng:-73.220}] },
  // SUD-OUEST
  { name:"Châteauguay",            region:"south_west", coords:[{lat:45.382,lng:-73.762},{lat:45.382,lng:-73.718},{lat:45.348,lng:-73.718},{lat:45.348,lng:-73.762}] },
  { name:"Candiac",                region:"south_west", coords:[{lat:45.388,lng:-73.548},{lat:45.388,lng:-73.518},{lat:45.360,lng:-73.518},{lat:45.360,lng:-73.548}] },
  { name:"La Prairie",             region:"south_west", coords:[{lat:45.428,lng:-73.510},{lat:45.428,lng:-73.482},{lat:45.402,lng:-73.482},{lat:45.402,lng:-73.510}] },
  { name:"Saint-Constant",         region:"south_west", coords:[{lat:45.370,lng:-73.580},{lat:45.370,lng:-73.548},{lat:45.345,lng:-73.548},{lat:45.345,lng:-73.580}] },
];

interface Driver {
  id: string; name: string; lat: number; lng: number;
  status: string; zone: string;
}

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polygons = useRef<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set(Object.keys(REGION_STYLE)));
  const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    window.initMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=initMap`;
    s.async = true; document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.540, lng: -73.680 },
      zoom: 10,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      streetViewControl: false,
    });
    drawPolygons(activeRegions);
    setLoading(false);
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapInst.current) return;
    drawPolygons(activeRegions);
  }, [activeRegions]);

  function drawPolygons(active: Set<string>) {
    polygons.current.forEach(p => p.setMap(null));
    polygons.current = [];
    ZONES.forEach(zone => {
      if (!active.has(zone.region)) return;
      const s = REGION_STYLE[zone.region];
      const poly = new window.google.maps.Polygon({
        paths: zone.coords,
        strokeColor: s.stroke, strokeOpacity: 0.9, strokeWeight: 2,
        fillColor: s.fill, fillOpacity: 0.20,
        map: mapInst.current,
      });
      const info = new window.google.maps.InfoWindow();
      poly.addListener("click", (e: any) => {
        info.setContent(`<div style="font-family:sans-serif;padding:6px 10px"><b style="font-size:14px">${zone.name}</b><br/><span style="font-size:12px;color:#6b7280">${s.label}</span></div>`);
        info.setPosition(e.latLng);
        info.open(mapInst.current);
      });
      polygons.current.push(poly);
    });
  }

  useEffect(() => {
    if (!mapLoaded) return;
    const q = query(collection(db, "driver_profiles"), where("driver_status", "in", ["online","delivering","available"]));
    const unsub = onSnapshot(q, snap => {
      const list: Driver[] = snap.docs.filter(d => d.data().last_lat && d.data().last_lng).map(d => ({
        id: d.id, name: d.data().full_name || "Chauffeur",
        lat: d.data().last_lat, lng: d.data().last_lng,
        status: d.data().driver_status || "offline", zone: d.data().zone_name || "",
      }));
      setDrivers(list); updateMarkers(list);
    });
    return () => unsub();
  }, [mapLoaded]);

  function updateMarkers(list: Driver[]) {
    if (!mapInst.current || !window.google) return;
    markers.current.forEach(m => m.setMap(null)); markers.current = [];
    list.forEach(driver => {
      const color = driver.status === "delivering" ? "#3b82f6" : "#22c55e";
      const marker = new window.google.maps.Marker({
        map: mapInst.current, position: { lat: driver.lat, lng: driver.lng },
        icon: { path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", fillColor: color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 1.8, anchor: new window.google.maps.Point(12, 22) },
        title: driver.name, zIndex: 10,
      });
      const info = new window.google.maps.InfoWindow({ content: `<div style="font-family:sans-serif;padding:8px"><b>${driver.name}</b><br><span style="color:#6b7280;font-size:12px">${driver.zone||"—"}</span><br><span style="color:${color};font-size:12px;font-weight:600">${driver.status==="delivering"?"🚗 En livraison":"🟢 Disponible"}</span></div>` });
      marker.addListener("click", () => info.open(mapInst.current, marker));
      markers.current.push(marker);
    });
  }

  function toggleRegion(region: string) {
    setActiveRegions(prev => { const n = new Set(prev); if (n.has(region)) n.delete(region); else n.add(region); return n; });
  }

  const online = drivers.filter(d => d.status !== "offline").length;
  const delivering = drivers.filter(d => d.status === "delivering").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">🗺️ Carte live — Grand Montréal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Temps réel
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Zones affichées", value:ZONES.filter(z=>activeRegions.has(z.region)).length, color:"text-blue-600", bg:"bg-blue-50 border-blue-200" },
          { label:"Chauffeurs en ligne", value:online, color:"text-green-600", bg:"bg-green-50 border-green-200" },
          { label:"En livraison", value:delivering, color:"text-orange-600", bg:"bg-orange-50 border-orange-200" },
          { label:"Disponibles", value:online-delivering, color:"text-gray-700", bg:"bg-gray-50 border-gray-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres régions cliquables */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-semibold mr-1">Filtrer :</span>
        {Object.entries(REGION_STYLE).map(([region, s]) => {
          const active = activeRegions.has(region);
          return (
            <button key={region} onClick={() => toggleRegion(region)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${active ? "opacity-100 shadow-sm" : "opacity-35"}`}
              style={{ borderColor: s.stroke, background: active ? s.fill + "22" : "#f9fafb", color: s.stroke }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
              {s.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-500">Disponible</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">En livraison</span></div>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chargement de la carte...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height:"650px", width:"100%" }} />
      </div>
    </div>
  );
}
