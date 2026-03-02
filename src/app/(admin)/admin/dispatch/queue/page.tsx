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

const STATUS_STYLES: Record<string, string> = {
  searching: 'bg-yellow-100 text-yellow-700', assigned: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', queued: 'bg-orange-100 text-orange-700',
};

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = () => {
    fetch('/api/admin/dispatch')
      .then(r => r.json())
      .then(d => { setItems(d.queue || []); setLastUpdate(new Date()); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File de dispatch</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} entrée{items.length !== 1 ? 's' : ''} · MAJ {lastUpdate.toLocaleTimeString('fr-CA')}
          </p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
          ↻ Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-medium">File de dispatch vide</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Commande', 'Dépanneur', 'Zone', 'Chauffeur', 'Statut', 'Mis à jour', 'Expire', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-600">
                      {item.orderNumber || `#${item.id?.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.storeName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.zoneName || ZONES[item.zoneId] || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {item.selectedDriverName || (item.selectedDriverId ? item.selectedDriverId.slice(-8) : <span className="italic text-gray-400">—</span>)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[item.dispatchStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {item.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(item.updatedAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(item.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {item.orderId && <Link href={`/admin/orders/${item.orderId}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Voir</Link>}
                        {(item.dispatchStatus === 'searching' || item.dispatchStatus === 'queued') && (
                          <Link href={`/admin/dispatch/manual?dispatchId=${item.id}`} className="text-xs text-orange-600 hover:text-orange-800 font-medium">Assigner</Link>
                        )}
                      </div>
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
