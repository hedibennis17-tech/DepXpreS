'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dispatch').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispatch automatique</h1>
        <p className="text-muted-foreground mt-1">Données Firebase en temps réel</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {data ? (
          <div className="space-y-3">
            {(data.queue || data.events || []).slice(0, 10).map((item: any, i: number) => (
              <div key={item.id || i} className="p-4 rounded-lg border bg-muted/20">
                {Object.entries(item).slice(0, 6).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}</span>
                  </div>
                ))}
              </div>
            ))}
            {(data.queue || data.events || []).length === 0 && <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>}
          </div>
        ) : <p className="text-muted-foreground text-sm">Chargement des données...</p>}
      </div>
    </div>
  );
}
