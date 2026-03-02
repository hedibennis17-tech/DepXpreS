'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { promotionId } = useParams() as { promotionId: string };
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!promotionId) return;
    fetch(`/api/admin/promotions/${promotionId}`).then(r => r.json()).then(d => setPromo(d.promotion)).finally(() => setLoading(false));
  }, [promotionId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!promo) return <div className="text-center py-8 text-muted-foreground">Promotion introuvable.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promotion: {promo.code}</h1>
        <p className="text-muted-foreground mt-1">{promo.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-2">
        {Object.entries(promo).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-medium">{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '-')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
