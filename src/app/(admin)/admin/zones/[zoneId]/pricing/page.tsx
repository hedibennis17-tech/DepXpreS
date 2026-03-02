'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { zoneId } = useParams() as { zoneId: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!zoneId) return;
    fetch(`/api/admin/zones/${zoneId}`).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, [zoneId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tarification de la zone</h1>
        <p className="text-muted-foreground mt-1">Zone: {data?.zone?.name || zoneId}</p>
      </div>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Informations</h2>
            {Object.entries(data.zone || {}).slice(0, 10).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium">{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Statistiques</h2>
            {Object.entries(data.stats || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-bold">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
