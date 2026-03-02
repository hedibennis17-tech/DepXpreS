'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TYPE_COLORS: Record<string, string> = {
  payment: 'bg-green-100 text-green-800',
  payout: 'bg-blue-100 text-blue-800',
  refund: 'bg-red-100 text-red-800',
};

export default function Page() {
  const [data, setData] = useState<any>({ transactions: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?type=${filter}` : '';
    fetch(`/api/admin/transactions${params}`).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const { transactions, metrics } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions financières</h1>
        <p className="text-muted-foreground mt-1">Paiements, remboursements et versements chauffeurs</p>
      </div>
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenus totaux', value: `${metrics.totalRevenue?.toFixed(2)} $`, color: 'text-green-600' },
            { label: 'Remboursements', value: `${metrics.totalRefunds?.toFixed(2)} $`, color: 'text-red-600' },
            { label: 'Versements chauffeurs', value: `${metrics.totalPayouts?.toFixed(2)} $`, color: 'text-blue-600' },
            { label: 'Revenu net', value: `${metrics.netRevenue?.toFixed(2)} $`, color: 'text-orange-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous les types</option>
            <option value="payment">Paiements</option>
            <option value="payout">Versements</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['ID', 'Type', 'Montant', 'Statut', 'Méthode', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune transaction trouvée</td></tr>
              ) : transactions.slice(0, 30).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs font-mono">{tx.id?.slice(0, 12)}...</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[tx.transactionType] || 'bg-gray-100 text-gray-800'}`}>{tx.transactionType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{tx.amount?.toFixed(2)} $</td>
                  <td className="px-4 py-3 text-sm">{tx.paymentStatus || tx.status}</td>
                  <td className="px-4 py-3 text-sm">{tx.paymentMethod || tx.method || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{tx.createdAt ? new Date(tx.createdAt._seconds ? tx.createdAt._seconds * 1000 : tx.createdAt).toLocaleDateString('fr-CA') : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/transactions/${tx.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
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
