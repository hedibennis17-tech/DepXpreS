'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Commande reçue',
  confirmed: 'Commande confirmée',
  preparing: 'En préparation',
  driver_assigned: 'Chauffeur assigné',
  delivering: 'En livraison',
  completed: 'Livraison terminée',
  cancelled: 'Commande annulée',
};

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [history, setHistory] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${orderId}`).then(r => r.json()),
      fetch(`/api/admin/orders/${orderId}/history`).then(r => r.json()),
    ]).then(([orderData, histData]) => {
      setOrder(orderData.order);
      setHistory(histData.history || []);
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline de la commande</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — {order?.clientName}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
          <div className="space-y-6">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm pl-10">Aucun historique disponible.</p>
            ) : history.map((h, i) => (
              <div key={h.id || i} className="relative flex items-start gap-4 pl-10">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-background -translate-x-1/2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{STATUS_LABELS[h.status] || h.status?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{h.createdAt ? new Date(h.createdAt._seconds ? h.createdAt._seconds * 1000 : h.createdAt).toLocaleString('fr-CA') : '-'}</p>
                  </div>
                  {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                  {h.actorName && <p className="text-xs text-muted-foreground">Par: {h.actorName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
