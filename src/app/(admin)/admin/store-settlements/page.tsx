'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Calculator,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Store,
} from 'lucide-react';
import type { StoreSettlement } from '@/lib/store-settlement/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: 'text-gray-600', bg: 'bg-gray-100' },
  calculated: { label: 'Calculé', color: 'text-blue-600', bg: 'bg-blue-100' },
  payment_initiated: { label: 'Paiement initié', color: 'text-orange-600', bg: 'bg-orange-100' },
  sent: { label: 'Envoyé', color: 'text-purple-600', bg: 'bg-purple-100' },
  awaiting_acceptance: { label: 'En attente acceptation', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  confirmed: { label: 'Confirmé', color: 'text-green-600', bg: 'bg-green-100' },
  failed: { label: 'Échoué', color: 'text-red-600', bg: 'bg-red-100' },
  cancelled: { label: 'Annulé', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function AdminStoreSettlementsPage() {
  const router = useRouter();
  const [settlements, setSettlements] = useState<StoreSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending_amount: 0,
    confirmed_amount: 0,
    failed_count: 0,
  });

  const loadSettlements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');

      const res = await fetch(`/api/admin/store-settlements?${params}`, {
        headers: { 'x-admin-session': 'admin' },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setSettlements(data.settlements || []);
        setStats({
          total: data.settlements?.length || 0,
          pending_amount: data.summary?.total_pending || 0,
          confirmed_amount: data.summary?.total_confirmed || 0,
          failed_count: data.settlements?.filter((s: StoreSettlement) => s.status === 'failed').length || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadSettlements();
  }, [loadSettlements]);

  const filtered = settlements.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.store_id?.toLowerCase().includes(q) ||
      s.order_id?.toLowerCase().includes(q) ||
      s.store_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements Stores</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des settlements et paiements aux stores partenaires</p>
        </div>
        <button
          onClick={loadSettlements}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total settlements</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">En attente</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.pending_amount.toFixed(2)} $</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Confirmés</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed_amount.toFixed(2)} $</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Échoués</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.failed_count}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par store, commande..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <DollarSign className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucun settlement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Commande</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Store</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ventes brutes</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Commission</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Net store</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Méthode</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const status = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600">{s.order_id?.slice(-8)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{s.store_name || s.store_id?.slice(-8)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{s.gross_sales_amount?.toFixed(2)} $</td>
                      <td className="px-4 py-3 text-red-600">- {s.platform_fee_amount?.toFixed(2)} $</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{s.net_store_amount?.toFixed(2)} $</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.method || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('fr-CA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/orders/${s.order_id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir commande
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
