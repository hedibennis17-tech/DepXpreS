'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carte en direct</h1>
        <p className="text-muted-foreground mt-1">Positions des chauffeurs et commandes actives sur la carte</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="w-full h-96 bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
          <div className="text-center z-10">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="font-semibold text-lg">Carte Google Maps — Grand Montréal</p>
            <p className="text-sm text-muted-foreground mt-2">
              {data?.onlineDrivers?.length || 0} chauffeurs en ligne • {data?.activeOrders?.length || 0} commandes actives
            </p>
            <p className="text-xs text-muted-foreground mt-1">Clé API Google Maps configurée: AIzaSyDHZkzDCSJXxltAnvWeSeC9wLylN93G3S0</p>
          </div>
          {data?.onlineDrivers?.slice(0, 5).map((driver: any, i: number) => (
            <div key={driver.id} className="absolute text-2xl" style={{ top: `${20 + i * 15}%`, left: `${20 + i * 12}%` }}>
              🚗
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-3">Chauffeurs actifs</h2>
          <div className="space-y-2">
            {(data?.onlineDrivers || []).slice(0, 5).map((driver: any) => (
              <div key={driver.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>{driver.full_name || driver.fullName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{driver.current_zone_id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-3">Commandes en livraison</h2>
          <div className="space-y-2">
            {(data?.activeOrders || []).filter((o: any) => o.order_status === 'delivering').slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <span>{order.orderNumber}</span>
                <span className="text-xs text-muted-foreground">{order.driverName || 'Non assigné'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
