'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dispatch?status=queued').then(r => r.json()).then(d => setQueue(d.queue || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File d&apos;attente dispatch</h1>
        <p className="text-muted-foreground mt-1">{queue.length} commande(s) en attente d&apos;assignation</p>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Commande', 'Dépanneur', 'Zone', 'Mode', 'Tentatives', 'Priorité', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">File de dispatch vide — toutes les commandes sont assignées</td></tr>
              ) : queue.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{item.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{item.storeName}</td>
                  <td className="px-4 py-3 text-sm">{item.zoneName}</td>
                  <td className="px-4 py-3 text-sm"><span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{item.dispatchMode}</span></td>
                  <td className="px-4 py-3 text-sm">{item.attemptCount}/{item.maxAttempts}</td>
                  <td className="px-4 py-3 text-sm"><span className={`inline-flex px-2 py-1 rounded-full text-xs ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{item.priority}</span></td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/dispatch/manual?dispatchId=${item.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Assigner →</Link>
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
