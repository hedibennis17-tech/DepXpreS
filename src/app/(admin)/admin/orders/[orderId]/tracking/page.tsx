'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [tracking, setTracking] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${orderId}`).then(r => r.json()),
      fetch(`/api/admin/orders/${orderId}/tracking`).then(r => r.json()),
    ]).then(([orderData, trackData]) => {
      setOrder(orderData.order);
      setTracking(trackData.tracking);
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suivi GPS en temps réel</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — Chauffeur: {order?.driverName || 'Non assigné'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Position du chauffeur</h2>
          {tracking ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Latitude</span><span className="font-mono">{tracking.currentLat?.toFixed(6)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Longitude</span><span className="font-mono">{tracking.currentLng?.toFixed(6)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vitesse</span><span>{tracking.speed || 0} km/h</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">ETA</span><span className="font-medium text-orange-500">{tracking.estimatedArrival || '~15 min'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Distance restante</span><span>{tracking.remainingDistance || '~2.3 km'}</span></div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune session de tracking active pour cette commande.</p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Carte</h2>
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm">Carte Google Maps</p>
              <p className="text-xs mt-1">Lat: {tracking?.currentLat?.toFixed(4) || '45.5017'}, Lng: {tracking?.currentLng?.toFixed(4) || '-73.5673'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
