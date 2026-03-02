'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  const settingGroups = [
    { title: 'Général', description: 'Nom, langue, fuseau horaire', href: '/admin/settings/general', icon: '⚙️', key: 'general' },
    { title: 'Livraison', description: 'Frais, zones, délais', href: '/admin/settings/delivery', icon: '🚚', key: 'delivery' },
    { title: 'Paiements', description: 'Méthodes, devises, frais', href: '/admin/settings/payments', icon: '💳', key: 'payments' },
    { title: 'Taxes', description: 'TPS, TVQ, taux', href: '/admin/settings/taxes', icon: '🧾', key: 'taxes' },
    { title: 'Chauffeurs', description: 'Commission, bonus, règles', href: '/admin/settings/drivers', icon: '🚗', key: 'drivers' },
    { title: 'Dépanneurs', description: 'Commission, horaires, règles', href: '/admin/settings/stores', icon: '🏪', key: 'stores' },
    { title: 'Notifications', description: 'Templates, canaux, alertes', href: '/admin/settings/notifications', icon: '🔔', key: 'notifications' },
    { title: 'Cartes & GPS', description: 'Google Maps, zones, rayon', href: '/admin/settings/maps', icon: '🗺️', key: 'maps' },
    { title: 'Authentification', description: 'Firebase Auth, rôles', href: '/admin/settings/auth', icon: '🔐', key: 'auth' },
    { title: 'Intégrations', description: 'APIs tierces, webhooks', href: '/admin/settings/integrations', icon: '🔌', key: 'integrations' },
    { title: 'Marque', description: 'Logo, couleurs, nom', href: '/admin/settings/branding', icon: '🎨', key: 'branding' },
    { title: 'Langues', description: 'FR, EN, AR', href: '/admin/settings/languages', icon: '🌐', key: 'languages' },
    { title: 'Journaux système', description: "Logs d'erreurs et d'activité", href: '/admin/settings/logs', icon: '📋', key: 'logs' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  const general = settings['general'] || {};
  const delivery = settings['delivery'] || {};
  const payments = settings['payments'] || {};
  const notifications = settings['notifications'] || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de la plateforme</h1>
        <p className="text-muted-foreground mt-1">Configuration globale de DepXpreS</p>
      </div>

      {/* Résumé des paramètres actifs */}
      {Object.keys(settings).length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Configuration actuelle</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Plateforme</p>
              <p className="font-medium">{general.siteName || 'DepXpreS'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Frais de livraison</p>
              <p className="font-medium">{delivery.defaultDeliveryFee ? `${delivery.defaultDeliveryFee} $` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Commission plateforme</p>
              <p className="font-medium">{payments.platformFeePercent ? `${payments.platformFeePercent}%` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mode dispatch</p>
              <p className="font-medium capitalize">{delivery.dispatchMode || 'auto'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Langue par défaut</p>
              <p className="font-medium">{general.defaultLanguage?.toUpperCase() || 'FR'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maintenance</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                general.maintenanceMode ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {general.maintenanceMode ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Email support</p>
              <p className="font-medium">{general.supportEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inscriptions</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                general.allowNewRegistrations !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {general.allowNewRegistrations !== false ? 'Ouvertes' : 'Fermées'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Groupes de paramètres */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Sections de configuration ({Object.keys(settings).length} configurées)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settingGroups.map(group => (
            <Link
              key={group.href}
              href={group.href}
              className="rounded-xl border bg-card p-5 hover:shadow-md transition-all hover:border-orange-200 group relative"
            >
              {settings[group.key] && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-500"></span>
              )}
              <div className="text-2xl mb-2">{group.icon}</div>
              <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{group.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
              {settings[group.key] && (
                <p className="text-xs text-green-600 mt-2">Configuré</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
