'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Page() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const [orders, drivers, clients] = await Promise.all([
      fetch(`/api/admin/orders?search=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`/api/admin/drivers?search=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`/api/admin/clients?search=${encodeURIComponent(query)}`).then(r => r.json()),
    ]);
    setResults({
      orders: orders.orders?.slice(0, 5) || [],
      drivers: drivers.drivers?.slice(0, 5) || [],
      clients: clients.clients?.slice(0, 5) || [],
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recherche globale</h1>
        <p className="text-muted-foreground mt-1">Rechercher dans toute la plateforme DepXpreS</p>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Numéro de commande, nom client, chauffeur..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm"
        />
        <button onClick={search} disabled={loading} className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
          {loading ? '...' : 'Rechercher'}
        </button>
      </div>
      {results && (
        <div className="space-y-6">
          {results.orders.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Commandes ({results.orders.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.orders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{o.clientName} • {o.storeName}</p>
                    </div>
                    <Link href={`/admin/orders/${o.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.drivers.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Chauffeurs ({results.drivers.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.drivers.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{d.full_name || d.fullName}</p>
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    </div>
                    <Link href={`/admin/drivers/${d.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.clients.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Clients ({results.clients.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.clients.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Link href={`/admin/clients/${c.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.orders.length === 0 && results.drivers.length === 0 && results.clients.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun résultat pour &quot;{query}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
}
