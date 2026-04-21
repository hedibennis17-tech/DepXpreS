"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";
import { Loader2, Users, Package, Wifi, WifiOff } from "lucide-react";

// Coordonnées centre par zone
const ZONE_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  // Laval
  "laval-chomedey":         { lat: 45.5480, lng: -73.7350, radius: 2500 },
  "laval-fabreville":       { lat: 45.5700, lng: -73.7900, radius: 2800 },
  "laval-laval-des-rapides":{ lat: 45.5650, lng: -73.7050, radius: 2200 },
  "laval-auteuil":          { lat: 45.5550, lng: -73.7600, radius: 2000 },
  "laval-pont-viau":        { lat: 45.5750, lng: -73.6900, radius: 1800 },
  "laval-renaud":           { lat: 45.5350, lng: -73.7200, radius: 2000 },
  "laval-vimont":           { lat: 45.6050, lng: -73.7200, radius: 2500 },
  "laval-duvernay":         { lat: 45.6000, lng: -73.6700, radius: 2200 },
  "laval-sainte-rose":      { lat: 45.6300, lng: -73.7700, radius: 3000 },
  "laval-sainte-dorothee":  { lat: 45.5250, lng: -73.8200, radius: 2800 },
  "laval-saint-francois":   { lat: 45.6400, lng: -73.6800, radius: 2500 },
  "laval-saint-vincent-de-paul":{ lat: 45.6100, lng: -73.6500, radius: 2200 },
  "laval-iles-laval":       { lat: 45.5100, lng: -73.7500, radius: 3000 },
  // Montréal
  "montreal-ahuntsic":      { lat: 45.5700, lng: -73.6700, radius: 2500 },
  "montreal-rosemont":      { lat: 45.5500, lng: -73.5900, radius: 2200 },
  "montreal-villeray":      { lat: 45.5450, lng: -73.6300, radius: 2000 },
  "montreal-plateau-mont-royal":{ lat: 45.5250, lng: -73.5800, radius: 2000 },
  "montreal-mile-end":      { lat: 45.5200, lng: -73.6000, radius: 1500 },
  "montreal-outremont":     { lat: 45.5150, lng: -73.6100, radius: 1800 },
  "montreal-cote-des-neiges":{ lat: 45.4950, lng: -73.6300, radius: 2200 },
  "montreal-saint-laurent": { lat: 45.5100, lng: -73.6800, radius: 2500 },
  "montreal-saint-leonard": { lat: 45.5900, lng: -73.5900, radius: 2200 },
  "montreal-mercier":       { lat: 45.5600, lng: -73.5500, radius: 2500 },
  "montreal-hochelaga":     { lat: 45.5450, lng: -73.5500, radius: 2000 },
  "montreal-verdun":        { lat: 45.4650, lng: -73.5700, radius: 2000 },
  "montreal-lasalle":       { lat: 45.4350, lng: -73.6200, radius: 2500 },
  "montreal-lachine":       { lat: 45.4450, lng: -73.6900, radius: 2200 },
  "montreal-pierrefonds":   { lat: 45.4900, lng: -73.8600, radius: 3000 },
  "montreal-roxboro":       { lat: 45.5000, lng: -73.8100, radius: 2000 },
  "montreal-dollard-des-ormeaux":{ lat: 45.4900, lng: -73.8300, radius: 2500 },
  "montreal-kirkland":      { lat: 45.4550, lng: -73.8700, radius: 2200 },
  // Longueuil
  "longueuil-vieux":        { lat: 45.5312, lng: -73.5185, radius: 2500 },
  "longueuil-saint-hubert": { lat: 45.5000, lng: -73.4200, radius: 3000 },
  "longueuil-greenfield-park":{ lat: 45.4800, lng: -73.4800, radius: 2000 },
  "longueuil-brossard":     { lat: 45.4500, lng: -73.4700, radius: 3000 },
};

const DEFAULT_COORD = { lat: 45.5500, lng: -73.7000, radius: 2000 };

const ZONE_COLORS: Record<string, string> = {
  laval: "#f97316",
  montreal: "#3b82f6",
  longueuil: "#8b5cf6",
  north_shore: "#10b981",
  south_shore_east: "#f59e0b",
  west_extended: "#ec4899",
};

