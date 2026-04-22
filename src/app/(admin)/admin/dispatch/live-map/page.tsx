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

// Toutes les zones manuelles avec vrais contours approximatifs
const MANUAL_ZONES: { name: string; region: string; center: {lat:number;lng:number}; coords: {lat:number;lng:number}[] }[] = [
  // ── LAVAL ─────────────────────────────────────────────────────────────────
  { name:"Chomedey", region:"laval", center:{lat:45.549,lng:-73.737},
    coords:[{lat:45.570,lng:-73.768},{lat:45.570,lng:-73.710},{lat:45.555,lng:-73.695},{lat:45.535,lng:-73.700},{lat:45.528,lng:-73.730},{lat:45.535,lng:-73.768}] },
  { name:"Laval-des-Rapides", region:"laval", center:{lat:45.565,lng:-73.704},
    coords:[{lat:45.578,lng:-73.718},{lat:45.578,lng:-73.688},{lat:45.558,lng:-73.685},{lat:45.552,lng:-73.700},{lat:45.555,lng:-73.718}] },
  { name:"Pont-Viau", region:"laval", center:{lat:45.576,lng:-73.689},
    coords:[{lat:45.585,lng:-73.702},{lat:45.585,lng:-73.678},{lat:45.566,lng:-73.675},{lat:45.562,lng:-73.692},{lat:45.568,lng:-73.705}] },
  { name:"Duvernay", region:"laval", center:{lat:45.600,lng:-73.670},
    coords:[{lat:45.618,lng:-73.692},{lat:45.618,lng:-73.648},{lat:45.598,lng:-73.642},{lat:45.585,lng:-73.658},{lat:45.585,lng:-73.685},{lat:45.598,lng:-73.692}] },
  { name:"Vimont", region:"laval", center:{lat:45.605,lng:-73.723},
    coords:[{lat:45.620,lng:-73.745},{lat:45.620,lng:-73.705},{lat:45.598,lng:-73.700},{lat:45.590,lng:-73.718},{lat:45.592,lng:-73.745}] },
  { name:"Auteuil", region:"laval", center:{lat:45.554,lng:-73.762},
    coords:[{lat:45.568,lng:-73.780},{lat:45.568,lng:-73.745},{lat:45.545,lng:-73.740},{lat:45.538,lng:-73.758},{lat:45.542,lng:-73.780}] },
  { name:"Laval-Ouest", region:"laval", center:{lat:45.545,lng:-73.798},
    coords:[{lat:45.560,lng:-73.818},{lat:45.560,lng:-73.782},{lat:45.538,lng:-73.778},{lat:45.530,lng:-73.798},{lat:45.535,lng:-73.818}] },
  { name:"Fabreville", region:"laval", center:{lat:45.571,lng:-73.798},
    coords:[{lat:45.588,lng:-73.825},{lat:45.588,lng:-73.775},{lat:45.562,lng:-73.770},{lat:45.558,lng:-73.795},{lat:45.562,lng:-73.825}] },
  { name:"Sainte-Dorothée", region:"laval", center:{lat:45.526,lng:-73.822},
    coords:[{lat:45.542,lng:-73.848},{lat:45.542,lng:-73.800},{lat:45.518,lng:-73.795},{lat:45.510,lng:-73.818},{lat:45.515,lng:-73.848}] },
  { name:"Sainte-Rose", region:"laval", center:{lat:45.634,lng:-73.772},
    coords:[{lat:45.652,lng:-73.802},{lat:45.652,lng:-73.745},{lat:45.630,lng:-73.738},{lat:45.618,lng:-73.755},{lat:45.620,lng:-73.802}] },
  { name:"Saint-François", region:"laval", center:{lat:45.644,lng:-73.682},
    coords:[{lat:45.662,lng:-73.712},{lat:45.662,lng:-73.652},{lat:45.638,lng:-73.645},{lat:45.628,lng:-73.665},{lat:45.630,lng:-73.712}] },
  { name:"St-Vincent-de-Paul", region:"laval", center:{lat:45.613,lng:-73.650},
    coords:[{lat:45.628,lng:-73.672},{lat:45.628,lng:-73.632},{lat:45.605,lng:-73.628},{lat:45.598,lng:-73.648},{lat:45.600,lng:-73.672}] },
  { name:"Îles-Laval", region:"laval", center:{lat:45.513,lng:-73.752},
    coords:[{lat:45.528,lng:-73.782},{lat:45.528,lng:-73.720},{lat:45.498,lng:-73.718},{lat:45.495,lng:-73.752},{lat:45.500,lng:-73.782}] },

  // ── LONGUEUIL ──────────────────────────────────────────────────────────────
  { name:"Vieux-Longueuil", region:"longueuil", center:{lat:45.525,lng:-73.508},
    coords:[{lat:45.545,lng:-73.530},{lat:45.545,lng:-73.488},{lat:45.508,lng:-73.485},{lat:45.505,lng:-73.520},{lat:45.515,lng:-73.535}] },
  { name:"Saint-Hubert", region:"longueuil", center:{lat:45.508,lng:-73.428},
    coords:[{lat:45.528,lng:-73.448},{lat:45.528,lng:-73.408},{lat:45.492,lng:-73.405},{lat:45.488,lng:-73.435},{lat:45.495,lng:-73.452}] },
  { name:"Greenfield Park", region:"longueuil", center:{lat:45.481,lng:-73.476},
    coords:[{lat:45.495,lng:-73.492},{lat:45.495,lng:-73.460},{lat:45.468,lng:-73.458},{lat:45.465,lng:-73.480},{lat:45.472,lng:-73.495}] },
  { name:"LeMoyne", region:"longueuil", center:{lat:45.489,lng:-73.508},
    coords:[{lat:45.500,lng:-73.522},{lat:45.500,lng:-73.492},{lat:45.478,lng:-73.490},{lat:45.475,lng:-73.512},{lat:45.482,lng:-73.525}] },
  { name:"Saint-Bruno", region:"longueuil", center:{lat:45.530,lng:-73.355},
    coords:[{lat:45.548,lng:-73.378},{lat:45.548,lng:-73.332},{lat:45.515,lng:-73.330},{lat:45.512,lng:-73.360},{lat:45.518,lng:-73.380}] },
  { name:"Brossard", region:"longueuil", center:{lat:45.450,lng:-73.468},
    coords:[{lat:45.472,lng:-73.500},{lat:45.472,lng:-73.435},{lat:45.432,lng:-73.432},{lat:45.428,lng:-73.472},{lat:45.438,lng:-73.505}] },

  // ── RIVE-NORD ──────────────────────────────────────────────────────────────
  { name:"Terrebonne", region:"north_shore", center:{lat:45.700,lng:-73.628},
    coords:[{lat:45.722,lng:-73.662},{lat:45.722,lng:-73.592},{lat:45.685,lng:-73.588},{lat:45.678,lng:-73.618},{lat:45.682,lng:-73.662}] },
  { name:"Mascouche", region:"north_shore", center:{lat:45.740,lng:-73.600},
    coords:[{lat:45.762,lng:-73.628},{lat:45.762,lng:-73.572},{lat:45.722,lng:-73.568},{lat:45.718,lng:-73.602},{lat:45.722,lng:-73.628}] },
  { name:"Repentigny", region:"north_shore", center:{lat:45.725,lng:-73.452},
    coords:[{lat:45.748,lng:-73.480},{lat:45.748,lng:-73.425},{lat:45.708,lng:-73.422},{lat:45.705,lng:-73.455},{lat:45.710,lng:-73.482}] },
  { name:"L'Assomption", region:"north_shore", center:{lat:45.828,lng:-73.422},
    coords:[{lat:45.848,lng:-73.452},{lat:45.848,lng:-73.395},{lat:45.808,lng:-73.392},{lat:45.805,lng:-73.425},{lat:45.810,lng:-73.455}] },
  { name:"Charlemagne", region:"north_shore", center:{lat:45.712,lng:-73.492},
    coords:[{lat:45.728,lng:-73.510},{lat:45.728,lng:-73.475},{lat:45.700,lng:-73.472},{lat:45.698,lng:-73.495},{lat:45.705,lng:-73.512}] },

  // ── NORD-OUEST ─────────────────────────────────────────────────────────────
  { name:"Saint-Jérôme", region:"west_north_shore", center:{lat:45.772,lng:-73.995},
    coords:[{lat:45.795,lng:-74.025},{lat:45.795,lng:-73.968},{lat:45.755,lng:-73.965},{lat:45.750,lng:-73.998},{lat:45.758,lng:-74.025}] },
  { name:"Blainville", region:"west_north_shore", center:{lat:45.664,lng:-73.874},
    coords:[{lat:45.682,lng:-73.905},{lat:45.682,lng:-73.845},{lat:45.648,lng:-73.842},{lat:45.645,lng:-73.875},{lat:45.650,lng:-73.905}] },
  { name:"Boisbriand", region:"west_north_shore", center:{lat:45.635,lng:-73.842},
    coords:[{lat:45.650,lng:-73.862},{lat:45.650,lng:-73.825},{lat:45.622,lng:-73.822},{lat:45.618,lng:-73.845},{lat:45.625,lng:-73.865}] },
  { name:"Sainte-Thérèse", region:"west_north_shore", center:{lat:45.638,lng:-73.832},
    coords:[{lat:45.648,lng:-73.848},{lat:45.648,lng:-73.818},{lat:45.628,lng:-73.815},{lat:45.625,lng:-73.835},{lat:45.630,lng:-73.850}] },
  { name:"Mirabel", region:"west_north_shore", center:{lat:45.695,lng:-73.965},
    coords:[{lat:45.725,lng:-74.015},{lat:45.725,lng:-73.918},{lat:45.668,lng:-73.915},{lat:45.662,lng:-73.968},{lat:45.672,lng:-74.015}] },

  // ── RIVE-SUD EST ───────────────────────────────────────────────────────────
  { name:"Boucherville", region:"south_shore_east", center:{lat:45.588,lng:-73.435},
    coords:[{lat:45.612,lng:-73.460},{lat:45.612,lng:-73.408},{lat:45.568,lng:-73.405},{lat:45.562,lng:-73.438},{lat:45.572,lng:-73.462}] },
  { name:"Varennes", region:"south_shore_east", center:{lat:45.682,lng:-73.422},
    coords:[{lat:45.705,lng:-73.448},{lat:45.705,lng:-73.398},{lat:45.660,lng:-73.395},{lat:45.658,lng:-73.428},{lat:45.665,lng:-73.450}] },
  { name:"Sainte-Julie", region:"south_shore_east", center:{lat:45.578,lng:-73.332},
    coords:[{lat:45.598,lng:-73.358},{lat:45.598,lng:-73.308},{lat:45.558,lng:-73.305},{lat:45.555,lng:-73.338},{lat:45.562,lng:-73.360}] },
  { name:"Beloeil", region:"south_shore_east", center:{lat:45.557,lng:-73.208},
    coords:[{lat:45.572,lng:-73.228},{lat:45.572,lng:-73.188},{lat:45.542,lng:-73.185},{lat:45.540,lng:-73.212},{lat:45.548,lng:-73.230}] },

  // ── SUD-OUEST ──────────────────────────────────────────────────────────────
  { name:"Châteauguay", region:"south_west", center:{lat:45.365,lng:-73.740},
    coords:[{lat:45.385,lng:-73.768},{lat:45.385,lng:-73.715},{lat:45.348,lng:-73.712},{lat:45.345,lng:-73.745},{lat:45.352,lng:-73.770}] },
  { name:"Candiac", region:"south_west", center:{lat:45.374,lng:-73.533},
    coords:[{lat:45.390,lng:-73.552},{lat:45.390,lng:-73.515},{lat:45.358,lng:-73.512},{lat:45.355,lng:-73.538},{lat:45.362,lng:-73.555}] },
  { name:"La Prairie", region:"south_west", center:{lat:45.415,lng:-73.495},
    coords:[{lat:45.432,lng:-73.515},{lat:45.432,lng:-73.478},{lat:45.400,lng:-73.475},{lat:45.398,lng:-73.500},{lat:45.405,lng:-73.518}] },
  { name:"Saint-Constant", region:"south_west", center:{lat:45.358,lng:-73.562},
    coords:[{lat:45.375,lng:-73.582},{lat:45.375,lng:-73.545},{lat:45.342,lng:-73.542},{lat:45.340,lng:-73.568},{lat:45.348,lng:-73.585}] },
];

