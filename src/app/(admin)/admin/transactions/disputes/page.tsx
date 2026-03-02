'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/support?category=payment_issue').then(r => r.json()).then(d => setItems(d.transactions || d.payouts || d.wallets || d.tickets || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Litiges financiers</h1>
        <p className="text-muted-foreground mt-1">{items.length} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
        ) : items.slice(0, 20).map((item, i) => (
          <div key={item.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-medium text-sm">{item.id?.slice(0, 16)}...</p>
              <p className="text-xs text-muted-foreground">{item.paymentMethod || item.method || item.ownerType || ''} • {item.paymentStatus || item.status || ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {item.amount !== undefined && <span className="font-bold text-sm">{item.amount?.toFixed(2)} $</span>}
              {item.balance !== undefined && <span className="font-bold text-sm">{item.balance?.toFixed(2)} $</span>}
              <Link href={`/admin/transactions/${item.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
