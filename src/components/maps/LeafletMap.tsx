'use client';
import { useEffect, useRef, useState } from 'react';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  type?: 'driver' | 'store' | 'client' | 'order' | 'zone';
  status?: string;
  popup?: string;
}

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  className?: string;
  showZoneCircles?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  delivering: '#f97316',
  available: '#3b82f6',
  open: '#22c55e',
  closed: '#ef4444',
};

const TYPE_COLORS: Record<string, string> = {
  driver: '#f97316',
  store: '#3b82f6',
  client: '#10b981',
  order: '#8b5cf6',
  zone: '#ef4444',
};

const TYPE_EMOJI: Record<string, string> = {
  driver: '🚗',
  store: '🏪',
  client: '📍',
  order: '📦',
};

export default function LeafletMap({
  center = [45.5631, -73.7128],
  zoom = 12,
  markers = [],
  height = '400px',
  className = '',
  showZoneCircles = false,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Ne monter que côté client — évite l'erreur d'hydratation #418
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !mapRef.current) return;

    // Injecter le CSS Leaflet côté client uniquement
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // Éviter la double initialisation
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    import('leaflet').then((L) => {
      if (!mapRef.current) return;

      // Fix icônes Leaflet avec Next.js
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Leaflet | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Zones de couverture
      if (showZoneCircles) {
        const zones = [
          { name: 'Laval', lat: 45.5631, lng: -73.7128, radius: 4000, color: '#f97316' },
          { name: 'Laval Ouest', lat: 45.5500, lng: -73.8200, radius: 3500, color: '#3b82f6' },
          { name: 'Longueuil', lat: 45.5317, lng: -73.5180, radius: 4000, color: '#10b981' },
          { name: 'Mtl Centre-Ville', lat: 45.5088, lng: -73.5878, radius: 3000, color: '#8b5cf6' },
          { name: 'Mtl Nord', lat: 45.5900, lng: -73.6200, radius: 3500, color: '#ef4444' },
        ];
        zones.forEach(zone => {
          L.circle([zone.lat, zone.lng], {
            radius: zone.radius,
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.08,
            weight: 2,
          }).addTo(map).bindPopup(`<strong>${zone.name}</strong><br>Zone de livraison`);
        });
      }

      // Couche de marqueurs
      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;

      const addMarkers = (mkrs: MapMarker[]) => {
        layerGroup.clearLayers();
        mkrs.forEach(marker => {
          const color = STATUS_COLORS[marker.status || ''] || TYPE_COLORS[marker.type || 'driver'] || '#f97316';
          const emoji = TYPE_EMOJI[marker.type || 'driver'] || '📍';

          const svgIcon = L.divIcon({
            html: `<div style="
              width:36px;height:36px;
              background:${color};
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex;align-items:center;justify-content:center;
              font-size:16px;cursor:pointer;
            ">${emoji}</div>
            ${marker.label ? `<div style="
              background:white;border:1px solid #e5e7eb;
              border-radius:4px;padding:2px 6px;
              font-size:11px;font-weight:600;color:#1f2937;
              white-space:nowrap;margin-top:2px;
              box-shadow:0 1px 4px rgba(0,0,0,0.15);text-align:center;
            ">${marker.label}</div>` : ''}`,
            className: '',
            iconSize: [36, marker.label ? 56 : 36],
            iconAnchor: [18, marker.label ? 56 : 36],
            popupAnchor: [0, -40],
          });

          const m = L.marker([marker.lat, marker.lng], { icon: svgIcon }).addTo(layerGroup);
          if (marker.popup) m.bindPopup(marker.popup);
        });

        if (mkrs.length > 1) {
          try {
            const bounds = L.latLngBounds(mkrs.map(m => [m.lat, m.lng] as [number, number]));
            map.fitBounds(bounds, { padding: [40, 40] });
          } catch {}
        }
      };

      addMarkers(markers);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted]);

  // Mettre à jour les marqueurs dynamiquement
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mounted) return;
    import('leaflet').then((L) => {
      const layerGroup = markersLayerRef.current;
      layerGroup.clearLayers();
      markers.forEach(marker => {
        const color = STATUS_COLORS[marker.status || ''] || TYPE_COLORS[marker.type || 'driver'] || '#f97316';
        const emoji = TYPE_EMOJI[marker.type || 'driver'] || '📍';
        const svgIcon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;background:${color};
            border:3px solid white;border-radius:50%;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:16px;
          ">${emoji}</div>
          ${marker.label ? `<div style="
            background:white;border:1px solid #e5e7eb;border-radius:4px;
            padding:2px 6px;font-size:11px;font-weight:600;color:#1f2937;
            white-space:nowrap;margin-top:2px;text-align:center;
          ">${marker.label}</div>` : ''}`,
          className: '',
          iconSize: [36, marker.label ? 56 : 36],
          iconAnchor: [18, marker.label ? 56 : 36],
          popupAnchor: [0, -40],
        });
        const m = L.marker([marker.lat, marker.lng], { icon: svgIcon }).addTo(layerGroup);
        if (marker.popup) m.bindPopup(marker.popup);
      });
    });
  }, [markers, mounted]);

  // Ne rien rendre côté serveur — évite l'hydratation mismatch
  if (!mounted) {
    return (
      <div
        style={{ height, width: '100%' }}
        className={`rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-400 text-sm">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className={`rounded-xl overflow-hidden ${className}`}
    />
  );
}
