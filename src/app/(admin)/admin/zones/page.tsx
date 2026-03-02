'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/zones').then(r => r.json()).then(d => setZones(d.zones || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zones de livraison</h1>
        <p className="text-muted-foreground mt-1">{zones.length} zone(s) configurée(s)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">{zone.name}</h2>
                <p className="text-sm text-muted-foreground">{zone.city}, {zone.province}</p>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{zone.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Commandes', value: zone.ordersCount || 0 },
                { label: 'Chauffeurs', value: zone.driversCount || 0 },
                { label: 'Dépanneurs', value: zone.storesCount || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/zones/${zone.id}`} className="flex-1 text-center py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Gérer</Link>
              <Link href={`/admin/zones/${zone.id}/map`} className="flex-1 text-center py-2 border rounded-lg text-sm font-medium hover:bg-muted">Carte</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
