'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Clock, ShoppingBasket, MapPin, Loader2 } from 'lucide-react';

interface StoreInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export function MapPanel() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStore, setNearestStore] = useState<StoreInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [driversCount, setDriversCount] = useState(4);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/admin/stores?limit=10');
        const data = await res.json();
        if (data.stores && data.stores.length > 0) {
          const store = data.stores.find((s: StoreInfo) => s.lat && s.lng) || data.stores[0];
          setNearestStore(store);
        }
      } catch {
        setNearestStore({
          id: 'default',
          name: 'Depanneur Centre-Ville 24h',
          address: '789 Rue Ste-Catherine O.',
          city: 'Montreal',
          lat: 45.5017,
          lng: -73.5673,
        });
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 45.5017, lng: -73.5673 });
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: 45.5017, lng: -73.5673 });
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Votre position',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (nearestStore?.lat && nearestStore?.lng) {
        new window.google.maps.Marker({
          position: { lat: nearestStore.lat, lng: nearestStore.lng },
          map,
          title: nearestStore.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      }
      setMapLoaded(true);
    };

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', initMap);
      return () => existingScript.removeEventListener('load', initMap);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
    return () => script.removeEventListener('load', initMap);
  }, [userLocation, nearestStore]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const storeLat = nearestStore?.lat || 45.5017;
  const storeLng = nearestStore?.lng || -73.5673;

  return (
    <Card className="sticky top-20 overflow-hidden">
      <div className="relative h-64 w-full bg-gray-100">
        {apiKey ? (
          <>
            <div ref={mapRef} className="h-full w-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <iframe
            title="Carte depanneur"
            className="h-full w-full border-0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${storeLng - 0.05},${storeLat - 0.03},${storeLng + 0.05},${storeLat + 0.03}&layer=mapnik&marker=${storeLat},${storeLng}`}
            loading="lazy"
          />
        )}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-medium shadow-sm">
          <MapPin className="h-3 w-3 text-orange-500" />
          <span>{nearestStore?.city || 'Montreal'}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <ShoppingBasket className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold">{nearestStore?.name || 'Depanneur partenaire'}</p>
            <p className="text-sm text-muted-foreground">
              {nearestStore?.address ? `${nearestStore.address}, ${nearestStore.city}` : 'Chargement...'}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Users className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold">{driversCount} Chauffeurs en ligne</p>
            <p className="text-sm text-muted-foreground">Prets pour votre commande</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Clock className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold">~25-35 min</p>
            <p className="text-sm text-muted-foreground">Temps de livraison estime</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