interface Driver {
  id: string; name: string; lat: number; lng: number;
  status: string; zone: string; currentOrder?: string;
}

declare global {
  interface Window { google: any; initGoogleMap: () => void; }
}

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filterZone, setFilterZone] = useState("all");
  const [stats, setStats] = useState({ online: 0, delivering: 0, available: 0, offline: 0 });

  const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Charger Google Maps
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    window.initGoogleMap = () => setMapLoaded(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=initGoogleMap`;
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.5500, lng: -73.7000 },
      zoom: 11,
      mapTypeId: "roadmap",
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "simplified" }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });
    drawZones();
  }, [mapLoaded]);

  function drawZones() {
    if (!mapInstance.current) return;
    // Supprimer anciens cercles
    circlesRef.current.forEach(c => c.setMap(null));
    circlesRef.current = [];

    ACTIVE_ZONES.forEach(zone => {
      const coords = ZONE_COORDS[zone.id] || DEFAULT_COORD;
      const group = zone.delivery_zone_group || "laval";
      const color = ZONE_COLORS[group] || "#6b7280";

      const circle = new window.google.maps.Circle({
        map: mapInstance.current,
        center: { lat: coords.lat, lng: coords.lng },
        radius: coords.radius,
        fillColor: color,
        fillOpacity: 0.08,
        strokeColor: color,
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
      });

      // Label de zone
      new window.google.maps.Marker({
        map: mapInstance.current,
        position: { lat: coords.lat, lng: coords.lng },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
        label: {
          text: zone.name,
          color: color,
          fontSize: "10px",
          fontWeight: "bold",
        },
        zIndex: 1,
      });

      circlesRef.current.push(circle);
    });
  }

  // Écouter les chauffeurs en temps réel
  useEffect(() => {
    const q = query(collection(db, "driver_profiles"),
      where("driver_status", "in", ["online", "delivering", "available"]));

    const unsub = onSnapshot(q, snap => {
      const list: Driver[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.last_lat && data.last_lng) {
          list.push({
            id: d.id,
            name: data.full_name || "Chauffeur",
            lat: data.last_lat,
            lng: data.last_lng,
            status: data.driver_status || "offline",
            zone: data.zone_name || "",
            currentOrder: data.current_order_id,
          });
        }
      });
      setDrivers(list);
      setStats({
        online: list.filter(d => d.status === "online").length,
        delivering: list.filter(d => d.status === "delivering").length,
        available: list.filter(d => d.status === "available").length,
        offline: 0,
      });
      setLoading(false);
      updateMarkers(list);
    }, () => setLoading(false));

    return () => unsub();
  }, [mapLoaded]);

  function updateMarkers(list: Driver[]) {
    if (!mapInstance.current || !window.google) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    list.forEach(driver => {
      const color = driver.status === "delivering" ? "#3b82f6"
        : driver.status === "online" || driver.status === "available" ? "#22c55e"
        : "#9ca3af";

      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: { lat: driver.lat, lng: driver.lng },
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22),
        },
        title: driver.name,
        zIndex: 10,
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:8px;min-width:140px">
          <p style="font-weight:bold;margin:0 0 4px">${driver.name}</p>
          <p style="color:#6b7280;font-size:12px;margin:0">Zone: ${driver.zone || "—"}</p>
          <p style="color:${color};font-size:12px;margin:4px 0 0;font-weight:600">${
            driver.status === "delivering" ? "🚗 En livraison"
            : driver.status === "online" ? "🟢 En ligne"
            : "🟡 Disponible"
          }</p>
        </div>`,
      });

      marker.addListener("click", () => info.open(mapInstance.current, marker));
      markersRef.current.push(marker);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">🗺️ Carte live — Dispatch</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Temps réel
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "En ligne", value: stats.online + stats.available, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "En livraison", value: stats.delivering, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Zones actives", value: ACTIVE_ZONES.length, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Total chauffeurs", value: drivers.length, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Légende zones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-wrap gap-3">
        {Object.entries(ZONE_COLORS).map(([group, color]) => (
          <div key={group} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: color + "20" }} />
            <span className="text-xs font-semibold text-gray-600 capitalize">{group.replace(/_/g," ")}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">En livraison</span>
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chargement de la carte...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "580px", width: "100%" }} />
      </div>
    </div>
  );
}
