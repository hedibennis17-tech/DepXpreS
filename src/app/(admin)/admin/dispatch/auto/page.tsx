'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DispatchEntry {
  id: string;
  orderId?: string;
  orderNumber?: string;
  selectedDriverId?: string;
  selectedDriverName?: string;
  zoneId?: string;
  zoneName?: string;
  storeName?: string;
  dispatchStatus: string;
  updatedAt?: string;
  expiresAt?: string;
  attemptCount?: number;
}

const STATUS_STYLES: Record<string, string> = {
  searching: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 border border-blue-200',
  completed: 'bg-green-100 text-green-800 border border-green-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
  queued: 'bg-orange-100 text-orange-800 border border-orange-200',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  searching: '🔍 Recherche',
  assigned: '✅ Assigné',
  completed: '🏁 Complété',
  failed: '❌ Échoué',
  queued: '⏳ En file',
  cancelled: '🚫 Annulé',
};

const ZONE_LABELS: Record<string, string> = {
  'zone-laval': 'Laval',
  'zone-laval-ouest': 'Laval Ouest',
  'zone-longueuil': 'Longueuil',
  'zone-mtl-centre': 'Montréal Centre-Ville',
  'zone-mtl-nord': 'Montréal Nord',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-CA', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return '—'; }
}

export default function DispatchAutoPage() {
  const [queue, setQueue] = useState<DispatchEntry[]>([]);
  const [metrics, setMetrics] = useState({ searching: 0, assigned: 0, completed: 0, failed: 0, total: 0, availableDrivers: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoEnabled, setAutoEnabled] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dispatch');
      const data = await res.json();
      const q: DispatchEntry[] = data.queue || [];
      setQueue(q);
      setMetrics({
        searching: q.filter(e => e.dispatchStatus === 'searching').length,
        assigned: q.filter(e => e.dispatchStatus === 'assigned').length,
        completed: q.filter(e => e.dispatchStatus === 'completed').length,
        failed: q.filter(e => e.dispatchStatus === 'failed').length,
        total: q.length,
        availableDrivers: data.availableDrivers?.length || data.metrics?.availableDrivers || 0,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur dispatch auto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = queue.filter(e => filter === 'all' || e.dispatchStatus === filter);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Assignation automatique</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${autoEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {autoEnabled ? '🤖 Auto activé' : '⏸ Auto désactivé'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Dernière MAJ : {lastUpdate.toLocaleTimeString('fr-CA')} · Auto 15s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoEnabled(!autoEnabled)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoEnabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoEnabled ? '⏸ Désactiver auto' : '▶ Activer auto'}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
          >
            ↻ Actualiser
          </button>
          <Link
            href="/admin/dispatch/live-map"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            🗺 Carte Live
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', val: metrics.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'En recherche', val: metrics.searching, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Assignés', val: metrics.assigned, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Complétés', val: metrics.completed, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Chauffeurs dispo', val: metrics.availableDrivers, color: 'text-orange-700', bg: 'bg-orange-50' },
        ].map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-gray-200 p-4 text-center`}>
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
            ) : (
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.val}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Algorithme auto */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-semibold text-blue-900 text-sm">Algorithme d&apos;assignation automatique</p>
            <p className="text-xs text-blue-700 mt-1">
              Le système analyse automatiquement chaque nouvelle commande et assigne le chauffeur optimal selon :
              la proximité GPS, la note (min 4.0), la zone de couverture, et la disponibilité en temps réel.
              Les commandes sans chauffeur après 5 min passent en assignation manuelle.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            File d&apos;assignation automatique
            <span className="ml-2 text-xs text-gray-400 font-normal">({filtered.length} entrée{filtered.length !== 1 ? 's' : ''})</span>
          </h2>
          <div className="flex gap-2 flex-wrap">
            {['all', 'searching', 'assigned', 'completed', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tous' : STATUS_LABELS[f]?.replace(/^[^\s]+\s/, '') || f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🤖</p>
            <p className="font-medium">Aucune entrée de dispatch automatique</p>
            <p className="text-sm mt-1">Les nouvelles commandes apparaîtront ici automatiquement</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commande', 'Dépanneur', 'Zone', 'Statut', 'Chauffeur assigné', 'Tentatives', 'Mis à jour', 'Expire', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {entry.orderId ? (
                        <Link
                          href={`/admin/orders/${entry.orderId}`}
                          className="font-mono text-xs text-orange-600 hover:text-orange-800 font-semibold"
                        >
                          {entry.orderNumber || `#${entry.orderId.slice(-8).toUpperCase()}`}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-gray-400">{entry.id.slice(-8).toUpperCase()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {entry.storeName || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {entry.zoneName || ZONE_LABELS[entry.zoneId || ''] || entry.zoneId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[entry.dispatchStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[entry.dispatchStatus] || entry.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.selectedDriverName ? (
                        <span className="text-xs text-gray-800 font-medium">{entry.selectedDriverName}</span>
                      ) : entry.selectedDriverId ? (
                        <span className="text-xs text-gray-500 font-mono">{entry.selectedDriverId.slice(-8)}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">En recherche...</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold ${(entry.attemptCount || 0) >= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                        {entry.attemptCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(entry.updatedAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(entry.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {entry.orderId && (
                          <Link
                            href={`/admin/orders/${entry.orderId}`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Voir
                          </Link>
                        )}
                        {(entry.dispatchStatus === 'searching' || entry.dispatchStatus === 'failed') && (
                          <Link
                            href={`/admin/dispatch/manual?dispatchId=${entry.id}`}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                          >
                            Manuel →
                          </Link>
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