interface Driver { id:string; name:string; lat:number; lng:number; status:string; zone:string; }

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polygons = useRef<any[]>([]);
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
      zoom: 10,
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
    polygons.current.forEach(p => { p.poly?.setMap(null); p.label?.setMap(null); });
    polygons.current = [];
    const infoWin = new window.google.maps.InfoWindow();

    function addPoly(paths: any, name: string, region: string, center: {lat:number;lng:number}) {
      if (!active.has(region)) return;
      const s = REGION_STYLE[region];
      const poly = new window.google.maps.Polygon({
        paths,
        strokeColor: s.stroke, strokeOpacity: 1, strokeWeight: 2,
        fillColor: s.fill, fillOpacity: 0.25,
        map: mapInst.current,
      });
      // Label centré sur le polygone
      const label = new window.google.maps.Marker({
        position: center,
        map: mapInst.current,
        icon: { path: "M 0,0", scale: 0 }, // invisible
        label: { text: name, color: s.stroke, fontSize: "11px", fontWeight: "700" },
        zIndex: 5,
      });
      poly.addListener("click", (e: any) => {
        infoWin.setContent(`<div style="font-family:sans-serif;padding:6px 12px"><b style="font-size:14px">${name}</b><br/><span style="font-size:12px;color:#6b7280">${s.label}</span></div>`);
        infoWin.setPosition(e.latLng);
        infoWin.open(mapInst.current);
      });
      polygons.current.push({ poly, label });
    }

    // 1. GeoJSON Montréal + West Island (fichier réel)
    if (geoData.current) {
      // Calculer le centre de chaque feature
      geoData.current.features.forEach((feat: any) => {
        const region = feat.properties.region;
        const name = feat.properties.name;
        if (!active.has(region)) return;
        const geom = feat.geometry;
        const allRings = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
        // Centre approximatif = moyenne des coords du premier ring
        let latSum = 0, lngSum = 0, count = 0;
        allRings[0][0].forEach(([lng, lat]: number[]) => { latSum += lat; lngSum += lng; count++; });
        const center = { lat: latSum/count, lng: lngSum/count };
        const paths = allRings.map((ring: number[][][]) =>
          ring.map((loop: number[][]) => loop.map(([lng, lat]: number[]) => ({ lat, lng })))
        );
        // Pour MultiPolygon on prend chaque ring séparément
        allRings.forEach((ring: number[][][]) => {
          const p = ring.map((loop: number[][]) => loop.map(([lng, lat]: number[]) => ({ lat, lng })));
          addPoly(p, name, region, center);
        });
      });
    }

    // 2. Zones manuelles (Laval, Longueuil, Rive-Nord, etc.)
    MANUAL_ZONES.forEach(zone => {
      addPoly(zone.coords, zone.name, zone.region, zone.center);
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
          {label:"Zones chargées", value:(geoData.current?.features?.length||0)+MANUAL_ZONES.length, color:"text-blue-600", bg:"bg-blue-50 border-blue-200"},
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
