'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`).then(r => r.json()).then(d => {
      setOrder(d.order);
      setAmount(d.order?.total?.toFixed(2) || '');
    }).finally(() => setLoading(false));
  }, [orderId]);

  const handleRefund = async () => {
    if (!amount || !reason) { alert('Veuillez remplir tous les champs'); return; }
    setSubmitting(true);
    const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), reason }),
    });
    const data = await res.json();
    if (data.success) { setSuccess(true); setTimeout(() => router.push(`/admin/orders/${orderId}`), 2000); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Remboursement</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — Total: {order?.total?.toFixed(2)} $</p>
      </div>
      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold text-green-800">Remboursement effectué avec succès!</p>
          <p className="text-sm text-green-600 mt-1">Redirection en cours...</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Montant à rembourser ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={order?.total} step="0.01" className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Raison du remboursement</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="">Sélectionner une raison...</option>
              <option value="order_cancelled">Commande annulée</option>
              <option value="items_missing">Articles manquants</option>
              <option value="wrong_items">Articles incorrects</option>
              <option value="late_delivery">Livraison trop tardive</option>
              <option value="quality_issue">Problème de qualité</option>
              <option value="customer_request">Demande du client</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleRefund} disabled={submitting} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">
              {submitting ? 'Traitement...' : 'Confirmer le remboursement'}
            </button>
            <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg font-medium hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
