'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [payment, setPayment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`).then(r => r.json()).then(d => {
      setOrder(d.order);
      if (d.order?.paymentId) {
        fetch(`/api/admin/transactions/${d.order.paymentId}`).then(r => r.json()).then(td => setPayment(td.transaction));
      }
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paiement de la commande</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Détails financiers</h2>
        <div className="space-y-2">
          {[
            ['Sous-total', `${order?.subtotal?.toFixed(2)} $`],
            ['Frais de livraison', `${order?.deliveryFee?.toFixed(2)} $`],
            ['Taxes (TPS+TVQ)', `${order?.taxes?.toFixed(2)} $`],
            ['Remise promo', order?.discount ? `-${order.discount.toFixed(2)} $` : '-'],
            ['Total', `${order?.total?.toFixed(2)} $`],
          ].map(([label, value]) => (
            <div key={label} className={`flex justify-between py-2 ${label === 'Total' ? 'border-t font-bold text-base' : 'text-sm border-b last:border-0'}`}>
              <span className={label === 'Total' ? '' : 'text-muted-foreground'}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Informations de paiement</h2>
        {payment ? (
          <div className="space-y-2">
            {[
              ['ID Transaction', payment.id],
              ['Méthode', payment.paymentMethod],
              ['Statut', payment.paymentStatus],
              ['Montant', `${payment.amount?.toFixed(2)} $`],
              ['Date', payment.createdAt ? new Date(payment.createdAt._seconds ? payment.createdAt._seconds * 1000 : payment.createdAt).toLocaleString('fr-CA') : '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              ['Méthode', order?.paymentMethod || 'Carte de crédit'],
              ['Statut paiement', order?.paymentStatus || 'paid'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
