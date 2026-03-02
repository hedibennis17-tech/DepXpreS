#!/usr/bin/env python3
"""
Script pour générer toutes les pages admin DepXpreS avec données Firebase réelles.
Chaque page est générée selon son contexte (module, sous-module, paramètres dynamiques).
"""
import os

BASE = '/home/ubuntu/depxpres/src/app/(admin)/admin'

def write_page(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"  ✅ {path.replace(BASE + '/', '')}")

# ============================================================
# TEMPLATE GÉNÉRIQUE pour pages de liste filtrées
# ============================================================
def list_page(title, description, api_endpoint, columns, status_field=None, status_options=None, badge_map=None):
    badge_code = ""
    if badge_map:
        badge_code = f"""
  const getBadge = (status: string) => {{
    const map: Record<string, string> = {str(badge_map).replace("'", '"')};
    return map[status] || 'bg-gray-100 text-gray-800';
  }};"""
    
    filter_code = ""
    if status_options:
        opts = "".join([f'<option value="{v}">{l}</option>' for v,l in status_options])
        filter_code = f"""
          <select value={{filter}} onChange={{e => setFilter(e.target.value)}} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            {opts}
          </select>"""
    
    cols_headers = "".join([f'<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{c}</th>' for c in columns])
    
    return f"""'use client';
import {{ useState, useEffect }} from 'react';

export default function Page() {{
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
{badge_code}

  useEffect(() => {{
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('{status_field or "status"}', filter);
    fetch(`{api_endpoint}${{params.toString() ? '?' + params.toString() : ''}}`).then(r => r.json()).then(d => {{
      setData(d.{api_endpoint.split('/')[-1].replace('-','_')} || d.orders || d.drivers || d.clients || d.stores || d.promotions || d.tickets || d.transactions || d.zones || d.payouts || d.reports || d.wallets || d.notifications || d.applications || d.logs || d.reviews || []);
      setMetrics(d.metrics || d.stats || null);
    }}).finally(() => setLoading(false));
  }}, [filter]);

  const filtered = data.filter(item => {{
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some(v => String(v).toLowerCase().includes(s));
  }});

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{{filtered.length}} résultat(s)</span>
      </div>

      {{metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {{Object.entries(metrics).map(([k, v]) => (
            <div key={{k}} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</p>
              <p className="text-2xl font-bold mt-1">{{typeof v === 'number' ? (k.includes('revenue') || k.includes('amount') || k.includes('total') ? `${{Number(v).toFixed(2)}} $` : v) : String(v)}}</p>
            </div>
          ))}}
        </div>
      )}}

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Rechercher..."
            value={{search}}
            onChange={{e => setSearch(e.target.value)}}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {filter_code}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {cols_headers}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {{filtered.length === 0 ? (
                <tr><td colSpan={{99}} className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</td></tr>
              ) : filtered.map((item, i) => (
                <tr key={{item.id || i}} className="hover:bg-muted/30 transition-colors">
                  {{Object.entries(item).slice(0, {len(columns)}).map(([k, v]) => (
                    <td key={{k}} className="px-4 py-3 text-sm">
                      {{typeof v === 'boolean' ? (v ? '✅' : '❌') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 50) : String(v ?? '-')}}
                    </td>
                  ))}}
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}}
"""

# ============================================================
# TEMPLATE pour pages de détail avec ID dynamique
# ============================================================
def detail_page(title, api_path, param_name, sections):
    sections_jsx = ""
    for section_title, fields in sections:
        fields_jsx = ""
        for field_key, field_label in fields:
            fields_jsx += f"""
              <div className="flex justify-between py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{field_label}</span>
                <span className="text-sm font-medium">{{String(item?.{field_key} ?? '-')}}</span>
              </div>"""
        sections_jsx += f"""
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4">{section_title}</h2>
          <div className="space-y-1">{fields_jsx}
          </div>
        </div>"""
    
    return f"""'use client';
import {{ useState, useEffect }} from 'react';
import {{ useParams }} from 'next/navigation';

export default function Page() {{
  const params = useParams();
  const id = params.{param_name} as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    if (!id) return;
    fetch(`{api_path}`).then(r => r.json()).then(d => {{
      setItem(d.{api_path.split('/')[-1].replace('-','_').replace('${{id}}','')} || d.order || d.driver || d.client || d.store || d.ticket || d.transaction || d.zone || d.promotion || d.application || d);
    }}).finally(() => setLoading(false));
  }}, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!item) return <div className="text-center py-8 text-muted-foreground">Élément introuvable.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">ID: {{id}}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections_jsx}
      </div>
    </div>
  );
}}
"""

# ============================================================
# PAGES ORDERS — sous-modules filtrés
# ============================================================
order_statuses = [
    ('orders/pending', 'Commandes en attente', 'pending', 'En attente'),
    ('orders/new', None, None, None),  # déjà fait
    ('orders/preparing', 'Commandes en préparation', 'preparing', 'En préparation'),
    ('orders/delivering', 'Commandes en livraison', 'delivering', 'En livraison'),
    ('orders/completed', 'Commandes terminées', 'completed', 'Terminées'),
    ('orders/cancelled', 'Commandes annulées', 'cancelled', 'Annulées'),
    ('orders/disputes', 'Litiges et contestations', 'disputed', 'Litiges'),
    ('orders/live', 'Commandes en temps réel', None, 'Live'),
]

for rel_path, title, status_val, label in order_statuses:
    if rel_path == 'orders/new':
        continue
    full_path = f"{BASE}/{rel_path}/page.tsx"
    api_url = f"/api/admin/orders{('?order_status=' + status_val) if status_val else ''}"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {{
  pending: 'bg-yellow-100 text-yellow-800',
  new: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  driver_assigned: 'bg-purple-100 text-purple-800',
  delivering: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-pink-100 text-pink-800',
}};

