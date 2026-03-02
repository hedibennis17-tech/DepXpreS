'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { transactionId } = useParams() as { transactionId: string };
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    fetch(`/api/admin/transactions/${transactionId}`).then(r => r.json()).then(d => setTx(d.transaction)).finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!tx) return <div className="text-center py-8 text-muted-foreground">Transaction introuvable.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détail de la transaction</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">{transactionId}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-2">
        {Object.entries(tx).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-medium">{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '-')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
