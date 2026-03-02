'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/drivers').then(r => r.json()).then(d => {
      setDrivers(d.drivers || d.applications || d.payouts || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = drivers.filter(d => !search || 
    (d.full_name || d.fullName || d.driverName || '')?.toLowerCase().includes(search.toLowerCase()) ||
    (d.phone || d.email || '')?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gains des chauffeurs</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} résultat(s)</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Nom', 'Téléphone', 'Statut', 'Zone', 'Note', 'Livraisons', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun résultat trouvé</td></tr>
              ) : filtered.map(driver => (
                <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{driver.full_name || driver.fullName || driver.driverName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{driver.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${driver.driver_status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {driver.driver_status || driver.applicationStatus || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{driver.current_zone_id || '-'}</td>
                  <td className="px-4 py-3 text-sm">{driver.rating_average?.toFixed(1) || '-'} ⭐</td>
                  <td className="px-4 py-3 text-sm">{driver.total_deliveries || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/drivers/${driver.id}`} className="text-orange-500 hover:text-orange-700 font-medium">Voir →</Link>
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