export default function Page() {{
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }}, []);

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
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{{filtered.length}} commande(s)</p>
        </div>
        <Link href="/admin/orders/new" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">+ Nouvelle commande</Link>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher par numéro, client, dépanneur..." value={{search}} onChange={{e => setSearch(e.target.value)}} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {{['Commande', 'Client', 'Dépanneur', 'Total', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={{h}} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{{h}}</th>
                ))}}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {{filtered.length === 0 ? (
                <tr><td colSpan={{7}} className="px-4 py-8 text-center text-muted-foreground">Aucune commande trouvée</td></tr>
              ) : filtered.map(order => (
                <tr key={{order.id}} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{{order.orderNumber}}</td>
                  <td className="px-4 py-3 text-sm">{{order.clientName}}</td>
                  <td className="px-4 py-3 text-sm">{{order.storeName}}</td>
                  <td className="px-4 py-3 text-sm font-medium">{{order.total?.toFixed(2)}} $</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={{`inline-flex px-2 py-1 rounded-full text-xs font-medium ${{STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800'}}`}}>
                      {{order.order_status?.replace(/_/g, ' ')}}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{{order.createdAt ? new Date(order.createdAt._seconds ? order.createdAt._seconds * 1000 : order.createdAt).toLocaleDateString('fr-CA') : '-'}}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={{`/admin/orders/${{order.id}}`}} className="text-orange-500 hover:text-orange-700 font-medium">Voir →</Link>
                  </td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

# ============================================================
# PAGES ORDERS — sous-pages d'une commande spécifique
# ============================================================

# Timeline
write_page(f"{BASE}/orders/[orderId]/timeline/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Commande reçue',
  confirmed: 'Commande confirmée',
  preparing: 'En préparation',
  driver_assigned: 'Chauffeur assigné',
  delivering: 'En livraison',
  completed: 'Livraison terminée',
  cancelled: 'Commande annulée',
};

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [history, setHistory] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${orderId}`).then(r => r.json()),
      fetch(`/api/admin/orders/${orderId}/history`).then(r => r.json()),
    ]).then(([orderData, histData]) => {
      setOrder(orderData.order);
      setHistory(histData.history || []);
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline de la commande</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — {order?.clientName}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
          <div className="space-y-6">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm pl-10">Aucun historique disponible.</p>
            ) : history.map((h, i) => (
              <div key={h.id || i} className="relative flex items-start gap-4 pl-10">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-background -translate-x-1/2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{STATUS_LABELS[h.status] || h.status?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{h.createdAt ? new Date(h.createdAt._seconds ? h.createdAt._seconds * 1000 : h.createdAt).toLocaleString('fr-CA') : '-'}</p>
                  </div>
                  {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                  {h.actorName && <p className="text-xs text-muted-foreground">Par: {h.actorName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
""")

# Tracking
write_page(f"{BASE}/orders/[orderId]/tracking/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [tracking, setTracking] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${orderId}`).then(r => r.json()),
      fetch(`/api/admin/orders/${orderId}/tracking`).then(r => r.json()),
    ]).then(([orderData, trackData]) => {
      setOrder(orderData.order);
      setTracking(trackData.tracking);
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suivi GPS en temps réel</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — Chauffeur: {order?.driverName || 'Non assigné'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Position du chauffeur</h2>
          {tracking ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Latitude</span><span className="font-mono">{tracking.currentLat?.toFixed(6)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Longitude</span><span className="font-mono">{tracking.currentLng?.toFixed(6)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vitesse</span><span>{tracking.speed || 0} km/h</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">ETA</span><span className="font-medium text-orange-500">{tracking.estimatedArrival || '~15 min'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Distance restante</span><span>{tracking.remainingDistance || '~2.3 km'}</span></div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune session de tracking active pour cette commande.</p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Carte</h2>
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm">Carte Google Maps</p>
              <p className="text-xs mt-1">Lat: {tracking?.currentLat?.toFixed(4) || '45.5017'}, Lng: {tracking?.currentLng?.toFixed(4) || '-73.5673'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
""")

# Messages
write_page(f"{BASE}/orders/[orderId]/messages/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = () => {
    fetch(`/api/admin/orders/${orderId}/messages`).then(r => r.json()).then(d => setMessages(d.messages || [])).finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, [orderId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    await fetch(`/api/admin/orders/${orderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMsg, senderType: 'admin', senderName: 'Admin' }),
    });
    setNewMsg('');
    loadMessages();
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages de la commande</h1>
        <p className="text-muted-foreground mt-1">Conversation client ↔ chauffeur ↔ admin</p>
      </div>
      <div className="rounded-xl border bg-card flex flex-col" style={{height: '500px'}}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun message pour cette commande.</p>
          ) : messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${msg.senderType === 'admin' ? 'bg-orange-500 text-white' : msg.senderType === 'driver' ? 'bg-blue-100 text-blue-900' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">{msg.createdAt ? new Date(msg.createdAt._seconds ? msg.createdAt._seconds * 1000 : msg.createdAt).toLocaleTimeString('fr-CA') : ''}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Écrire un message admin..." className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={sendMessage} disabled={sending} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
""")

# Payment
write_page(f"{BASE}/orders/[orderId]/payment/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [payment, setPayment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`).then(r => r.json()).then(d => {
      setOrder(d.order);
      if (d.order?.paymentId) {
        fetch(`/api/admin/transactions/${d.order.paymentId}`).then(r => r.json()).then(td => setPayment(td.transaction));
      }
    }).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paiement de la commande</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Détails financiers</h2>
        <div className="space-y-2">
          {[
            ['Sous-total', `${order?.subtotal?.toFixed(2)} $`],
            ['Frais de livraison', `${order?.deliveryFee?.toFixed(2)} $`],
            ['Taxes (TPS+TVQ)', `${order?.taxes?.toFixed(2)} $`],
            ['Remise promo', order?.discount ? `-${order.discount.toFixed(2)} $` : '-'],
            ['Total', `${order?.total?.toFixed(2)} $`],
          ].map(([label, value]) => (
            <div key={label} className={`flex justify-between py-2 ${label === 'Total' ? 'border-t font-bold text-base' : 'text-sm border-b last:border-0'}`}>
              <span className={label === 'Total' ? '' : 'text-muted-foreground'}>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Informations de paiement</h2>
        {payment ? (
          <div className="space-y-2">
            {[
              ['ID Transaction', payment.id],
              ['Méthode', payment.paymentMethod],
              ['Statut', payment.paymentStatus],
              ['Montant', `${payment.amount?.toFixed(2)} $`],
              ['Date', payment.createdAt ? new Date(payment.createdAt._seconds ? payment.createdAt._seconds * 1000 : payment.createdAt).toLocaleString('fr-CA') : '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              ['Méthode', order?.paymentMethod || 'Carte de crédit'],
              ['Statut paiement', order?.paymentStatus || 'paid'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
""")

# Refund
write_page(f"{BASE}/orders/[orderId]/refund/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`).then(r => r.json()).then(d => {
      setOrder(d.order);
      setAmount(d.order?.total?.toFixed(2) || '');
    }).finally(() => setLoading(false));
  }, [orderId]);

  const handleRefund = async () => {
    if (!amount || !reason) { alert('Veuillez remplir tous les champs'); return; }
    setSubmitting(true);
    const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), reason }),
    });
    const data = await res.json();
    if (data.success) { setSuccess(true); setTimeout(() => router.push(`/admin/orders/${orderId}`), 2000); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Remboursement</h1>
        <p className="text-muted-foreground mt-1">{order?.orderNumber} — Total: {order?.total?.toFixed(2)} $</p>
      </div>
      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold text-green-800">Remboursement effectué avec succès!</p>
          <p className="text-sm text-green-600 mt-1">Redirection en cours...</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Montant à rembourser ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={order?.total} step="0.01" className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Raison du remboursement</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="">Sélectionner une raison...</option>
              <option value="order_cancelled">Commande annulée</option>
              <option value="items_missing">Articles manquants</option>
              <option value="wrong_items">Articles incorrects</option>
              <option value="late_delivery">Livraison trop tardive</option>
              <option value="quality_issue">Problème de qualité</option>
              <option value="customer_request">Demande du client</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleRefund} disabled={submitting} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">
              {submitting ? 'Traitement...' : 'Confirmer le remboursement'}
            </button>
            <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg font-medium hover:bg-muted">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
""")

print("\n✅ Pages Orders sous-modules créées")

# ============================================================
# PAGES DRIVERS — liste filtrées
# ============================================================
driver_pages = [
    ('drivers/online', 'Chauffeurs en ligne', 'online'),
    ('drivers/offline', 'Chauffeurs hors ligne', 'offline'),
    ('drivers/active', 'Chauffeurs actifs', 'active'),
    ('drivers/applications', 'Candidatures chauffeurs', None),
    ('drivers/documents', 'Documents chauffeurs', None),
    ('drivers/earnings', 'Gains des chauffeurs', None),
    ('drivers/expired-docs', 'Documents expirés', None),
    ('drivers/payouts', 'Paiements chauffeurs', None),
    ('drivers/vehicles', 'Véhicules des chauffeurs', None),
]

for rel_path, title, status_val in driver_pages:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    if status_val:
        api_url = f"/api/admin/drivers?driver_status={status_val}"
    elif 'applications' in rel_path:
        api_url = "/api/admin/driver-applications"
    elif 'payouts' in rel_path:
        api_url = "/api/admin/payouts"
    else:
        api_url = "/api/admin/drivers"
    
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => {{
      setDrivers(d.drivers || d.applications || d.payouts || []);
    }}).finally(() => setLoading(false));
  }}, []);

  const filtered = drivers.filter(d => !search || 
    (d.full_name || d.fullName || d.driverName || '')?.toLowerCase().includes(search.toLowerCase()) ||
    (d.phone || d.email || '')?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{{filtered.length}} résultat(s)</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher..." value={{search}} onChange={{e => setSearch(e.target.value)}} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {{['Nom', 'Téléphone', 'Statut', 'Zone', 'Note', 'Livraisons', 'Actions'].map(h => (
                  <th key={{h}} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{{h}}</th>
                ))}}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {{filtered.length === 0 ? (
                <tr><td colSpan={{7}} className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</td></tr>
              ) : filtered.map(driver => (
                <tr key={{driver.id}} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{{driver.full_name || driver.fullName || driver.driverName || '-'}}</td>
                  <td className="px-4 py-3 text-sm">{{driver.phone || '-'}}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={{`inline-flex px-2 py-1 rounded-full text-xs font-medium ${{driver.driver_status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}}`}}>
                      {{driver.driver_status || driver.applicationStatus || '-'}}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{{driver.current_zone_id || '-'}}</td>
                  <td className="px-4 py-3 text-sm">{{driver.rating_average?.toFixed(1) || '-'}} ⭐</td>
                  <td className="px-4 py-3 text-sm">{{driver.total_deliveries || 0}}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={{`/admin/drivers/${{driver.id}}`}} className="text-orange-500 hover:text-orange-700 font-medium">Voir →</Link>
                  </td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

# ============================================================
# PAGES DRIVERS — sous-pages d'un chauffeur spécifique
# ============================================================
driver_sub_pages = [
    ('drivers/[driverId]/page.tsx', 'Profil du chauffeur', '/api/admin/drivers/${driverId}', 'driver'),
    ('drivers/[driverId]/orders/page.tsx', 'Commandes du chauffeur', '/api/admin/drivers/${driverId}/orders', 'orders'),
    ('drivers/[driverId]/earnings/page.tsx', 'Gains du chauffeur', '/api/admin/drivers/${driverId}/earnings', 'earnings'),
    ('drivers/[driverId]/payouts/page.tsx', 'Paiements du chauffeur', '/api/admin/drivers/${driverId}/payouts', 'payouts'),
    ('drivers/[driverId]/reviews/page.tsx', 'Avis sur le chauffeur', '/api/admin/drivers/${driverId}/reviews', 'reviews'),
    ('drivers/[driverId]/wallet/page.tsx', 'Portefeuille du chauffeur', '/api/admin/drivers/${driverId}/wallet', 'wallet'),
    ('drivers/[driverId]/documents/page.tsx', 'Documents du chauffeur', '/api/admin/drivers/${driverId}/documents', 'documents'),
    ('drivers/[driverId]/vehicle/page.tsx', 'Véhicule du chauffeur', '/api/admin/drivers/${driverId}/vehicle', 'vehicle'),
    ('drivers/[driverId]/incidents/page.tsx', 'Incidents du chauffeur', '/api/admin/drivers/${driverId}', 'driver'),
    ('drivers/[driverId]/application/page.tsx', 'Candidature du chauffeur', '/api/admin/drivers/${driverId}', 'driver'),
]

for rel_path, title, api_path, data_key in driver_sub_pages:
    full_path = f"{BASE}/{rel_path}"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import {{ useParams }} from 'next/navigation';

export default function Page() {{
  const {{ driverId }} = useParams() as {{ driverId: string }};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    if (!driverId) return;
    fetch(`{api_path.replace('${driverId}', '${{driverId}}')}`)
      .then(r => r.json())
      .then(d => setData(d.{data_key} || d.driver || d))
      .finally(() => setLoading(false));
  }}, [driverId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Chauffeur ID: {{driverId}}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {{Array.isArray(data) ? (
          <div className="space-y-3">
            {{data.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
            ) : data.map((item: any, i: number) => (
              <div key={{item.id || i}} className="p-4 rounded-lg border bg-muted/20">
                {{Object.entries(item).slice(0, 6).map(([k, v]) => (
                  <div key={{k}} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                    <span className="font-medium">{{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
                  </div>
                ))}}
              </div>
            ))}}
          </div>
        ) : data ? (
          <div className="space-y-2">
            {{Object.entries(data).slice(0, 15).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 50) : String(v ?? '-')}}</span>
              </div>
            ))}}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
        )}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Drivers créées")

# ============================================================
# PAGES CLIENTS — sous-modules
# ============================================================
client_sub_pages = [
    ('clients/[clientId]/page.tsx', 'Profil du client', '/api/admin/clients/${clientId}', 'client'),
    ('clients/[clientId]/orders/page.tsx', 'Commandes du client', '/api/admin/clients/${clientId}/orders', 'orders'),
    ('clients/[clientId]/payments/page.tsx', 'Paiements du client', '/api/admin/clients/${clientId}/payments', 'payments'),
    ('clients/[clientId]/addresses/page.tsx', 'Adresses du client', '/api/admin/clients/${clientId}/addresses', 'addresses'),
    ('clients/[clientId]/wallet/page.tsx', 'Portefeuille du client', '/api/admin/clients/${clientId}/wallet', 'wallet'),
    ('clients/[clientId]/support/page.tsx', 'Tickets support du client', '/api/admin/clients/${clientId}/support', 'tickets'),
    ('clients/[clientId]/promotions/page.tsx', 'Promotions du client', '/api/admin/clients/${clientId}/promotions', 'promotions'),
    ('clients/[clientId]/messages/page.tsx', 'Messages du client', '/api/admin/clients/${clientId}', 'client'),
]

for rel_path, title, api_path, data_key in client_sub_pages:
    full_path = f"{BASE}/{rel_path}"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import {{ useParams }} from 'next/navigation';

export default function Page() {{
  const {{ clientId }} = useParams() as {{ clientId: string }};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    if (!clientId) return;
    fetch(`{api_path.replace('${clientId}', '${{clientId}}')}`)
      .then(r => r.json())
      .then(d => setData(d.{data_key} || d.client || d))
      .finally(() => setLoading(false));
  }}, [clientId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Client ID: {{clientId}}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {{Array.isArray(data) ? (
          <div className="space-y-3">
            {{data.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
            ) : data.map((item: any, i: number) => (
              <div key={{item.id || i}} className="p-4 rounded-lg border bg-muted/20">
                {{Object.entries(item).slice(0, 6).map(([k, v]) => (
                  <div key={{k}} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                    <span className="font-medium">{{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
                  </div>
                ))}}
              </div>
            ))}}
          </div>
        ) : data ? (
          <div className="space-y-2">
            {{Object.entries(data).slice(0, 15).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 50) : String(v ?? '-')}}</span>
              </div>
            ))}}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
        )}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

# Clients liste filtrée
for rel_path, title, status_val in [
    ('clients/active', 'Clients actifs', 'active'),
    ('clients/blocked', 'Clients bloqués', 'blocked'),
    ('clients/notes', 'Notes clients', None),
    ('clients/wallets', 'Portefeuilles clients', None),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    api_url = f"/api/admin/clients{('?status=' + status_val) if status_val else ''}"
    if 'wallets' in rel_path:
        api_url = "/api/admin/wallets?ownerType=client"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setItems(d.clients || d.wallets || [])).finally(() => setLoading(false));
  }}, []);

  const filtered = items.filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{{filtered.length}} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher..." value={{search}} onChange={{e => setSearch(e.target.value)}} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="divide-y divide-border">
          {{filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
          ) : filtered.map((item, i) => (
            <div key={{item.id || i}} className="flex items-center justify-between p-4 hover:bg-muted/30">
              <div>
                <p className="font-medium text-sm">{{item.fullName || item.ownerName || item.id}}</p>
                <p className="text-xs text-muted-foreground">{{item.email || item.phone || item.ownerType || ''}}</p>
              </div>
              <div className="flex items-center gap-3">
                {{item.balance !== undefined && <span className="text-sm font-medium">{{item.balance?.toFixed(2)}} $</span>}}
                <Link href={{`/admin/clients/${{item.id}}`}} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Voir →</Link>
              </div>
            </div>
          ))}}
        </div>
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Clients créées")

# ============================================================
# PAGES STORES — sous-modules
# ============================================================
store_sub_pages = [
    ('stores/[storeId]/page.tsx', 'Profil du dépanneur', '/api/admin/stores/${storeId}', 'store'),
    ('stores/[storeId]/orders/page.tsx', 'Commandes du dépanneur', '/api/admin/stores/${storeId}/orders', 'orders'),
    ('stores/[storeId]/products/page.tsx', 'Produits du dépanneur', '/api/admin/stores/${storeId}/products', 'products'),
    ('stores/[storeId]/performance/page.tsx', 'Performance du dépanneur', '/api/admin/stores/${storeId}/performance', 'performance'),
    ('stores/[storeId]/catalog/page.tsx', 'Catalogue du dépanneur', '/api/admin/stores/${storeId}/products', 'products'),
    ('stores/[storeId]/stock/page.tsx', 'Stock du dépanneur', '/api/admin/stores/${storeId}/products', 'products'),
    ('stores/[storeId]/pricing/page.tsx', 'Tarification du dépanneur', '/api/admin/stores/${storeId}/products', 'products'),
    ('stores/[storeId]/schedule/page.tsx', 'Horaires du dépanneur', '/api/admin/stores/${storeId}', 'store'),
    ('stores/[storeId]/staff/page.tsx', 'Personnel du dépanneur', '/api/admin/stores/${storeId}', 'store'),
]

for rel_path, title, api_path, data_key in store_sub_pages:
    full_path = f"{BASE}/{rel_path}"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import {{ useParams }} from 'next/navigation';

export default function Page() {{
  const {{ storeId }} = useParams() as {{ storeId: string }};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    if (!storeId) return;
    fetch(`{api_path.replace('${storeId}', '${{storeId}}')}`)
      .then(r => r.json())
      .then(d => setData(d.{data_key} || d.store || d))
      .finally(() => setLoading(false));
  }}, [storeId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Dépanneur ID: {{storeId}}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {{Array.isArray(data) ? (
          <div className="space-y-3">
            {{data.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
            ) : data.map((item: any, i: number) => (
              <div key={{item.id || i}} className="p-4 rounded-lg border bg-muted/20">
                {{Object.entries(item).slice(0, 8).map(([k, v]) => (
                  <div key={{k}} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                    <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
                  </div>
                ))}}
              </div>
            ))}}
          </div>
        ) : data ? (
          <div className="space-y-2">
            {{Object.entries(data).slice(0, 15).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 50) : String(v ?? '-')}}</span>
              </div>
            ))}}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
        )}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

