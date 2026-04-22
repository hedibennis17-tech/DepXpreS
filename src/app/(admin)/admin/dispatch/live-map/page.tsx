"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";

// Sources GeoJSON officielles chargées côté client
const GEOJSON_SOURCES = [
  {
    url: "https://montreal-prod.storage.googleapis.com/resources/e18bfd07-edc8-4ce8-8a5a-3b617662a794/limites-administratives-agglomeration.geojson",
    label: "Montréal arrondissements",
  },
  {
    url: "https://www.donneesquebec.ca/recherche/dataset/fd83974a-c85f-4453-bb5f-17fb0f263e3d/resource/047e9d0d-ae7e-4daf-bd5f-f9ffcff02d27/download/arrondissement.json",
    label: "Longueuil arrondissements",
  },
  {
    url: "https://www.donneesquebec.ca/recherche/dataset/c06e074e-2ade-4cfa-a1cf-fcbc700cf1a8/resource/b02a7969-52de-435d-841f-ec7f47f48732/download/limiteanciennemunicipalite.geojson",
    label: "Laval anciennes municipalités",
  },
];

interface Driver {
  id: string; name: string; lat: number; lng: number;
  status: string; zone: string;
}

declare global { interface Window { google: any; initMap: () => void; } }

export default function LiveMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zonesLoaded, setZonesLoaded] = useState(0);
  const [loading, setLoading] = useState(true);
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
      center: { lat: 45.5500, lng: -73.7000 },
      zoom: 10,
      mapTypeId: "roadmap",
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      streetViewControl: false,
    });

    // Charger chaque source GeoJSON via Google Maps Data Layer
    GEOJSON_SOURCES.forEach(src => {
      const dataLayer = new window.google.maps.Data({ map: mapInst.current });

      dataLayer.loadGeoJson(
        src.url,
        undefined,
        (features: any[]) => {
          setZonesLoaded(prev => prev + (features?.length || 0));
        }
      );

      dataLayer.setStyle({
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
      });

      // Click sur une zone → afficher le nom
      dataLayer.addListener("click", (event: any) => {
        const name = event.feature.getProperty("nom")
          || event.feature.getProperty("name")
          || event.feature.getProperty("NOM")
          || event.feature.getProperty("NOM_MUN")
          || "Zone";
        new window.google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:8px;font-weight:bold">${name}</div>`,
          position: event.latLng,
        }).open(mapInst.current);
      });
    });

    setLoading(false);
  }, [mapLoaded]);

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
      updateMarkers(list);
    });
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
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: color, fillOpacity: 1,
          strokeColor: "#fff", strokeWeight: 2,
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 22),
        },
        title: driver.name, zIndex: 10,
      });
      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:8px"><b>${driver.name}</b><br>
          <span style="color:#6b7280;font-size:12px">${driver.zone || "—"}</span><br>
          <span style="color:${color};font-size:12px;font-weight:600">
            ${driver.status === "delivering" ? "🚗 En livraison" : "🟢 Disponible"}
          </span></div>`,
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
        <h1 className="text-xl font-bold text-gray-900">🗺️ Carte live — Grand Montréal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Temps réel
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Zones chargées", value: zonesLoaded, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
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

      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/10" /><span className="text-gray-600 font-semibold">Zone de livraison (polygones officiels)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600">Chauffeur disponible</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-600">En livraison</span></div>
      </div>

      <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chargement des polygones officiels...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "650px", width: "100%" }} />
      </div>
    </div>
  );
}
