'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  daily_summary: 'Rapport quotidien',
  weekly_summary: 'Rapport hebdomadaire',
  monthly_summary: 'Rapport mensuel',
  driver_performance: 'Performance chauffeurs',
  store_performance: 'Performance dépanneurs',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (ts: any) => {
    if (!ts) return 'N/A';
    const d = ts?._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const reportLinks = [
    { title: 'Rapport des ventes', description: 'Revenus, commandes et tendances', href: '/admin/reports/sales', icon: '💰' },
    { title: 'Rapport des commandes', description: 'Volume, statuts et performance', href: '/admin/reports/orders', icon: '📦' },
    { title: 'Rapport des chauffeurs', description: 'Gains, livraisons et notes', href: '/admin/reports/drivers', icon: '🚗' },
    { title: 'Rapport des clients', description: 'Acquisition, rétention et LTV', href: '/admin/reports/clients', icon: '👥' },
    { title: 'Rapport des dépanneurs', description: 'Performance et revenus par store', href: '/admin/reports/stores', icon: '🏪' },
    { title: 'Rapport financier', description: 'P&L, marges et projections', href: '/admin/reports/finance', icon: '📊' },
    { title: 'Rapport par zones', description: 'Performance géographique', href: '/admin/reports/zones', icon: '🗺️' },
    { title: 'Exports de données', description: 'Télécharger les données CSV/Excel', href: '/admin/reports/exports', icon: '📥' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Analyses détaillées de la plateforme DepXpreS</p>
      </div>

      {/* Rapports récents depuis Firebase */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Rapports générés ({reports.length})</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">TITRE</th>
                  <th className="text-left p-3 font-medium">TYPE</th>
                  <th className="text-left p-3 font-medium">PÉRIODE</th>
                  <th className="text-left p-3 font-medium">STATUT</th>
                  <th className="text-left p-3 font-medium">GÉNÉRÉ LE</th>
                  <th className="text-left p-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-t hover:bg-muted/20">
                    <td className="p-3 font-medium">{report.title}</td>
                    <td className="p-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {TYPE_LABELS[report.type] || report.type}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{report.period}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(report.generatedAt)}</td>
                    <td className="p-3">
                      <button className="text-orange-500 hover:underline text-xs">Voir →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Métriques du dernier rapport mensuel */}
      {reports.find(r => r.type === 'monthly_summary') && (() => {
        const monthly = reports.find(r => r.type === 'monthly_summary');
        const d = monthly?.data || {};
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Résumé — {monthly.period}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Commandes totales', value: d.totalOrders || 0 },
                { label: 'Commandes complétées', value: d.completedOrders || 0 },
                { label: 'Revenus', value: `${(d.totalRevenue || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $` },
                { label: 'Nouveaux clients', value: d.newClients || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Liens vers les rapports détaillés */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Générer un rapport</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportLinks.map(report => (
            <Link
              key={report.href}
              href={report.href}
              className="rounded-xl border bg-card p-6 hover:shadow-md transition-all hover:border-orange-200 group"
            >
              <div className="text-3xl mb-3">{report.icon}</div>
              <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{report.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