# Stores listes filtrées
for rel_path, title, api_url in [
    ('stores/active', 'Dépanneurs actifs', '/api/admin/stores?status=active'),
    ('stores/inactive', 'Dépanneurs inactifs', '/api/admin/stores?status=inactive'),
    ('stores/performance', 'Performance des dépanneurs', '/api/admin/stores'),
    ('stores/pricing', 'Tarification des dépanneurs', '/api/admin/stores'),
    ('stores/schedules', 'Horaires des dépanneurs', '/api/admin/stores'),
    ('stores/stock', 'Stock global', '/api/admin/products'),
    ('stores/catalog/page', 'Catalogue global', '/api/admin/products'),
    ('stores/catalog/products', 'Tous les produits', '/api/admin/products'),
    ('stores/catalog/categories', 'Catégories', '/api/admin/categories'),
    ('stores/catalog/subcategories', 'Sous-catégories', '/api/admin/categories'),
    ('stores/catalog/bundles', 'Bundles & offres', '/api/admin/promotions'),
    ('stores/catalog/restricted', 'Produits restreints (18+)', '/api/admin/products?restricted=true'),
    ('stores/catalog/variants', 'Variantes de produits', '/api/admin/products'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx" if not rel_path.endswith('page') else f"{BASE}/{rel_path}.tsx"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => {{
      setItems(d.stores || d.products || d.categories || d.promotions || []);
    }}).finally(() => setLoading(false));
  }}, []);

  const filtered = items.filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{{filtered.length}} résultat(s)</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher..." value={{search}} onChange={{e => setSearch(e.target.value)}} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="divide-y divide-border">
          {{filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
          ) : filtered.map((item, i) => (
            <div key={{item.id || i}} className="flex items-center justify-between p-4 hover:bg-muted/30">
              <div>
                <p className="font-medium text-sm">{{item.name || item.storeName || item.id}}</p>
                <p className="text-xs text-muted-foreground">{{item.address || item.categoryName || item.description || ''}}</p>
              </div>
              <div className="flex items-center gap-3">
                {{item.price !== undefined && <span className="text-sm font-medium">{{item.price?.toFixed(2)}} $</span>}}
                {{item.status && <span className={{`inline-flex px-2 py-1 rounded-full text-xs font-medium ${{item.status === 'active' || item.is_open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}}`}}>{{item.status}}</span>}}
                <Link href={{`/admin/stores/${{item.id}}`}} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Voir →</Link>
              </div>
            </div>
          ))}}
        </div>
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Stores créées")

