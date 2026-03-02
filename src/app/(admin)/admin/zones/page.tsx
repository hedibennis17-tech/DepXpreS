'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/zones')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setZones(d.zones || []);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 rounded-xl border border-red-200">
      <p className="text-red-700 font-medium">Erreur de chargement</p>
      <p className="text-red-600 text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zones de livraison</h1>
          <p className="text-muted-foreground mt-1">{zones.length} zone(s) configurée(s)</p>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
          + Nouvelle zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune zone configurée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map(zone => (
            <div key={zone.id} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg">{zone.nameFr || zone.nameEn || zone.name || zone.id}</h2>
                  <p className="text-sm text-muted-foreground">{zone.slug || zone.id}</p>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {zone.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais livraison</span>
                  <span className="font-medium">{zone.deliveryFee ? `${zone.deliveryFee} $` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Délai estimé</span>
                  <span className="font-medium">{zone.estimatedTimeMinutes ? `${zone.estimatedTimeMinutes} min` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commande min.</span>
                  <span className="font-medium">{zone.minOrderAmount ? `${zone.minOrderAmount} $` : 'N/A'}</span>
                </div>
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
                <Link
                  href={`/admin/zones/${zone.id}`}
                  className="flex-1 text-center py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  Gérer
                </Link>
                <Link
                  href={`/admin/zones/${zone.id}/map`}
                  className="flex-1 text-center py-2 border rounded-lg text-sm font-medium hover:bg-muted"
                >
                  Carte
                </Link>
                <Link
                  href={`/admin/zones/${zone.id}/stats`}
                  className="flex-1 text-center py-2 border rounded-lg text-sm font-medium hover:bg-muted"
                >
                  Stats
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
