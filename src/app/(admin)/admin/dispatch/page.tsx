'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function Page() {
  const [data, setData] = useState<any>({ queue: [], events: [], availableDrivers: [], metrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => fetch('/api/admin/dispatch').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const { queue, events, availableDrivers, metrics } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de Dispatch</h1>
          <p className="text-muted-foreground mt-1">Gestion des assignations de chauffeurs en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/dispatch/live-map" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">🗺 Carte Live</Link>
          <Link href="/admin/dispatch/queue" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">File d&apos;attente</Link>
          <Link href="/admin/dispatch/manual" className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted">Dispatch manuel</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'En file', value: metrics.queued || 0, color: 'text-yellow-600' },
          { label: 'Assignées', value: metrics.assigned || 0, color: 'text-blue-600' },
          { label: 'Complétées', value: metrics.completed || 0, color: 'text-green-600' },
          { label: 'Chauffeurs dispo', value: metrics.availableDrivers || 0, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">File de dispatch</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Actualisation auto 15s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {['Commande', 'Dépanneur', 'Zone', 'Statut', 'Chauffeur', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">File de dispatch vide</td></tr>
                ) : queue.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{item.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{item.storeName}</td>
                    <td className="px-4 py-3 text-sm">{item.zoneName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.dispatchStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {item.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.selectedDriverName || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.dispatchStatus === 'queued' && (
                        <Link href={`/admin/dispatch/manual?dispatchId=${item.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Assigner →</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Chauffeurs disponibles ({availableDrivers.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {availableDrivers.length === 0 ? (
              <p className="px-4 py-6 text-center text-muted-foreground text-sm">Aucun chauffeur disponible</p>
            ) : availableDrivers.slice(0, 8).map((driver: any) => (
              <div key={driver.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{driver.full_name || driver.fullName}</p>
                  <p className="text-xs text-muted-foreground">{driver.current_zone_id} • {driver.rating_average?.toFixed(1) || '4.5'} ⭐</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
