'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/notifications?channel=sms').then(r => r.json()).then(d => setItems(d.notifications || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications SMS</h1>
        <p className="text-muted-foreground mt-1">{items.length} notification(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucune notification trouvée</p>
        ) : items.slice(0, 20).map((item, i) => (
          <div key={item.id || i} className="flex items-start gap-4 p-4 hover:bg-muted/30">
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.body}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.recipientType}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.channel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
