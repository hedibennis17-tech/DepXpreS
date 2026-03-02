'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { MapMarker } from '@/components/maps/LeafletMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Clock, DollarSign, Star, Package, MapPin, Phone,
  CheckCircle2, XCircle, Navigation, Bell, TrendingUp
} from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Chargement de la carte...</div>
    </div>
  ),
});

const DEMO_DRIVER = {
  id: 'driver-001',
  firstName: 'Marc-André',
  lastName: 'Tremblay',
  rating: 4.8,
  totalDeliveries: 247,
};

const STATUS_NEXT: Record<string, string> = {
  assigned:  'picked_up',
  picked_up: 'en_route',
  en_route:  'arrived',
  arrived:   'delivered',
  delivered: 'completed',
};

const STATUS_LABELS: Record<string, string> = {
  assigned:  'Assignée',
  picked_up: 'Ramassée',
  en_route:  'En route',
  arrived:   'Arrivé',
  delivered: 'Livrée',
  completed: 'Terminée',
};

const STATUS_ACTIONS: Record<string, { label: string; icon: string; color: string }> = {
  assigned:  { label: 'Ramassée au dépanneur', icon: '🏪', color: 'bg-blue-600 hover:bg-blue-700' },
  picked_up: { label: 'En route vers le client', icon: '🚗', color: 'bg-purple-600 hover:bg-purple-700' },
  en_route:  { label: 'Arrivé chez le client', icon: '📍', color: 'bg-teal-600 hover:bg-teal-700' },
  arrived:   { label: 'Commande livrée', icon: '✅', color: 'bg-green-600 hover:bg-green-700' },
  delivered: { label: 'Terminer la livraison', icon: '🏁', color: 'bg-gray-600 hover:bg-gray-700' },
};

