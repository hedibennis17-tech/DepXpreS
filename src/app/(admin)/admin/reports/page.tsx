'use client';
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
