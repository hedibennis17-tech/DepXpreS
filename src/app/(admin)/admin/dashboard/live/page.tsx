'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      fetch('/api/admin/dashboard')
        .then(r => r.json())
        .then(d => {
          if (d.error) setError(d.details || d.error);
          else { setData(d); setError(null); }
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-red-500">
        <p className="font-semibold">Erreur de chargement</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord en direct</h1>
          <p className="text-muted-foreground mt-1">Activité en temps réel — actualisation toutes les 10 secondes</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>En direct
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{data?.activeOrders ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Commandes actives</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{data?.onlineDrivers ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Chauffeurs en ligne</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{data?.todayOrders ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Commandes aujourd&apos;hui</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{data?.completedToday ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Livrées aujourd&apos;hui</p>
        </div>
      </div>

      {Array.isArray(data?.activeOrdersList) && data.activeOrdersList.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Commandes actives ({data.activeOrdersList.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeOrdersList.map((order: any) => (
              <div key={order.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{order.orderNumber}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivering' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{order.clientName} &#8594; {order.storeName}</p>
                <p className="text-xs text-muted-foreground mt-1">Chauffeur: {order.driverName || 'Non assigné'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data?.onlineDriversList) && data.onlineDriversList.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Chauffeurs en ligne ({data.onlineDriversList.length})</h2>
          <div className="flex flex-wrap gap-2">
            {data.onlineDriversList.map((driver: any) => (
              <div key={driver.id} className="flex items-center gap-2 px-3 py-2 rounded-full border bg-card text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {driver.full_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