interface Order {
  id: string;
  status: string;
  clientName?: string;
  clientPhone?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  totalAmount?: number;
  store?: { name: string; address: string; phone?: string; location?: { lat: number; lng: number } };
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingTags, setRatingTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [todayStats] = useState({ deliveries: 8, earnings: 87.50, rating: 4.9, hours: '4h 32m' });
  const driverLocation: [number, number] = [45.5631, -73.7128];

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchActiveOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/workflow/driver/\${DEMO_DRIVER.id}/active-order`);
      const data = await res.json();
      if (data.activeOrder) setActiveOrder(data.activeOrder);
    } catch {}
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetchActiveOrder();
      const interval = setInterval(fetchActiveOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [isOnline, fetchActiveOrder]);

  const handleStatusAdvance = async () => {
    if (!activeOrder) return;
    const nextStatus = STATUS_NEXT[activeOrder.status];
    if (!nextStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/workflow/order/\${activeOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: nextStatus, driverId: DEMO_DRIVER.id, location: { lat: driverLocation[0], lng: driverLocation[1] } }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(prev => prev ? { ...prev, status: nextStatus } : null);
        showNotif(`✅ \${STATUS_LABELS[nextStatus] || nextStatus}`);
        if (nextStatus === 'completed') setTimeout(() => setShowRating(true), 800);
      } else {
        showNotif(`❌ \${data.error}`);
      }
    } catch { showNotif('❌ Erreur de connexion'); }
    finally { setActionLoading(false); }
  };

  const handleSubmitRating = async () => {
    if (!activeOrder || rating === 0) return;
    try {
      await fetch(`/api/workflow/order/\${activeOrder.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raterType: 'driver', rateeType: 'client', rating, comment: ratingComment, tags: ratingTags }),
      });
      setRatingSubmitted(true);
      showNotif('⭐ Évaluation envoyée !');
      setTimeout(() => { setShowRating(false); setActiveOrder(null); setRating(0); setRatingComment(''); setRatingTags([]); setRatingSubmitted(false); }, 2000);
    } catch { showNotif('❌ Erreur'); }
  };

  const mapMarkers: MapMarker[] = [
    { id: 'driver', lat: driverLocation[0], lng: driverLocation[1], type: 'driver', status: isOnline ? 'online' : 'offline', label: 'Vous', popup: '<strong>Votre position</strong>' },
    ...(activeOrder?.store?.location ? [{ id: 'store', lat: activeOrder.store.location.lat, lng: activeOrder.store.location.lng, type: 'store' as const, label: activeOrder.store.name, popup: `<strong>\${activeOrder.store.name}</strong>` }] : []),
    ...(activeOrder?.deliveryLat && activeOrder?.deliveryLng ? [{ id: 'client', lat: activeOrder.deliveryLat, lng: activeOrder.deliveryLng, type: 'client' as const, label: 'Client', popup: `<strong>Livraison</strong><br>\${activeOrder.deliveryAddress || ''}` }] : []),
  ];

  const nextAction = activeOrder ? STATUS_ACTIONS[activeOrder.status] : null;
  const stepIndex = Object.keys(STATUS_NEXT).indexOf(activeOrder?.status || '');
  const totalSteps = Object.keys(STATUS_NEXT).length;

  return (
    <div className="container py-6 space-y-6">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://picsum.photos/seed/driver-marc/200/200" />
            <AvatarFallback>MA</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">{DEMO_DRIVER.firstName} {DEMO_DRIVER.lastName}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{DEMO_DRIVER.rating} · {DEMO_DRIVER.totalDeliveries} livraisons</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="online-toggle" checked={isOnline} onCheckedChange={setIsOnline} />
            <Label htmlFor="online-toggle" className={`font-semibold \${isOnline ? 'text-green-600' : 'text-muted-foreground'}`}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Label>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Gains aujourd'hui", value: `\$\${todayStats.earnings.toFixed(2)}`, color: 'text-primary' },
          { icon: Package, label: 'Livraisons', value: String(todayStats.deliveries), color: '' },
          { icon: Star, label: 'Note', value: String(todayStats.rating), color: '' },
          { icon: Clock, label: 'Temps en ligne', value: todayStats.hours, color: '' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <stat.icon className="h-4 w-4" />{stat.label}
              </div>
              <p className={`text-2xl font-bold \${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">

          {/* Hors ligne */}
          {!isOnline && (
            <Card>
              <CardContent className="pt-6 text-center py-10">
                <div className="text-4xl mb-3">⚫</div>
                <p className="text-muted-foreground text-sm">Passez en ligne pour recevoir des commandes</p>
              </CardContent>
            </Card>
          )}

          {/* En attente */}
          {isOnline && !activeOrder && (
            <Card className="border-primary/30">
              <CardContent className="pt-6 text-center py-10">
                <div className="text-4xl mb-3 animate-pulse">🔍</div>
                <p className="font-semibold mb-1">En attente d&apos;une commande...</p>
                <p className="text-muted-foreground text-xs">Vous serez notifié dès qu&apos;une commande est disponible</p>
              </CardContent>
            </Card>
          )}

          {/* Commande active */}
          {isOnline && activeOrder && !showRating && (
            <Card className="border-primary/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Commande #{activeOrder.id.slice(-6).toUpperCase()}</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">{STATUS_LABELS[activeOrder.status] || activeOrder.status}</Badge>
                </div>
                {/* Barre de progression */}
                <div className="flex gap-1 mt-2">
                  {Object.keys(STATUS_NEXT).map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full \${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeOrder.store && (
                  <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" />Ramassage</div>
                    <p className="text-sm font-semibold">{activeOrder.store.name}</p>
                    <p className="text-xs text-muted-foreground">{activeOrder.store.address}</p>
                    {activeOrder.store.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{activeOrder.store.phone}</div>}
                  </div>
                )}
                {activeOrder.deliveryAddress && (
                  <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium"><Navigation className="h-4 w-4 text-blue-600" />Livraison</div>
                    <p className="text-sm font-semibold">{activeOrder.clientName || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{activeOrder.deliveryAddress}</p>
                    {activeOrder.clientPhone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{activeOrder.clientPhone}</div>}
                  </div>
                )}
                {activeOrder.items && activeOrder.items.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Articles ({activeOrder.items.length})</p>
                    {activeOrder.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-muted-foreground">{(item.price * item.quantity).toFixed(2)}$</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span className="text-primary">{activeOrder.totalAmount?.toFixed(2)}$</span>
                    </div>
                  </div>
                )}
                {nextAction && (
                  <Button
                    onClick={handleStatusAdvance}
                    disabled={actionLoading}
                    className={`w-full \${nextAction.color}`}
                  >
                    {actionLoading ? 'Mise à jour...' : `\${nextAction.icon} \${nextAction.label}`}
                  </Button>
                )}
                {activeOrder.status === 'completed' && (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-green-700">Livraison terminée !</p>
                    <p className="text-sm text-muted-foreground">+{((activeOrder.totalAmount || 0) * 0.8).toFixed(2)}$ ajouté</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rating client */}
          {showRating && !ratingSubmitted && (
            <Card className="border-yellow-400/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />Évaluez le client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-transform hover:scale-110 \${s <= rating ? 'text-yellow-400' : 'text-muted'}`}>★</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Poli','Présent','Bonne adresse','Rapide','Problème adresse'].map(tag => (
                    <button key={tag} onClick={() => setRatingTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 rounded-full text-xs border transition-all \${ratingTags.includes(tag) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
                <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Commentaire optionnel..." className="w-full bg-muted border border-border rounded-lg p-3 text-sm resize-none" rows={2} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowRating(false); setActiveOrder(null); }} className="flex-1">Passer</Button>
                  <Button onClick={handleSubmitRating} disabled={rating === 0} className="flex-1">Envoyer ⭐</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showRating && ratingSubmitted && (
            <Card className="border-green-400/50">
              <CardContent className="pt-6 text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-700">Évaluation envoyée !</p>
              </CardContent>
            </Card>
          )}

          {/* Gains semaine */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />Gains cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">$342.75</p>
              <p className="text-sm text-muted-foreground mt-1">+12% vs semaine dernière</p>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                {[['Lundi','$45.00'],['Mardi','$62.50'],['Mercredi','$38.25'],['Jeudi','$109.50']].map(([day, amt]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium">{amt}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-primary">
                  <span>Aujourd&apos;hui</span><span>$87.50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carte GPS */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full min-h-[500px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />Carte en direct
                </CardTitle>
                <Badge className={isOnline ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}>
                  {isOnline ? 'GPS actif' : 'Hors ligne'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)] min-h-[440px]">
              <LeafletMap center={driverLocation} zoom={13} markers={mapMarkers} height="100%" className="min-h-[440px]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
