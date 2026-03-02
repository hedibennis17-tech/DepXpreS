'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/wallets?ownerType=client').then(r => r.json()).then(d => setItems(d.clients || d.wallets || [])).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portefeuilles clients</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
          ) : filtered.map((item, i) => (
            <div key={item.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30">
              <div>
                <p className="font-medium text-sm">{item.fullName || item.ownerName || item.id}</p>
                <p className="text-xs text-muted-foreground">{item.email || item.phone || item.ownerType || ''}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.balance !== undefined && <span className="text-sm font-medium">{item.balance?.toFixed(2)} $</span>}
                <Link href={`/admin/clients/${item.id}`} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Voir →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
