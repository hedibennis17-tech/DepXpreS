'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function fmt(d?: string) {
  if (!d) return '—';
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? '—' : dt.toLocaleString('fr-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

const STATUS_STYLES: Record<string, string> = {
  searching: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  queued: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS: Record<string, string> = {
  searching: '🔍 Recherche', assigned: '✅ Assigné', completed: '🏁 Complété',
  failed: '❌ Échoué', queued: '⏳ En file',
};

const ZONES: Record<string, string> = {
  'zone-laval': 'Laval', 'zone-laval-ouest': 'Laval Ouest',
  'zone-longueuil': 'Longueuil', 'zone-mtl-centre': 'Mtl Centre-Ville', 'zone-mtl-nord': 'Mtl Nord',
};

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/dispatch')
      .then(r => r.json())
      .then(d => setItems(d.queue || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(e => filter === 'all' || e.dispatchStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique dispatch</h1>
          <p className="text-sm text-gray-500 mt-1">Toutes les entrées de dispatch — {items.length} au total</p>
        </div>
        <Link href="/admin/dispatch" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
          ← Retour dispatch
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historique complet ({filtered.length})</h2>
          <div className="flex gap-2 flex-wrap">
            {['all', 'searching', 'assigned', 'completed', 'failed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📜</p>
            <p className="font-medium">Aucun historique disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commande', 'Dépanneur', 'Zone', 'Chauffeur', 'Statut', 'Mis à jour', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-600">
                      {item.orderNumber || `#${item.id?.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.storeName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.zoneName || ZONES[item.zoneId] || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.selectedDriverName || item.selectedDriverId?.slice(-8) || <span className="italic text-gray-400">Non assigné</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.dispatchStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[item.dispatchStatus] || item.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      {item.orderId && (
                        <Link href={`/admin/orders/${item.orderId}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Voir</Link>
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
