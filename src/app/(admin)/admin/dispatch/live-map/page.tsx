"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";
import { Loader2 } from "lucide-react";

// Coordonnées complètes de toutes les zones
const ZONE_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  // ── LAVAL ──
  "laval-auteuil":                    { lat: 45.5550, lng: -73.7600, radius: 2000 },
  "laval-chomedey":                   { lat: 45.5480, lng: -73.7350, radius: 2500 },
  "laval-duvernay":                   { lat: 45.6000, lng: -73.6700, radius: 2200 },
  "laval-fabreville":                 { lat: 45.5700, lng: -73.7900, radius: 2800 },
  "laval-iles-laval":                 { lat: 45.5100, lng: -73.7500, radius: 3000 },
  "laval-laval-des-rapides":          { lat: 45.5650, lng: -73.7050, radius: 2200 },
  "laval-laval-ouest":                { lat: 45.5450, lng: -73.7900, radius: 2000 },
  "laval-pont-viau":                  { lat: 45.5750, lng: -73.6900, radius: 1800 },
  "laval-sainte-dorothee":            { lat: 45.5250, lng: -73.8200, radius: 2800 },
  "laval-sainte-rose":                { lat: 45.6300, lng: -73.7700, radius: 3000 },
  "laval-saint-francois":             { lat: 45.6400, lng: -73.6800, radius: 2500 },
  "laval-saint-vincent-de-paul":      { lat: 45.6100, lng: -73.6500, radius: 2200 },
  "laval-vimont":                     { lat: 45.6050, lng: -73.7200, radius: 2500 },
  // ── MONTRÉAL arrondissements ──
  "montreal-ahuntsic-cartierville":   { lat: 45.5650, lng: -73.6800, radius: 3500 },
  "montreal-anjou":                   { lat: 45.6000, lng: -73.5600, radius: 2500 },
  "montreal-cote-des-neiges-notre-dame-de-grace": { lat: 45.4950, lng: -73.6300, radius: 3000 },
  "montreal-ile-bizard-sainte-genevieve": { lat: 45.4900, lng: -73.8700, radius: 3500 },
  "montreal-lachine":                 { lat: 45.4450, lng: -73.6900, radius: 2500 },
  "montreal-lasalle":                 { lat: 45.4350, lng: -73.6200, radius: 2500 },
  "montreal-plateau-mont-royal":      { lat: 45.5250, lng: -73.5800, radius: 2000 },
  "montreal-le-sud-ouest":            { lat: 45.4750, lng: -73.5800, radius: 2500 },
  "montreal-mercier-hochelaga-maisonneuve": { lat: 45.5600, lng: -73.5500, radius: 3000 },
  "montreal-montreal-nord":           { lat: 45.5900, lng: -73.6200, radius: 2500 },
  "montreal-outremont":               { lat: 45.5150, lng: -73.6100, radius: 1800 },
  "montreal-pierrefonds-roxboro":     { lat: 45.4950, lng: -73.8400, radius: 3500 },
  "montreal-riviere-des-prairies-pointe-aux-trembles": { lat: 45.6350, lng: -73.5200, radius: 4000 },
  "montreal-rosemont-la-petite-patrie": { lat: 45.5500, lng: -73.5900, radius: 2500 },
  "montreal-saint-laurent":           { lat: 45.5100, lng: -73.6800, radius: 3000 },
  "montreal-saint-leonard":           { lat: 45.5900, lng: -73.5900, radius: 2500 },
  "montreal-verdun":                  { lat: 45.4650, lng: -73.5700, radius: 2000 },
  "montreal-ville-marie":             { lat: 45.5100, lng: -73.5600, radius: 2000 },
  // ── MONTRÉAL secteurs ──
  "montreal-sa-ahuntsic":             { lat: 45.5750, lng: -73.6600, radius: 1800 },
  "montreal-sa-cartierville":         { lat: 45.5550, lng: -73.7000, radius: 1800 },
  "montreal-sa-villeray":             { lat: 45.5450, lng: -73.6300, radius: 1800 },
  "montreal-sa-saint-michel":         { lat: 45.5650, lng: -73.6050, radius: 1800 },
  "montreal-sa-parc-extension":       { lat: 45.5350, lng: -73.6350, radius: 1200 },
  "montreal-sa-rosemont":             { lat: 45.5550, lng: -73.5950, radius: 1800 },
  "montreal-sa-petite-patrie":        { lat: 45.5350, lng: -73.5950, radius: 1500 },
  "montreal-sa-hochelaga":            { lat: 45.5450, lng: -73.5450, radius: 1500 },
  "montreal-sa-maisonneuve":          { lat: 45.5600, lng: -73.5350, radius: 1500 },
  "montreal-sa-tetreaultville":       { lat: 45.5700, lng: -73.5250, radius: 1500 },
  "montreal-sa-cote-des-neiges":      { lat: 45.5000, lng: -73.6250, radius: 1800 },
  "montreal-sa-notre-dame-de-grace":  { lat: 45.4800, lng: -73.6100, radius: 2000 },
  "montreal-sa-plateau-mont-royal-sector": { lat: 45.5250, lng: -73.5780, radius: 1500 },
  "montreal-sa-mile-end":             { lat: 45.5200, lng: -73.6000, radius: 1200 },
  "montreal-sa-centre-ville":         { lat: 45.5100, lng: -73.5650, radius: 1500 },
  "montreal-sa-vieux-montreal":       { lat: 45.5050, lng: -73.5540, radius: 1200 },
  "montreal-sa-griffintown":          { lat: 45.4950, lng: -73.5700, radius: 1000 },
  "montreal-sa-saint-henri":          { lat: 45.4800, lng: -73.5850, radius: 1500 },
  "montreal-sa-petite-bourgogne":     { lat: 45.4850, lng: -73.5700, radius: 1000 },
  "montreal-sa-pointe-saint-charles": { lat: 45.4700, lng: -73.5600, radius: 1500 },
  "montreal-sa-ile-des-soeurs":       { lat: 45.4550, lng: -73.5350, radius: 1500 },
  // ── LONGUEUIL ──
  "longueuil-vieux-longueuil":        { lat: 45.5312, lng: -73.5185, radius: 2500 },
  "longueuil-saint-hubert":           { lat: 45.5000, lng: -73.4200, radius: 3000 },
  "longueuil-greenfield-park":        { lat: 45.4800, lng: -73.4800, radius: 2000 },
  "longueuil-agg-brossard":           { lat: 45.4500, lng: -73.4700, radius: 3000 },
  "longueuil-agg-boucherville":       { lat: 45.5950, lng: -73.4400, radius: 3000 },
  "longueuil-agg-saint-bruno-de-montarville": { lat: 45.5400, lng: -73.3550, radius: 3000 },
  "longueuil-agg-saint-lambert":      { lat: 45.4950, lng: -73.5050, radius: 1800 },
  // ── NORD (Saint-Jérôme et environs) ──
  "outside-saint-jerome":             { lat: 45.7800, lng: -74.0000, radius: 5000 },
  "outside-saint-colomban":           { lat: 45.7350, lng: -74.0800, radius: 4000 },
  "outside-mirabel":                  { lat: 45.6500, lng: -74.0800, radius: 6000 },
  "outside-blainville":               { lat: 45.6700, lng: -73.8800, radius: 4000 },
  "outside-sainte-anne-des-plaines":  { lat: 45.7600, lng: -73.8200, radius: 4000 },
  // ── RIVE-NORD EST (Terrebonne, Mascouche) ──
  "outside-terrebonne":               { lat: 45.7050, lng: -73.6450, radius: 5000 },
  "outside-mascouche":                { lat: 45.7450, lng: -73.6000, radius: 4000 },
  "outside-repentigny":               { lat: 45.7400, lng: -73.4600, radius: 4000 },
  "outside-lassomption":              { lat: 45.8100, lng: -73.4300, radius: 4000 },
  "outside-lepiphanie":               { lat: 45.8450, lng: -73.4800, radius: 3000 },
  "outside-lavaltrie":                { lat: 45.8850, lng: -73.2800, radius: 3500 },
  "outside-saint-sulpice":            { lat: 45.8500, lng: -73.3550, radius: 3000 },
  // ── OUEST (Saint-Eustache, Deux-Montagnes, Oka) ──
  "outside-saint-eustache":           { lat: 45.5650, lng: -73.9050, radius: 4500 },
  "outside-deux-montagnes":           { lat: 45.5350, lng: -73.8850, radius: 3000 },
  "outside-sainte-marthe-sur-le-lac": { lat: 45.5250, lng: -73.9300, radius: 2500 },
  "outside-saint-joseph-du-lac":      { lat: 45.5450, lng: -74.0000, radius: 3000 },
  "outside-oka":                      { lat: 45.4750, lng: -74.0900, radius: 4000 },
  "outside-saint-placide":            { lat: 45.5300, lng: -74.2000, radius: 4000 },
  "outside-pointe-calumet":           { lat: 45.5000, lng: -73.9700, radius: 2500 },
  // ── WEST ISLAND ──
  "outside-hudson":                   { lat: 45.4450, lng: -74.1450, radius: 3500 },
  "outside-saint-lazare":             { lat: 45.3950, lng: -74.1300, radius: 4000 },
  "outside-vaudreuil-dorion":         { lat: 45.4000, lng: -74.0300, radius: 4500 },
  "outside-terrasse-vaudreuil":       { lat: 45.4150, lng: -73.9700, radius: 2000 },
  "outside-notre-dame-de-lile-perrot":{ lat: 45.3750, lng: -73.9400, radius: 3000 },
  "outside-les-cedres":               { lat: 45.3000, lng: -74.0600, radius: 4000 },
  "outside-coteau-du-lac":            { lat: 45.2750, lng: -74.1750, radius: 3500 },
  "outside-les-coteaux":              { lat: 45.2900, lng: -74.2350, radius: 3000 },
  "outside-saint-zotique":            { lat: 45.2550, lng: -74.2450, radius: 3500 },
  // ── RIVE-SUD EST ──
  "outside-varennes":                 { lat: 45.6850, lng: -73.4350, radius: 4000 },
  "outside-vercheres":                { lat: 45.7750, lng: -73.3550, radius: 3500 },
  "outside-sainte-julie":             { lat: 45.5900, lng: -73.3350, radius: 3500 },
  "outside-saint-amable":             { lat: 45.6550, lng: -73.2950, radius: 3000 },
  "outside-saint-mathieu-de-beloeil": { lat: 45.5600, lng: -73.2250, radius: 3000 },
  "outside-beloeil":                  { lat: 45.5600, lng: -73.2050, radius: 3500 },
  "outside-mcmasterville":            { lat: 45.5800, lng: -73.2450, radius: 2000 },
  "outside-otterburn-park":           { lat: 45.5350, lng: -73.2200, radius: 2500 },
  "outside-mont-saint-hilaire":       { lat: 45.5600, lng: -73.1900, radius: 3500 },
  // ── RICHELIEU ──
  "outside-carignan":                 { lat: 45.4450, lng: -73.3000, radius: 3500 },
  "outside-chambly":                  { lat: 45.4450, lng: -73.2850, radius: 3000 },
  "outside-richelieu":                { lat: 45.4350, lng: -73.2450, radius: 3000 },
  // ── SUD-OUEST ──
  "outside-chateauguay":              { lat: 45.3800, lng: -73.7400, radius: 4000 },
  "outside-lery":                     { lat: 45.3600, lng: -73.8050, radius: 2500 },
  "outside-mercier":                  { lat: 45.3200, lng: -73.7500, radius: 3500 },
  "outside-beauharnois":              { lat: 45.3150, lng: -73.8750, radius: 4000 },
};

