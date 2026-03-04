"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { MapMarker } from "@/components/maps/LeafletMap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, ChevronLeft, Navigation, Clock, MapPin, Truck } from "lucide-react";
import Link from "next/link";

const LeafletMap = dynamic(() => import("@/components/maps/LeafletMap"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-muted rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
});

interface TrackingData {
  order_id: string;
  status: string;
  store_name: string;
  store_lat?: number;
  store_lng?: number;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  driver_name?: string;
  driver_phone?: string;
  driver_lat?: number;
  driver_lng?: number;
  estimated_minutes?: number;
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pending:   { label: "En attente",       icon: "⏳", color: "text-gray-600" },
  confirmed: { label: "Confirmée",        icon: "✅", color: "text-blue-600" },
  preparing: { label: "En préparation",   icon: "🏪", color: "text-yellow-600" },
  assigned:  { label: "Chauffeur assigné",icon: "🚗", color: "text-indigo-600" },
  picked_up: { label: "Ramassée",         icon: "📦", color: "text-orange-600" },
  en_route:  { label: "En route",         icon: "🚗", color: "text-purple-600" },
  arrived:   { label: "Arrivé",           icon: "📍", color: "text-teal-600" },
  delivered: { label: "Livrée",           icon: "🎉", color: "text-green-600" },
  completed: { label: "Terminée",         icon: "🏁", color: "text-green-700" },
  cancelled: { label: "Annulée",          icon: "❌", color: "text-red-600" },
};

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/client/track/${orderId}`);
      const data = await res.json();
      setTracking(data);
    } catch {}
  }, [orderId]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/client/login"); return; }
      await fetchTracking();
      setLoading(false);
    });
    return () => unsub();
  }, [router, fetchTracking]);

  // Polling toutes les 15 secondes
  useEffect(() => {
    const interval = setInterval(fetchTracking, 15000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!tracking) return <div className="container py-8 text-center"><p>Commande introuvable.</p><Button asChild className="mt-4"><Link href="/client/orders">Retour</Link></Button></div>;

  const cfg = STATUS_CONFIG[tracking.status] || { label: tracking.status, icon: "📦", color: "text-gray-600" };

  // Construire les marqueurs pour la carte
  const markers: MapMarker[] = [];
  if (tracking.store_lat && tracking.store_lng) {
    markers.push({ lat: tracking.store_lat, lng: tracking.store_lng, label: "🏪 " + tracking.store_name, color: "blue" });
  }
  if (tracking.delivery_lat && tracking.delivery_lng) {
    markers.push({ lat: tracking.delivery_lat, lng: tracking.delivery_lng, label: "📍 Livraison", color: "green" });
  }
  if (tracking.driver_lat && tracking.driver_lng) {
    markers.push({ lat: tracking.driver_lat, lng: tracking.driver_lng, label: "🚗 " + (tracking.driver_name || "Chauffeur"), color: "orange" });
  }

  // Coordonnées par défaut si pas de données GPS
  const defaultLat = tracking.delivery_lat || tracking.store_lat || 45.5017;
  const defaultLng = tracking.delivery_lng || tracking.store_lng || -73.5673;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/client/orders/${orderId}`}><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-sm">Suivi de commande</h1>
          <p className="text-xs text-muted-foreground">#{orderId.slice(-6).toUpperCase()}</p>
        </div>
        <Badge className={`text-xs border-0 bg-orange-100 text-orange-700`}>
          {cfg.icon} {cfg.label}
        </Badge>
      </div>

      {/* Carte */}
      <div className="h-64 md:h-80 relative">
        <LeafletMap
          center={[defaultLat, defaultLng]}
          zoom={14}
          markers={markers}
          className="h-full w-full"
        />
      </div>

      {/* Infos */}
      <div className="flex-1 p-4 space-y-4">
        {/* ETA */}
        {tracking.estimated_minutes && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-bold text-lg text-orange-700">~{tracking.estimated_minutes} min</p>
                  <p className="text-xs text-orange-600">Temps estimé de livraison</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chauffeur */}
        {tracking.driver_name && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tracking.driver_name}</p>
                    <p className="text-xs text-muted-foreground">Votre chauffeur</p>
                  </div>
                </div>
                {tracking.driver_phone && (
                  <a href={`tel:${tracking.driver_phone}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Phone className="h-3 w-3" /> Appeler
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adresse */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Adresse de livraison</p>
                <p className="text-sm font-medium">{tracking.delivery_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actualisation auto */}
        <p className="text-center text-xs text-muted-foreground">
          <Navigation className="h-3 w-3 inline mr-1" />
          Position actualisée toutes les 15 secondes
        </p>
      </div>
    </div>
  );
}
