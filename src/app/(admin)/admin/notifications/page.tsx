'use client';
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
