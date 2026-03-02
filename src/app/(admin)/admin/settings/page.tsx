'use client';
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
    { title: 'Journaux système', description: "Logs d'erreurs et d'activité", href: '/admin/settings/logs', icon: '📋' },
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
