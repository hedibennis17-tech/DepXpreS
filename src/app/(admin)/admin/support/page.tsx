'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function Page() {
  const [data, setData] = useState<any>({ tickets: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    fetch(`/api/admin/support${params}`).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const { tickets, metrics } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support client</h1>
        <p className="text-muted-foreground mt-1">Gestion des tickets de support et litiges</p>
      </div>
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total tickets', value: metrics.total || 0 },
            { label: 'Ouverts', value: metrics.open || 0, color: 'text-red-600' },
            { label: 'En cours', value: metrics.in_progress || 0, color: 'text-yellow-600' },
            { label: 'Résolus', value: metrics.resolved || 0, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color || ''}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="open">Ouverts</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolus</option>
            <option value="closed">Fermés</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Ticket', 'Sujet', 'Catégorie', 'Priorité', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun ticket trouvé</td></tr>
              ) : tickets.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs font-mono">{ticket.id?.slice(0, 10)}...</td>
                  <td className="px-4 py-3 text-sm font-medium">{ticket.subject}</td>
                  <td className="px-4 py-3 text-sm">{ticket.category?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || 'bg-gray-100 text-gray-800'}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{ticket.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.createdAt ? new Date(ticket.createdAt._seconds ? ticket.createdAt._seconds * 1000 : ticket.createdAt).toLocaleDateString('fr-CA') : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/support/${ticket.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
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
