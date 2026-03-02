'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/zones?status=inactive').then(r => r.json()).then(d => setItems(d.zones || d.drivers || d.stores || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zones inactives</h1>
        <p className="text-muted-foreground mt-1">{items.length} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
        ) : items.map((item, i) => (
          <div key={item.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-medium text-sm">{item.name || item.full_name || item.fullName || item.id}</p>
              <p className="text-xs text-muted-foreground">{item.city || item.phone || item.address || ''}</p>
            </div>
            <Link href={`/admin/zones/${item.id}`} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Voir →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