# ============================================================
# PAGES DISPATCH
# ============================================================
write_page(f"{BASE}/dispatch/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function Page() {
  const [data, setData] = useState<any>({ queue: [], events: [], availableDrivers: [], metrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => fetch('/api/admin/dispatch').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const { queue, events, availableDrivers, metrics } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de Dispatch</h1>
          <p className="text-muted-foreground mt-1">Gestion des assignations de chauffeurs en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/dispatch/queue" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">File d&apos;attente</Link>
          <Link href="/admin/dispatch/manual" className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted">Dispatch manuel</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'En file', value: metrics.queued || 0, color: 'text-yellow-600' },
          { label: 'Assignées', value: metrics.assigned || 0, color: 'text-blue-600' },
          { label: 'Complétées', value: metrics.completed || 0, color: 'text-green-600' },
          { label: 'Chauffeurs dispo', value: metrics.availableDrivers || 0, color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">File de dispatch</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Actualisation auto 15s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {['Commande', 'Dépanneur', 'Zone', 'Statut', 'Chauffeur', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">File de dispatch vide</td></tr>
                ) : queue.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{item.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{item.storeName}</td>
                    <td className="px-4 py-3 text-sm">{item.zoneName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.dispatchStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {item.dispatchStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.selectedDriverName || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.dispatchStatus === 'queued' && (
                        <Link href={`/admin/dispatch/manual?dispatchId=${item.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Assigner →</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Chauffeurs disponibles ({availableDrivers.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {availableDrivers.length === 0 ? (
              <p className="px-4 py-6 text-center text-muted-foreground text-sm">Aucun chauffeur disponible</p>
            ) : availableDrivers.slice(0, 8).map((driver: any) => (
              <div key={driver.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{driver.full_name || driver.fullName}</p>
                  <p className="text-xs text-muted-foreground">{driver.current_zone_id} • {driver.rating_average?.toFixed(1) || '4.5'} ⭐</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
""")

# Dispatch queue
write_page(f"{BASE}/dispatch/queue/page.tsx", """'use client';
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
""")

# Dispatch manual
write_page(f"{BASE}/dispatch/manual/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ManualDispatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatchId = searchParams.get('dispatchId') || '';
  const [candidates, setCandidates] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState(dispatchId);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/dispatch?status=queued').then(r => r.json()).then(d => setQueue(d.queue || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedDispatch) {
      fetch(`/api/admin/dispatch/${selectedDispatch}/candidates`).then(r => r.json()).then(d => setCandidates(d.candidates || []));
    }
  }, [selectedDispatch]);

  const assign = async (driverId: string) => {
    if (!selectedDispatch) return;
    setAssigning(driverId);
    const res = await fetch(`/api/admin/dispatch/${selectedDispatch}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ ${data.message}`);
      router.push('/admin/dispatch');
    }
    setAssigning(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispatch Manuel</h1>
        <p className="text-muted-foreground mt-1">Assigner manuellement un chauffeur à une commande</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Sélectionner une commande</h2>
          <select value={selectedDispatch} onChange={e => setSelectedDispatch(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Choisir une commande...</option>
            {queue.map((d: any) => <option key={d.id} value={d.id}>{d.orderNumber} — {d.storeName} ({d.zoneName})</option>)}
          </select>
          {selectedDispatch && queue.find((d: any) => d.id === selectedDispatch) && (() => {
            const d = queue.find((q: any) => q.id === selectedDispatch);
            return (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium">{d.orderNumber}</p>
                <p className="text-xs text-muted-foreground">Dépanneur: {d.storeName}</p>
                <p className="text-xs text-muted-foreground">Zone: {d.zoneName}</p>
              </div>
            );
          })()}
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Chauffeurs disponibles ({candidates.length})</h2>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-sm">{selectedDispatch ? 'Aucun chauffeur disponible pour cette zone.' : 'Sélectionnez une commande pour voir les chauffeurs.'}</p>
          ) : (
            <div className="space-y-3">
              {candidates.map((driver: any) => (
                <div key={driver.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.rating?.toFixed(1)} ⭐ • {driver.deliveriesToday} livraisons aujourd&apos;hui</p>
                  </div>
                  <button
                    onClick={() => assign(driver.id)}
                    disabled={assigning === driver.id}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    {assigning === driver.id ? '...' : 'Assigner'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}><ManualDispatchContent /></Suspense>;
}
""")

# Dispatch autres pages
for rel_path, title, api_url in [
    ('dispatch/history', 'Historique du dispatch', '/api/admin/dispatch'),
    ('dispatch/reassignments', 'Réassignations', '/api/admin/dispatch?status=reassigned'),
    ('dispatch/unassigned', 'Commandes non assignées', '/api/admin/dispatch?status=queued'),
    ('dispatch/auto', 'Dispatch automatique', '/api/admin/dispatch'),
    ('dispatch/rules', 'Règles de dispatch', '/api/admin/settings'),
    ('dispatch/live-map', 'Carte en direct', '/api/admin/dispatch'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';

export default function Page() {{
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Données Firebase en temps réel</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {{data ? (
          <div className="space-y-3">
            {{(data.queue || data.events || []).slice(0, 10).map((item: any, i: number) => (
              <div key={{item.id || i}} className="p-4 rounded-lg border bg-muted/20">
                {{Object.entries(item).slice(0, 6).map(([k, v]) => (
                  <div key={{k}} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                    <span className="font-medium">{{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
                  </div>
                ))}}
              </div>
            ))}}
            {{(data.queue || data.events || []).length === 0 && <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>}}
          </div>
        ) : <p className="text-muted-foreground text-sm">Chargement des données...</p>}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Dispatch créées")

# ============================================================
# PAGES ZONES
# ============================================================
write_page(f"{BASE}/zones/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/zones').then(r => r.json()).then(d => setZones(d.zones || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zones de livraison</h1>
        <p className="text-muted-foreground mt-1">{zones.length} zone(s) configurée(s)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">{zone.name}</h2>
                <p className="text-sm text-muted-foreground">{zone.city}, {zone.province}</p>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{zone.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Commandes', value: zone.ordersCount || 0 },
                { label: 'Chauffeurs', value: zone.driversCount || 0 },
                { label: 'Dépanneurs', value: zone.storesCount || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/zones/${zone.id}`} className="flex-1 text-center py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Gérer</Link>
              <Link href={`/admin/zones/${zone.id}/map`} className="flex-1 text-center py-2 border rounded-lg text-sm font-medium hover:bg-muted">Carte</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
""")

# Zone detail pages
for rel_path, title, api_suffix in [
    ('zones/[zoneId]/page', 'Détail de la zone', ''),
    ('zones/[zoneId]/drivers', 'Chauffeurs de la zone', ''),
    ('zones/[zoneId]/stores', 'Dépanneurs de la zone', ''),
    ('zones/[zoneId]/orders', 'Commandes de la zone', ''),
    ('zones/[zoneId]/map', 'Carte de la zone', ''),
    ('zones/[zoneId]/pricing', 'Tarification de la zone', ''),
    ('zones/[zoneId]/stats', 'Statistiques de la zone', ''),
]:
    full_path = f"{BASE}/{rel_path}.tsx" if rel_path.endswith('page') else f"{BASE}/{rel_path}/page.tsx"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import {{ useParams }} from 'next/navigation';

export default function Page() {{
  const {{ zoneId }} = useParams() as {{ zoneId: string }};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    if (!zoneId) return;
    fetch(`/api/admin/zones/${{zoneId}}`).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }}, [zoneId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">Zone: {{data?.zone?.name || zoneId}}</p>
      </div>
      {{data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Informations</h2>
            {{Object.entries(data.zone || {{}}).slice(0, 10).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-medium">{{typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
              </div>
            ))}}
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Statistiques</h2>
            {{Object.entries(data.stats || {{}}).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-bold">{{String(v)}}</span>
              </div>
            ))}}
          </div>
        </div>
      )}}
    </div>
  );
}}
"""
    write_page(full_path, content)

# Zones listes
for rel_path, title, api_url in [
    ('zones/active', 'Zones actives', '/api/admin/zones?status=active'),
    ('zones/inactive', 'Zones inactives', '/api/admin/zones?status=inactive'),
    ('zones/coverage', 'Couverture des zones', '/api/admin/zones'),
    ('zones/drivers', 'Chauffeurs par zone', '/api/admin/drivers'),
    ('zones/stores', 'Dépanneurs par zone', '/api/admin/stores'),
    ('zones/pricing', 'Tarification par zone', '/api/admin/zones'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setItems(d.zones || d.drivers || d.stores || [])).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{{items.length}} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {{items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
        ) : items.map((item, i) => (
          <div key={{item.id || i}} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-medium text-sm">{{item.name || item.full_name || item.fullName || item.id}}</p>
              <p className="text-xs text-muted-foreground">{{item.city || item.phone || item.address || ''}}</p>
            </div>
            <Link href={{`/admin/zones/${{item.id}}`}} className="text-orange-500 hover:text-orange-700 text-sm font-medium">Voir →</Link>
          </div>
        ))}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Zones créées")

# ============================================================
# PAGES TRANSACTIONS
# ============================================================
write_page(f"{BASE}/transactions/page.tsx", """'use client';
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
""")

for rel_path, title, api_url in [
    ('transactions/payments', 'Paiements clients', '/api/admin/transactions?type=payment'),
    ('transactions/payouts', 'Versements chauffeurs', '/api/admin/payouts'),
    ('transactions/refunds', 'Remboursements', '/api/admin/transactions?type=payment&status=refunded'),
    ('transactions/wallets', 'Portefeuilles', '/api/admin/wallets'),
    ('transactions/disputes', 'Litiges financiers', '/api/admin/support?category=payment_issue'),
    ('transactions/fees', 'Frais de service', '/api/admin/transactions'),
    ('transactions/[transactionId]', 'Détail transaction', '/api/admin/transactions/${transactionId}'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    if '[transactionId]' in rel_path:
        content = """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { transactionId } = useParams() as { transactionId: string };
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    fetch(`/api/admin/transactions/${transactionId}`).then(r => r.json()).then(d => setTx(d.transaction)).finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!tx) return <div className="text-center py-8 text-muted-foreground">Transaction introuvable.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Détail de la transaction</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">{transactionId}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-2">
        {Object.entries(tx).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-medium">{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '-')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
    else:
        content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setItems(d.transactions || d.payouts || d.wallets || d.tickets || [])).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{{items.length}} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {{items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</p>
        ) : items.slice(0, 20).map((item, i) => (
          <div key={{item.id || i}} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-medium text-sm">{{item.id?.slice(0, 16)}}...</p>
              <p className="text-xs text-muted-foreground">{{item.paymentMethod || item.method || item.ownerType || ''}} • {{item.paymentStatus || item.status || ''}}</p>
            </div>
            <div className="flex items-center gap-3">
              {{item.amount !== undefined && <span className="font-bold text-sm">{{item.amount?.toFixed(2)}} $</span>}}
              {{item.balance !== undefined && <span className="font-bold text-sm">{{item.balance?.toFixed(2)}} $</span>}}
              <Link href={{`/admin/transactions/${{item.id}}`}} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
            </div>
          </div>
        ))}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Transactions créées")

# ============================================================
# PAGES PROMOTIONS
# ============================================================
write_page(f"{BASE}/promotions/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    fetch(`/api/admin/promotions${params}`).then(r => r.json()).then(d => setPromos(d.promotions || [])).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions & Codes promo</h1>
          <p className="text-muted-foreground mt-1">{promos.length} promotion(s)</p>
        </div>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">+ Créer une promo</button>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
            <option value="expired">Expirées</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Code', 'Type', 'Valeur', 'Statut', 'Utilisations', 'Expiration', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promos.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucune promotion trouvée</td></tr>
              ) : promos.map(promo => (
                <tr key={promo.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-mono font-medium">{promo.code}</td>
                  <td className="px-4 py-3 text-sm">{promo.discountType}</td>
                  <td className="px-4 py-3 text-sm font-medium">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue?.toFixed(2)} $`}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{promo.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{promo.usageCount || 0}/{promo.maxUsage || '∞'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{promo.expiresAt ? new Date(promo.expiresAt._seconds ? promo.expiresAt._seconds * 1000 : promo.expiresAt).toLocaleDateString('fr-CA') : 'Sans expiration'}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/promotions/${promo.id}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Modifier →</Link>
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
""")

for rel_path, title, api_url in [
    ('promotions/coupons', 'Codes de réduction', '/api/admin/promotions?type=coupon'),
    ('promotions/campaigns', 'Campagnes promotionnelles', '/api/admin/promotions'),
    ('promotions/referrals', 'Programme de parrainage', '/api/admin/promotions?type=referral'),
    ('promotions/usage', 'Utilisation des promotions', '/api/admin/promotions'),
    ('promotions/store-promos', 'Promotions dépanneurs', '/api/admin/promotions?type=store'),
    ('promotions/product-promos', 'Promotions produits', '/api/admin/promotions?type=product'),
    ('promotions/zone-discounts', 'Réductions par zone', '/api/admin/promotions?type=zone'),
    ('promotions/[promotionId]', 'Détail promotion', '/api/admin/promotions/${promotionId}'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    if '[promotionId]' in rel_path:
        content = """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { promotionId } = useParams() as { promotionId: string };
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!promotionId) return;
    fetch(`/api/admin/promotions/${promotionId}`).then(r => r.json()).then(d => setPromo(d.promotion)).finally(() => setLoading(false));
  }, [promotionId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (!promo) return <div className="text-center py-8 text-muted-foreground">Promotion introuvable.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promotion: {promo.code}</h1>
        <p className="text-muted-foreground mt-1">{promo.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-2">
        {Object.entries(promo).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-medium">{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '-')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
    else:
        content = f"""'use client';
import {{ useState, useEffect }} from 'react';
import Link from 'next/link';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setItems(d.promotions || [])).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{{items.length}} résultat(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {{items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucune promotion trouvée</p>
        ) : items.map((item, i) => (
          <div key={{item.id || i}} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <p className="font-mono font-medium text-sm">{{item.code}}</p>
              <p className="text-xs text-muted-foreground">{{item.description}} • {{item.discountType}} {{item.discountValue}}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={{`inline-flex px-2 py-1 rounded-full text-xs font-medium ${{item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}}`}}>{{item.status}}</span>
              <Link href={{`/admin/promotions/${{item.id}}`}} className="text-orange-500 hover:text-orange-700 text-xs font-medium">Voir →</Link>
            </div>
          </div>
        ))}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Promotions créées")

# ============================================================
# HELPER: génère une page simple avec liste Firebase
# ============================================================
def gen_simple_page(title, description, api_url, data_key=None):
    dk = data_key or api_url.split('/')[-1].split('?')[0].replace('-', '_')
    return f"""'use client';
import {{ useState, useEffect }} from 'react';

export default function Page() {{
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const items = data?.{dk} || data?.tickets || data?.reports || data?.logs || data?.settings || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        {{Array.isArray(items) ? (
          items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>
          ) : (
            <div className="space-y-3">
              {{items.slice(0, 15).map((item: any, i: number) => (
                <div key={{item.id || i}} className="p-4 rounded-lg border bg-muted/20">
                  {{Object.entries(item).slice(0, 5).map(([k, v]) => (
                    <div key={{k}} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                      <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' ? JSON.stringify(v).slice(0, 40) : String(v ?? '-')}}</span>
                    </div>
                  ))}}
                </div>
              ))}}
            </div>
          )
        ) : data ? (
          <div className="space-y-2">
            {{Object.entries(data).slice(0, 15).map(([k, v]) => (
              <div key={{k}} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground capitalize">{{k.replace(/_/g, ' ')}}</span>
                <span className="font-medium">{{typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v ?? '-')}}</span>
              </div>
            ))}}
          </div>
        ) : null}}
      </div>
    </div>
  );
}}
"""

# ============================================================
# PAGES NOTIFICATIONS
# ============================================================
write_page(f"{BASE}/notifications/page.tsx", """'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>({ notifications: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?recipientType=${filter}` : '';
    fetch(`/api/admin/notifications${params}`).then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const { notifications, stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de notifications</h1>
          <p className="text-muted-foreground mt-1">Gestion des notifications push, SMS et email</p>
        </div>
        <a href="/admin/notifications/compose" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">+ Envoyer une notification</a>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total envoyées', value: stats.total || 0 },
            { label: 'Non lues', value: stats.unread || 0 },
            { label: 'Délivrées', value: stats.delivered || 0 },
            { label: 'Échecs', value: stats.failed || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b flex gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous les destinataires</option>
            <option value="client">Clients</option>
            <option value="driver">Chauffeurs</option>
            <option value="store">Dépanneurs</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">Aucune notification trouvée</p>
          ) : notifications.slice(0, 20).map((notif: any, i: number) => (
            <div key={notif.id || i} className={`flex items-start gap-4 p-4 hover:bg-muted/30 ${!notif.read ? 'bg-orange-50/30' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.status === 'delivered' ? 'bg-green-500' : notif.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <span className="text-xs text-muted-foreground">{notif.createdAt ? new Date(notif.createdAt._seconds ? notif.createdAt._seconds * 1000 : notif.createdAt).toLocaleString('fr-CA') : '-'}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{notif.recipientType}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{notif.channel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
""")

for rel_path, title, api_url in [
    ('notifications/push', 'Notifications push', '/api/admin/notifications?channel=push'),
    ('notifications/sms', 'Notifications SMS', '/api/admin/notifications?channel=sms'),
    ('notifications/email', 'Notifications email', '/api/admin/notifications?channel=email'),
    ('notifications/system', 'Notifications système', '/api/admin/notifications?channel=in_app'),
    ('notifications/history', 'Historique des notifications', '/api/admin/notifications'),
    ('notifications/templates', 'Modèles de notification', '/api/admin/notifications'),
    ('notifications/compose', 'Composer une notification', '/api/admin/notifications'),
    ('notifications/[templateId]', 'Détail notification', '/api/admin/notifications'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    if rel_path == 'notifications/compose':
        content = gen_simple_page('Composer une notification', 'Envoyer une notification push, SMS ou email.', '/api/admin/notifications')
    elif '[templateId]' in rel_path:
        content = gen_simple_page('Détail notification', 'Détail de la notification.', '/api/admin/notifications')
    else:

        content = f"""'use client';
import {{ useState, useEffect }} from 'react';

export default function Page() {{
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {{
    fetch('{api_url}').then(r => r.json()).then(d => setItems(d.notifications || [])).finally(() => setLoading(false));
  }}, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{{items.length}} notification(s)</p>
      </div>
      <div className="rounded-xl border bg-card divide-y divide-border">
        {{items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground">Aucune notification trouvée</p>
        ) : items.slice(0, 20).map((item, i) => (
          <div key={{item.id || i}} className="flex items-start gap-4 p-4 hover:bg-muted/30">
            <div className="flex-1">
              <p className="text-sm font-medium">{{item.title}}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{{item.body}}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{{item.recipientType}}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{{item.channel}}</span>
              </div>
            </div>
          </div>
        ))}}
      </div>
    </div>
  );
}}
"""
    write_page(full_path, content)

print("\n✅ Pages Notifications créées")


# ============================================================
# PAGES SUPPORT
# ============================================================
write_page(f"{BASE}/support/page.tsx", """'use client';
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
""")

for rel_path, title, api_url in [
    ('support/clients', 'Tickets clients', '/api/admin/support?userType=client'),
    ('support/drivers', 'Tickets chauffeurs', '/api/admin/support?userType=driver'),
    ('support/disputes', 'Litiges', '/api/admin/support?category=dispute'),
    ('support/live-chat', 'Chat en direct', '/api/admin/support?status=open'),
    ('support/sla', 'Accords SLA', '/api/admin/support'),
    ('support/help-center', 'Centre d\'aide', '/api/admin/support'),
    ('support/stores', 'Tickets dépanneurs', '/api/admin/support?userType=store'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    write_page(full_path, gen_simple_page(title, f'Gestion des tickets: {title}', api_url, 'tickets'))

# Support ticket detail
write_page(f"{BASE}/support/[ticketId]/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { ticketId } = useParams() as { ticketId: string };
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/admin/support/${ticketId}`).then(r => r.json()),
      fetch(`/api/admin/support/${ticketId}/messages`).then(r => r.json()),
    ]).then(([td, md]) => {
      setTicket(td.ticket);
      setMessages(md.messages || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (ticketId) load(); }, [ticketId]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await fetch(`/api/admin/support/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: reply, senderType: 'admin', senderName: 'Admin DepXpreS' }),
    });
    setReply('');
    load();
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticket #{ticketId?.slice(0, 8)}</h1>
        <p className="text-muted-foreground mt-1">{ticket?.subject}</p>
      </div>
      {ticket && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Statut', value: ticket.status },
            { label: 'Priorité', value: ticket.priority },
            { label: 'Catégorie', value: ticket.category?.replace(/_/g, ' ') },
            { label: 'Type utilisateur', value: ticket.userType },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border bg-card flex flex-col" style={{height: '400px'}}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun message dans ce ticket.</p>
          ) : messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${msg.senderType === 'admin' ? 'bg-orange-500 text-white' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex gap-2">
          <input type="text" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="Répondre au ticket..." className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={sendReply} disabled={sending} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
""")

write_page(f"{BASE}/support/[ticketId]/thread/page.tsx", gen_simple_page('Fil de discussion', 'Historique complet du ticket.', '/api/admin/support', 'tickets'))

print("\n✅ Pages Support créées")

# ============================================================
# PAGES REPORTS
# ============================================================
write_page(f"{BASE}/reports/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const reports = [
    { title: 'Rapport des ventes', description: 'Revenus, commandes et tendances', href: '/admin/reports/sales', icon: '💰' },
    { title: 'Rapport des commandes', description: 'Volume, statuts et performance', href: '/admin/reports/orders', icon: '📦' },
    { title: 'Rapport des chauffeurs', description: 'Gains, livraisons et notes', href: '/admin/reports/drivers', icon: '🚗' },
    { title: 'Rapport des clients', description: 'Acquisition, rétention et LTV', href: '/admin/reports/clients', icon: '👥' },
    { title: 'Rapport des dépanneurs', description: 'Performance et revenus par store', href: '/admin/reports/stores', icon: '🏪' },
    { title: 'Rapport des produits', description: 'Produits populaires et stock', href: '/admin/reports/products', icon: '🛒' },
    { title: 'Rapport financier', description: 'P&L, marges et projections', href: '/admin/reports/finance', icon: '📊' },
    { title: 'Rapport par zones', description: 'Performance géographique', href: '/admin/reports/zones', icon: '🗺️' },
    { title: 'Exports de données', description: 'Télécharger les données CSV/Excel', href: '/admin/reports/exports', icon: '📥' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Analyses détaillées de la plateforme DepXpreS</p>
      </div>
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenus (30j)', value: `${data.summary.revenue30d?.toFixed(2)} $` },
            { label: 'Commandes (30j)', value: data.summary.orders30d },
            { label: 'Clients actifs', value: data.summary.activeClients },
            { label: 'Taux de complétion', value: `${data.summary.completionRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(report => (
          <Link key={report.href} href={report.href} className="rounded-xl border bg-card p-6 hover:shadow-md transition-all hover:border-orange-200 group">
            <div className="text-3xl mb-3">{report.icon}</div>
            <h2 className="font-semibold group-hover:text-orange-500 transition-colors">{report.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
""")

for rel_path, title, api_url in [
    ('reports/sales', 'Rapport des ventes', '/api/admin/reports?type=sales'),
    ('reports/orders', 'Rapport des commandes', '/api/admin/reports?type=orders'),
    ('reports/drivers', 'Rapport des chauffeurs', '/api/admin/reports?type=drivers'),
    ('reports/clients', 'Rapport des clients', '/api/admin/reports?type=clients'),
    ('reports/stores', 'Rapport des dépanneurs', '/api/admin/reports?type=stores'),
    ('reports/products', 'Rapport des produits', '/api/admin/reports?type=products'),
    ('reports/finance', 'Rapport financier', '/api/admin/reports?type=finance'),
    ('reports/zones', 'Rapport par zones', '/api/admin/reports?type=zones'),
    ('reports/exports', 'Exports de données', '/api/admin/reports?type=exports'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    write_page(full_path, gen_simple_page(title, f'Données analytiques: {title}', api_url, 'reports'))

print("\n✅ Pages Reports créées")

# ============================================================
# PAGES SETTINGS
# ============================================================
write_page(f"{BASE}/settings/page.tsx", """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => setSettings(d.settings)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  const settingGroups = [
    { title: 'Général', description: 'Nom, langue, fuseau horaire', href: '/admin/settings/general', icon: '⚙️' },
    { title: 'Livraison', description: 'Frais, zones, délais', href: '/admin/settings/delivery', icon: '🚚' },
    { title: 'Paiements', description: 'Méthodes, devises, frais', href: '/admin/settings/payments', icon: '💳' },
    { title: 'Taxes', description: 'TPS, TVQ, taux', href: '/admin/settings/taxes', icon: '🧾' },
    { title: 'Chauffeurs', description: 'Commission, bonus, règles', href: '/admin/settings/drivers', icon: '🚗' },
    { title: 'Dépanneurs', description: 'Commission, horaires, règles', href: '/admin/settings/stores', icon: '🏪' },
    { title: 'Notifications', description: 'Templates, canaux, alertes', href: '/admin/settings/notifications', icon: '🔔' },
    { title: 'Cartes & GPS', description: 'Google Maps, zones, rayon', href: '/admin/settings/maps', icon: '🗺️' },
    { title: 'Authentification', description: 'Firebase Auth, rôles', href: '/admin/settings/auth', icon: '🔐' },
    { title: 'Intégrations', description: 'APIs tierces, webhooks', href: '/admin/settings/integrations', icon: '🔌' },
    { title: 'Marque', description: 'Logo, couleurs, nom', href: '/admin/settings/branding', icon: '🎨' },
    { title: 'Langues', description: 'FR, EN, AR', href: '/admin/settings/languages', icon: '🌐' },
    { title: 'Journaux système', description: 'Logs d\'erreurs et d\'activité', href: '/admin/settings/logs', icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de la plateforme</h1>
        <p className="text-muted-foreground mt-1">Configuration globale de DepXpreS</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settingGroups.map(group => (
          <Link key={group.href} href={group.href} className="rounded-xl border bg-card p-5 hover:shadow-md transition-all hover:border-orange-200 group">
            <div className="text-2xl mb-2">{group.icon}</div>
            <h2 className="font-semibold group-hover:text-orange-500 transition-colors">{group.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
""")

for rel_path, title, api_url in [
    ('settings/general', 'Paramètres généraux', '/api/admin/settings?section=general'),
    ('settings/delivery', 'Paramètres de livraison', '/api/admin/settings?section=delivery'),
    ('settings/payments', 'Paramètres de paiement', '/api/admin/settings?section=payments'),
    ('settings/taxes', 'Paramètres de taxes', '/api/admin/settings?section=taxes'),
    ('settings/drivers', 'Paramètres chauffeurs', '/api/admin/settings?section=drivers'),
    ('settings/stores', 'Paramètres dépanneurs', '/api/admin/settings?section=stores'),
    ('settings/notifications', 'Paramètres notifications', '/api/admin/settings?section=notifications'),
    ('settings/maps', 'Paramètres cartes & GPS', '/api/admin/settings?section=maps'),
    ('settings/auth', 'Paramètres authentification', '/api/admin/settings?section=auth'),
    ('settings/integrations', 'Intégrations', '/api/admin/settings?section=integrations'),
    ('settings/branding', 'Marque & Design', '/api/admin/settings?section=branding'),
    ('settings/languages', 'Langues', '/api/admin/settings?section=languages'),
    ('settings/logs', 'Journaux système', '/api/admin/audit-logs'),
]:
    full_path = f"{BASE}/{rel_path}/page.tsx"
    write_page(full_path, gen_simple_page(title, f'Configuration: {title}', api_url, 'settings'))

print("\n✅ Pages Settings créées")

# ============================================================
# PAGES PERMISSIONS
# ============================================================
write_page(f"{BASE}/permissions/page.tsx", gen_simple_page('Gestion des permissions', 'Rôles et droits d\'accès de la plateforme.', '/api/admin/settings', 'settings'))
write_page(f"{BASE}/permissions/roles/page.tsx", gen_simple_page('Rôles', 'Gestion des rôles admin.', '/api/admin/settings', 'settings'))
write_page(f"{BASE}/permissions/admins/page.tsx", gen_simple_page('Administrateurs', 'Liste des administrateurs de la plateforme.', '/api/admin/settings', 'settings'))
write_page(f"{BASE}/permissions/matrix/page.tsx", gen_simple_page('Matrice des permissions', 'Vue complète des droits par rôle.', '/api/admin/settings', 'settings'))
write_page(f"{BASE}/permissions/audit/page.tsx", gen_simple_page('Journal d\'audit', 'Historique des actions admin.', '/api/admin/audit-logs', 'logs'))

print("\n✅ Pages Permissions créées")

# ============================================================
# PAGES DASHBOARD SOUS-MODULES
# ============================================================
write_page(f"{BASE}/dashboard/alerts/page.tsx", gen_simple_page('Alertes système', 'Alertes et incidents en cours.', '/api/admin/dashboard', 'alerts'))
write_page(f"{BASE}/dashboard/live/page.tsx", """'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord en direct</h1>
          <p className="text-muted-foreground mt-1">Activité en temps réel — actualisation toutes les 10 secondes</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>En direct</span>
      </div>
      {data?.activeOrders && (
        <div>
          <h2 className="font-semibold mb-3">Commandes actives ({data.activeOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeOrders.map((order: any) => (
              <div key={order.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{order.orderNumber}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.order_status === 'delivering' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.order_status?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted-foreground">{order.clientName} → {order.storeName}</p>
                <p className="text-xs text-muted-foreground mt-1">Chauffeur: {order.driverName || 'Non assigné'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.onlineDrivers && (
        <div>
          <h2 className="font-semibold mb-3">Chauffeurs en ligne ({data.onlineDrivers.length})</h2>
          <div className="flex flex-wrap gap-2">
            {data.onlineDrivers.map((driver: any) => (
              <div key={driver.id} className="flex items-center gap-2 px-3 py-2 rounded-full border bg-card text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {driver.full_name || driver.fullName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
""")

write_page(f"{BASE}/dashboard/map/page.tsx", """'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carte en direct</h1>
        <p className="text-muted-foreground mt-1">Positions des chauffeurs et commandes actives sur la carte</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="w-full h-96 bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
          <div className="text-center z-10">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="font-semibold text-lg">Carte Google Maps — Grand Montréal</p>
            <p className="text-sm text-muted-foreground mt-2">
              {data?.onlineDrivers?.length || 0} chauffeurs en ligne • {data?.activeOrders?.length || 0} commandes actives
            </p>
            <p className="text-xs text-muted-foreground mt-1">Clé API Google Maps configurée: AIzaSyDHZkzDCSJXxltAnvWeSeC9wLylN93G3S0</p>
          </div>
          {data?.onlineDrivers?.slice(0, 5).map((driver: any, i: number) => (
            <div key={driver.id} className="absolute text-2xl" style={{ top: `${20 + i * 15}%`, left: `${20 + i * 12}%` }}>
              🚗
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-3">Chauffeurs actifs</h2>
          <div className="space-y-2">
            {(data?.onlineDrivers || []).slice(0, 5).map((driver: any) => (
              <div key={driver.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>{driver.full_name || driver.fullName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{driver.current_zone_id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-3">Commandes en livraison</h2>
          <div className="space-y-2">
            {(data?.activeOrders || []).filter((o: any) => o.order_status === 'delivering').slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <span>{order.orderNumber}</span>
                <span className="text-xs text-muted-foreground">{order.driverName || 'Non assigné'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
""")

print("\n✅ Pages Dashboard sous-modules créées")

# ============================================================
# PAGE PROFILE & SEARCH
# ============================================================
write_page(f"{BASE}/profile/page.tsx", gen_simple_page('Mon profil', 'Paramètres de votre compte administrateur.', '/api/admin/settings', 'settings'))
write_page(f"{BASE}/search/page.tsx", """'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Page() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const [orders, drivers, clients] = await Promise.all([
      fetch(`/api/admin/orders?search=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`/api/admin/drivers?search=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`/api/admin/clients?search=${encodeURIComponent(query)}`).then(r => r.json()),
    ]);
    setResults({
      orders: orders.orders?.slice(0, 5) || [],
      drivers: drivers.drivers?.slice(0, 5) || [],
      clients: clients.clients?.slice(0, 5) || [],
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recherche globale</h1>
        <p className="text-muted-foreground mt-1">Rechercher dans toute la plateforme DepXpreS</p>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Numéro de commande, nom client, chauffeur..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm"
        />
        <button onClick={search} disabled={loading} className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
          {loading ? '...' : 'Rechercher'}
        </button>
      </div>
      {results && (
        <div className="space-y-6">
          {results.orders.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Commandes ({results.orders.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.orders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{o.clientName} • {o.storeName}</p>
                    </div>
                    <Link href={`/admin/orders/${o.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.drivers.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Chauffeurs ({results.drivers.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.drivers.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{d.full_name || d.fullName}</p>
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    </div>
                    <Link href={`/admin/drivers/${d.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.clients.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Clients ({results.clients.length})</h2>
              <div className="rounded-xl border bg-card divide-y">
                {results.clients.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Link href={`/admin/clients/${c.id}`} className="text-orange-500 text-sm font-medium">Voir →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.orders.length === 0 && results.drivers.length === 0 && results.clients.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun résultat pour &quot;{query}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
}
""")

print("\n✅ Pages Profile & Search créées")
print("\n🎉 GÉNÉRATION COMPLÈTE — Toutes les pages admin sont créées avec Firebase!")
