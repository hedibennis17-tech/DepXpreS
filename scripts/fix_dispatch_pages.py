#!/usr/bin/env python3
"""Fix all generic dispatch pages with proper UI and timestamp handling."""

import os

BASE = "/home/ubuntu/depxpres/src/app/(admin)/admin/dispatch"

def write_page(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"✅ Written: {path}")

# ─── dispatch/unassigned/page.tsx ───────────────────────────────────────────
unassigned_page = """'use client';
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
      .then(d => setItems((d.queue || []).filter((e: any) => e.dispatchStatus === 'searching' || e.dispatchStatus === 'queued' || e.dispatchStatus === 'failed')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes non assignées</h1>
          <p className="text-sm text-gray-500 mt-1">Commandes en attente d&apos;un chauffeur</p>
        </div>
        <Link href="/admin/dispatch/manual" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
          ✋ Assigner manuellement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Non assignées
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{items.length}</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">✅</p>
            <p className="font-medium">Toutes les commandes sont assignées</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Commande', 'Dépanneur', 'Zone', 'Statut', 'Depuis', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-600">
                      {item.orderNumber || `#${item.id?.slice(-8).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.storeName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{item.zoneName || ZONES[item.zoneId] || item.zoneId || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.dispatchStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.dispatchStatus === 'failed' ? '❌ Échoué' : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmt(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/dispatch/manual?dispatchId=${item.id}`} className="text-xs text-orange-600 hover:text-orange-800 font-medium">
                        Assigner →
                      </Link>
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
"""

# ─── dispatch/reassignments/page.tsx ────────────────────────────────────────
reassignments_page = """'use client';
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
"""

# ─── dispatch/history/page.tsx ───────────────────────────────────────────────
history_page = """'use client';
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
"""

# ─── dispatch/queue/page.tsx ─────────────────────────────────────────────────
queue_page = """'use client';
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
"""

# ─── dispatch/rules/page.tsx ─────────────────────────────────────────────────
rules_page = """'use client';
import { useState } from 'react';

interface Rule {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'number' | 'boolean' | 'select';
  options?: string[];
  unit?: string;
}

const DEFAULT_RULES: Rule[] = [
  { id: 'max_search_time', name: 'Temps max de recherche', description: 'Durée maximale avant passage en assignation manuelle', value: 5, type: 'number', unit: 'minutes' },
  { id: 'max_attempts', name: 'Tentatives max', description: 'Nombre max de tentatives d\'assignation automatique', value: 3, type: 'number', unit: 'tentatives' },
  { id: 'min_driver_rating', name: 'Note minimale chauffeur', description: 'Note minimale requise pour recevoir des commandes', value: 4.0, type: 'number', unit: '/ 5.0' },
  { id: 'radius_km', name: 'Rayon de recherche', description: 'Rayon de recherche des chauffeurs disponibles', value: 5, type: 'number', unit: 'km' },
  { id: 'auto_dispatch', name: 'Dispatch automatique', description: 'Activer l\'assignation automatique des commandes', value: true, type: 'boolean' },
  { id: 'priority_mode', name: 'Mode de priorité', description: 'Critère principal pour sélectionner le chauffeur', value: 'proximity', type: 'select', options: ['proximity', 'rating', 'deliveries', 'balanced'] },
  { id: 'notify_driver', name: 'Notifier le chauffeur', description: 'Envoyer une notification push lors d\'une assignation', value: true, type: 'boolean' },
  { id: 'fallback_manual', name: 'Fallback manuel', description: 'Passer en manuel si aucun chauffeur disponible', value: true, type: 'boolean' },
];

export default function Page() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [saved, setSaved] = useState(false);

  const updateRule = (id: string, value: string | number | boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, value } : r));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Règles de dispatch</h1>
          <p className="text-sm text-gray-500 mt-1">Configuration de l&apos;algorithme d&apos;assignation automatique</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>🤖 Algorithme actuel :</strong> Proximité GPS → Note chauffeur → Disponibilité zone → Nombre de livraisons du jour
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{rule.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {rule.type === 'boolean' ? (
                  <button
                    onClick={() => updateRule(rule.id, !rule.value)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${rule.value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                ) : rule.type === 'select' ? (
                  <select
                    value={String(rule.value)}
                    onChange={e => updateRule(rule.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  >
                    {rule.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={Number(rule.value)}
                      onChange={e => updateRule(rule.id, parseFloat(e.target.value))}
                      className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center"
                      step={rule.unit === '/ 5.0' ? 0.1 : 1}
                    />
                    {rule.unit && <span className="text-xs text-gray-500">{rule.unit}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

# Écrire toutes les pages
write_page(f"{BASE}/unassigned/page.tsx", unassigned_page)
write_page(f"{BASE}/reassignments/page.tsx", reassignments_page)
write_page(f"{BASE}/history/page.tsx", history_page)
write_page(f"{BASE}/queue/page.tsx", queue_page)
write_page(f"{BASE}/rules/page.tsx", rules_page)

print("\n✅ Toutes les pages dispatch reconstruites avec succès !")
