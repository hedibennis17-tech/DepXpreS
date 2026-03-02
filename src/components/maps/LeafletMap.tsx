'use client';
import { useEffect, useRef } from 'react';

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

const TYPE_COLORS: Record<string, string> = {
  driver: '#f97316',   // orange
  store: '#3b82f6',    // blue
  client: '#10b981',   // green
  order: '#8b5cf6',    // purple
  zone: '#ef4444',     // red
};

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  delivering: '#f97316',
  available: '#3b82f6',
  open: '#22c55e',
  closed: '#ef4444',
};

export default function LeafletMap({
  center = [45.5631, -73.7128], // Laval, QC
  zoom = 12,
  markers = [],
  height = '400px',
  className = '',
  showZoneCircles = false,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Éviter la double initialisation
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Import dynamique de Leaflet (côté client uniquement)
    import('leaflet').then((L) => {
      // Fix icônes Leaflet avec Next.js
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Tuiles OpenStreetMap — gratuit, aucune clé API
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Zones de couverture (cercles)
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

      // Marqueurs
      markers.forEach(marker => {
        const color = STATUS_COLORS[marker.status || ''] || TYPE_COLORS[marker.type || 'driver'] || '#f97316';

        // Icône personnalisée SVG
        const svgIcon = L.divIcon({
          html: `
            <div style="
              width: 36px; height: 36px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
              font-size: 16px;
              cursor: pointer;
            ">
              ${marker.type === 'driver' ? '🚗' : marker.type === 'store' ? '🏪' : marker.type === 'client' ? '📍' : '📦'}
            </div>
            ${marker.label ? `<div style="
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 2px 6px;
              font-size: 11px;
              font-weight: 600;
              color: #1f2937;
              white-space: nowrap;
              margin-top: 2px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.15);
              text-align: center;
            ">${marker.label}</div>` : ''}
          `,
          className: '',
          iconSize: [36, marker.label ? 56 : 36],
          iconAnchor: [18, marker.label ? 56 : 36],
          popupAnchor: [0, -40],
        });

        const m = L.marker([marker.lat, marker.lng], { icon: svgIcon }).addTo(map);
        if (marker.popup) {
          m.bindPopup(marker.popup);
        }
      });

      // Ajuster la vue si plusieurs marqueurs
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand ils changent
  useEffect(() => {
    if (!mapInstanceRef.current || markers.length === 0) return;
    // Re-render est géré par le useEffect principal
  }, [markers]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className={`rounded-xl overflow-hidden ${className}`}
      />
    </>
  );
}
