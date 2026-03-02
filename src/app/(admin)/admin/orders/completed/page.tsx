'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  new: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  driver_assigned: 'bg-purple-100 text-purple-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-pink-100 text-pink-800',
};

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders?order_status=completed').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => !search || 
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    o.storeName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes terminées</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} commande(s)</p>
        </div>
        <Link href="/admin/orders/new" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">+ Nouvelle commande</Link>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher par numéro, client, dépanneur..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Commande', 'Client', 'Dépanneur', 'Total', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune commande trouvée</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{order.clientName}</td>
                  <td className="px-4 py-3 text-sm">{order.storeName}</td>
                  <td className="px-4 py-3 text-sm font-medium">{order.total?.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.order_status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.createdAt ? new Date(order.createdAt._seconds ? order.createdAt._seconds * 1000 : order.createdAt).toLocaleDateString('fr-CA') : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/orders/${order.id}`} className="text-orange-500 hover:text-orange-700 font-medium">Voir →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
