'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  type: 'driver' | 'store' | 'client' | 'order';
  label?: string;
  status?: string;
  info?: string;
}

interface GoogleMapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  height?: string;
  className?: string;
  showRoute?: boolean;
  routePoints?: { lat: number; lng: number }[];
}

const MARKER_ICONS = {
  driver: '🚗',
  store: '🏪',
  client: '📍',
  order: '📦',
};

const MARKER_COLORS = {
  driver: '#10b981',   // vert
  store: '#f59e0b',    // orange
  client: '#3b82f6',   // bleu
  order: '#8b5cf6',    // violet
};

export default function GoogleMapView({
  center = { lat: 45.5631, lng: -73.7124 }, // Laval, QC
  zoom = 12,
  markers = [],
  height = '400px',
  className = '',
  showRoute = false,
  routePoints = [],
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    // Créer la carte
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Ajouter les marqueurs
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    markers.forEach((marker) => {
      const gmMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.label || marker.id,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: MARKER_COLORS[marker.type],
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: MARKER_ICONS[marker.type],
          fontSize: '16px',
        },
      });

      gmMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; min-width: 150px;">
              <strong style="font-size: 14px;">${marker.label || marker.id}</strong>
              ${marker.status ? `<br/><span style="color: #6b7280; font-size: 12px;">${marker.status}</span>` : ''}
              ${marker.info ? `<br/><span style="font-size: 12px;">${marker.info}</span>` : ''}
            </div>
          `);
          infoWindowRef.current.open(map, gmMarker);
        }
      });

      markersRef.current.push(gmMarker);
    });

    // Tracer une route si demandé
    if (showRoute && routePoints.length >= 2) {
      if (polylineRef.current) polylineRef.current.setMap(null);
      polylineRef.current = new window.google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });
    }

    // Ajuster la vue pour inclure tous les marqueurs
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [center, zoom, markers, showRoute, routePoints]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    // Charger le script Google Maps si pas déjà chargé
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', initMap);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', initMap);
    };
  }, [initMap]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
}
