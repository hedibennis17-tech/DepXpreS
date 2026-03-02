'use client';

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import type { MapMarker } from '@/components/maps/LeafletMap';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock, MapPin, Package, Phone, Star, Navigation, ChevronLeft } from "lucide-react";
import Link from "next/link";

const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});

const DEMO_ORDER_ID = 'order-001';

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',           icon: '⏳', color: 'text-gray-600',   bg: 'bg-gray-100' },
  confirmed: { label: 'Confirmée',            icon: '✅', color: 'text-blue-600',   bg: 'bg-blue-100' },
  preparing: { label: 'En préparation',       icon: '🏪', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  assigned:  { label: 'Chauffeur assigné',    icon: '🚗', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  picked_up: { label: 'Ramassée',             icon: '📦', color: 'text-orange-600', bg: 'bg-orange-100' },
  en_route:  { label: 'En route',             icon: '🚗', color: 'text-purple-600', bg: 'bg-purple-100' },
  arrived:   { label: 'Arrivé',               icon: '📍', color: 'text-teal-600',   bg: 'bg-teal-100' },
  delivered: { label: 'Livré',                icon: '🎉', color: 'text-green-600',  bg: 'bg-green-100' },
  completed: { label: 'Terminée',             icon: '🏁', color: 'text-green-700',  bg: 'bg-green-100' },
  cancelled: { label: 'Annulée',              icon: '❌', color: 'text-red-600',    bg: 'bg-red-100' },
};

const WORKFLOW_STEPS = ['confirmed', 'preparing', 'assigned', 'picked_up', 'en_route', 'arrived', 'delivered'];

interface TrackingData {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
  driver?: {
    name: string;
    phone?: string;
    rating: number;
    photo?: string;
    vehicle?: string;
    location?: { lat: number; lng: number };
  };
  store?: { name: string; address: string };
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  items?: Array<{ name: string; quantity: number; price: number }>;
  totalAmount?: number;
  statusHistory?: Array<{ status: string; timestamp: string }>;
}

export default function OrderTrackingPage() {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [eta, setEta] = useState(12);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/workflow/order/${DEMO_ORDER_ID}/tracking`);
      const data = await res.json();
      if (data.tracking) {
        setTracking(data.tracking);
        if ((data.tracking.status === 'delivered' || data.tracking.status === 'completed') && !ratingSubmitted) {
          setTimeout(() => setShowRating(true), 1500);
        }
      }
    } catch {
      // Fallback demo data
      setTracking({
        orderId: DEMO_ORDER_ID,
        status: 'en_route',
        estimatedDelivery: '14h35',
        driver: {
          name: 'Marc-André Tremblay',
          rating: 4.9,
          vehicle: 'Honda Civic 2020',
          location: { lat: 45.5631, lng: -73.7124 },
        },
        store: { name: 'Dépanneur Chomedey', address: '123 Boul. Chomedey, Laval' },
        deliveryAddress: '456 Av. du Parc, Laval, QC',
        deliveryLat: 45.5580,
        deliveryLng: -73.7050,
        items: [
          { name: 'Doritos 255g', quantity: 2, price: 4.99 },
          { name: 'Coca-Cola 355ml', quantity: 4, price: 1.99 },
          { name: 'Heineken 6-pack', quantity: 1, price: 14.99 },
        ],
        totalAmount: 38.50,
        statusHistory: [
          { status: 'confirmed', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
          { status: 'preparing', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
          { status: 'assigned',  timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
          { status: 'picked_up', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
          { status: 'en_route',  timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
        ],
      });
    }
    setLoading(false);
  }, [ratingSubmitted]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 8000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  useEffect(() => {
    const timer = setInterval(() => setEta(prev => prev > 1 ? prev - 1 : 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    try {
      await fetch(`/api/workflow/order/${DEMO_ORDER_ID}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raterType: 'client',
          rateeType: 'driver',
          rating,
          comment: ratingComment,
          tags: ratingTags,
        }),
      });
      setRatingSubmitted(true);
    } catch {}
  };

  const currentStatus = tracking?.status || 'pending';
  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const stepIndex = WORKFLOW_STEPS.indexOf(currentStatus);
  const progressPct = stepIndex >= 0 ? Math.round(((stepIndex + 1) / WORKFLOW_STEPS.length) * 100) : 5;

  const mapCenter: [number, number] = tracking?.driver?.location
    ? [tracking.driver.location.lat, tracking.driver.location.lng]
    : [45.5631, -73.7128];

  const mapMarkers: MapMarker[] = [
    ...(tracking?.driver?.location ? [{
      id: 'driver',
      lat: tracking.driver.location.lat,
      lng: tracking.driver.location.lng,
      type: 'driver' as const,
      status: 'delivering' as const,
      label: tracking.driver.name,
      popup: `<strong>🚗 ${tracking.driver.name}</strong><br>Votre chauffeur`,
    }] : []),
    ...(tracking?.deliveryLat && tracking?.deliveryLng ? [{
      id: 'delivery',
      lat: tracking.deliveryLat,
      lng: tracking.deliveryLng,
      type: 'client' as const,
      label: 'Votre adresse',
      popup: `<strong>📍 Livraison</strong><br>${tracking.deliveryAddress || ''}`,
    }] : []),
  ];

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Chargement du suivi...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6 space-y-4">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3">
          <Link href="/client">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au catalogue
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Suivi de commande</h1>
            <p className="text-muted-foreground text-sm">#{DEMO_ORDER_ID.slice(-6).toUpperCase()}</p>
          </div>
          <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-sm px-3 py-1`}>
            {statusInfo.icon} {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* ETA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Arrivée estimée</p>
              <p className="text-3xl font-bold text-primary">{eta} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <div className="flex items-center gap-1 text-sm font-medium">
                <MapPin className="h-3 w-3 text-primary" />
                {tracking?.deliveryAddress?.split(',')[0] || 'Chomedey, Laval'}
              </div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Carte chauffeur */}
      {(currentStatus === 'en_route' || currentStatus === 'arrived' || currentStatus === 'picked_up' || currentStatus === 'assigned') && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Position du chauffeur en temps réel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LeafletMap center={mapCenter} zoom={14} markers={mapMarkers} height="220px" />
          </CardContent>
        </Card>
      )}

      {/* Étapes workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Progression de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {WORKFLOW_STEPS.map((step, i) => {
              const s = STATUS_CONFIG[step];
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    done ? 'bg-green-100 text-green-600' : current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <span>{s.icon}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${done ? 'text-green-600' : current ? 'text-primary' : 'text-muted-foreground'}`}>
                      {s.label}
                    </p>
                    {current && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />En cours...
                      </p>
                    )}
                    {done && <p className="text-xs text-green-600">Terminé</p>}
                  </div>
                  {current && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Infos chauffeur */}
      {tracking?.driver && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Votre chauffeur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={`https://picsum.photos/seed/${tracking.driver.name}/200/200`} />
                <AvatarFallback>{tracking.driver.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{tracking.driver.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{tracking.driver.rating}</span>
                  {tracking.driver.vehicle && <span>· {tracking.driver.vehicle}</span>}
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />Appeler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />Récapitulatif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tracking?.store && (
            <div className="flex items-start gap-2 text-sm mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{tracking.store.name}</p>
                <p className="text-muted-foreground text-xs">{tracking.store.address}</p>
              </div>
            </div>
          )}
          {tracking?.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Livraison</span><span>$4.99</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Taxes (TPS+TVQ)</span>
            <span>${((tracking?.totalAmount || 0) * 0.14975).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">${tracking?.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Historique statuts */}
      {tracking?.statusHistory && tracking.statusHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...tracking.statusHistory].reverse().map((h, i) => {
                const s = STATUS_CONFIG[h.status];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full ${s?.bg || 'bg-muted'} flex items-center justify-center text-xs flex-shrink-0 mt-0.5`}>
                      {s?.icon || '·'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${s?.color || ''}`}>{s?.label || h.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.timestamp ? new Date(h.timestamp).toLocaleString('fr-CA', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        }) : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating chauffeur */}
      {showRating && !ratingSubmitted && (
        <Card className="border-yellow-400/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Évaluez votre chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-3">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`text-4xl transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-muted-foreground'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Rapide', 'Poli', 'Professionnel', 'Ponctuel', 'Retard', 'Mauvaise attitude'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setRatingTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    ratingTags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              placeholder="Commentaire optionnel..."
              className="w-full bg-muted border border-border rounded-lg p-3 text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRating(false)} className="flex-1">Plus tard</Button>
              <Button onClick={handleSubmitRating} disabled={rating === 0} className="flex-1">
                Envoyer l&apos;évaluation ⭐
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {ratingSubmitted && (
        <Card className="border-green-400/50 bg-green-50/50">
          <CardContent className="pt-6 text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="font-bold text-green-700 text-lg">Merci pour votre évaluation !</p>
            <p className="text-muted-foreground text-sm mt-1">Votre avis aide à améliorer le service</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
