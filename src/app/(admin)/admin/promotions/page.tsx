'use client';
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
