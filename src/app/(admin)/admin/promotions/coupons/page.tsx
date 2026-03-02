'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/promotions?type=coupon').then(r => r.json()).then(d => setItems(d.promotions || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Codes de réduction</h1>
        <p className="text-muted-foreground mt-1">{items.length} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucune promotion trouvée</p>
        ) : items.map((item, i) => (
          <div key={item.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-mono font-medium text-sm">{item.code}</p>
              <p className="text-xs text-muted-foreground">{item.description} • {item.discountType} {item.discountValue}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
              <Link href={`/admin/promotions/${item.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
