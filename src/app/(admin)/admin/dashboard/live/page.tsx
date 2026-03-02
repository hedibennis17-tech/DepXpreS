'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord en direct</h1>
          <p className="text-muted-foreground mt-1">Activité en temps réel — actualisation toutes les 10 secondes</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>En direct</span>
      </div>
      {data?.activeOrders && (
        <div>
          <h2 className="font-semibold mb-3">Commandes actives ({data.activeOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeOrders.map((order: any) => (
              <div key={order.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{order.orderNumber}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.order_status === 'delivering' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.order_status?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted-foreground">{order.clientName} → {order.storeName}</p>
                <p className="text-xs text-muted-foreground mt-1">Chauffeur: {order.driverName || 'Non assigné'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.onlineDrivers && (
        <div>
          <h2 className="font-semibold mb-3">Chauffeurs en ligne ({data.onlineDrivers.length})</h2>
          <div className="flex flex-wrap gap-2">
            {data.onlineDrivers.map((driver: any) => (
              <div key={driver.id} className="flex items-center gap-2 px-3 py-2 rounded-full border bg-card text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {driver.full_name || driver.fullName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
