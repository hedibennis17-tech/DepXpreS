'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function fmt(d?: string) {
  if (!d) return '—';
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? '—' : dt.toLocaleString('fr-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

const ZONES: Record<string, string> = {
  'zone-laval': 'Laval', 'zone-laval-ouest': 'Laval Ouest',
  'zone-longueuil': 'Longueuil', 'zone-mtl-centre': 'Mtl Centre-Ville', 'zone-mtl-nord': 'Mtl Nord',
};

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dispatch')
      .then(r => r.json())
      .then(d => {
        // Réassignations = entrées avec un chauffeur assigné mais qui ont eu des tentatives multiples
        const q = d.queue || [];
        setItems(q.filter((e: any) => e.selectedDriverId && (e.attemptCount > 1 || e.dispatchStatus === 'reassigned')));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réassignations</h1>
          <p className="text-sm text-gray-500 mt-1">Commandes ayant nécessité un changement de chauffeur</p>
        </div>
        <Link href="/admin/dispatch" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          ← Retour dispatch
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Historique des réassignations
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{items.length}</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔄</p>
            <p className="font-medium">Aucune réassignation enregistrée</p>
            <p className="text-sm mt-1">Les réassignations apparaîtront ici quand un chauffeur est remplacé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commande', 'Zone', 'Chauffeur actuel', 'Tentatives', 'Statut', 'Mis à jour', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-600">
                      {item.orderNumber || `#${item.id?.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.zoneName || ZONES[item.zoneId] || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.selectedDriverName || item.selectedDriverId?.slice(-8) || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-orange-600">{item.attemptCount || 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        🔄 Réassigné
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      {item.orderId && (
                        <Link href={`/admin/orders/${item.orderId}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Voir commande
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