const DEFAULT = { lat: 45.5500, lng: -73.7000, radius: 2500 };

interface Driver {
  id: string; name: string; lat: number; lng: number;
  status: string; zone: string;
}

declare global { interface Window { google: any; initMap: () => void; } }

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const circles = useRef<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Charger Google Maps
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    window.initMap = () => setMapLoaded(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=initMap`;
    s.async = true; document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  // Init carte
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    mapInst.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 45.5500, lng: -73.7000 },
      zoom: 10,
      mapTypeId: "roadmap",
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      streetViewControl: false,
    });
    drawAllZones();
  }, [mapLoaded]);

  function drawAllZones() {
    if (!mapInst.current) return;
    circles.current.forEach(c => c.setMap(null));
    circles.current = [];

    // Dessiner toutes les zones en bleu
    ACTIVE_ZONES.forEach(zone => {
      const c = ZONE_COORDS[zone.id] || DEFAULT;
      const circle = new window.google.maps.Circle({
        map: mapInst.current,
        center: { lat: c.lat, lng: c.lng },
        radius: c.radius,
        fillColor: "#3b82f6",
        fillOpacity: 0.07,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
      });

      // Label zone
      new window.google.maps.Marker({
        map: mapInst.current,
        position: { lat: c.lat, lng: c.lng },
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text: zone.name, color: "#1d4ed8", fontSize: "9px", fontWeight: "600" },
        zIndex: 1,
      });

      circles.current.push(circle);
    });
  }

  // Chauffeurs temps réel
  useEffect(() => {
    const q = query(collection(db, "driver_profiles"),
      where("driver_status", "in", ["online", "delivering", "available"]));
    const unsub = onSnapshot(q, snap => {
      const list: Driver[] = snap.docs
        .filter(d => d.data().last_lat && d.data().last_lng)
        .map(d => ({
          id: d.id,
          name: d.data().full_name || "Chauffeur",
          lat: d.data().last_lat,
          lng: d.data().last_lng,
          status: d.data().driver_status || "offline",
          zone: d.data().zone_name || "",
        }));
      setDrivers(list);
      setLoading(false);
      updateMarkers(list);
    }, () => setLoading(false));
    return () => unsub();
  }, [mapLoaded]);

  function updateMarkers(list: Driver[]) {
    if (!mapInst.current || !window.google) return;
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];
    list.forEach(driver => {
      const color = driver.status === "delivering" ? "#3b82f6"
        : driver.status === "online" || driver.status === "available" ? "#22c55e" : "#9ca3af";
      const marker = new window.google.maps.Marker({
        map: mapInst.current,
        position: { lat: driver.lat, lng: driver.lng },
        icon: { path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", fillColor: color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 1.8, anchor: new window.google.maps.Point(12, 22) },
        title: driver.name, zIndex: 10,
      });
      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:8px"><b>${driver.name}</b><br><span style="color:#6b7280;font-size:12px">${driver.zone || "—"}</span><br><span style="color:${color};font-size:12px;font-weight:600">${driver.status === "delivering" ? "🚗 En livraison" : "🟢 Disponible"}</span></div>`,
      });
      marker.addListener("click", () => info.open(mapInst.current, marker));
      markers.current.push(marker);
    });
  }

  const online = drivers.filter(d => d.status !== "offline").length;
  const delivering = drivers.filter(d => d.status === "delivering").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">🗺️ Carte live — Toutes les zones</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Temps réel
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Zones couvertes", value: ACTIVE_ZONES.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Chauffeurs en ligne", value: online, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "En livraison", value: delivering, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Disponibles", value: online - delivering, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500/10" /><span className="text-gray-600 font-semibold">Zone de livraison</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600">Chauffeur disponible</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-600">En livraison</span></div>
      </div>

      {/* Carte */}
      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chargement de la carte et des zones...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "640px", width: "100%" }} />
      </div>
    </div>
  );
}
