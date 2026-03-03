/**
 * roles-permissions.ts
 * Définition des rôles et permissions DepXpreS
 *
 * Hiérarchie : super_admin > admin > dispatcher > agent > store_owner > client / driver
 *
 * Tableau des accès dashboard admin :
 * ┌─────────────────────┬─────────────┬───────┬────────────┬───────┐
 * │ Page                │ Super Admin │ Admin │ Dispatcher │ Agent │
 * ├─────────────────────┼─────────────┼───────┼────────────┼───────┤
 * │ Dashboard           │ ✅          │ ✅    │ ✅         │ ✅    │
 * │ Commandes           │ ✅          │ ✅    │ ✅         │ ❌    │
 * │ Dispatch/Tracking   │ ✅          │ ✅    │ ✅         │ ❌    │
 * │ Chauffeurs          │ ✅          │ ✅    │ ✅         │ ❌    │
 * │ Support/Tickets     │ ✅          │ ✅    │ ❌         │ ✅    │
 * │ Clients             │ ✅          │ ✅    │ ❌         │ ❌    │
 * │ Stores              │ ✅          │ ✅    │ ❌         │ ❌    │
 * │ Promotions          │ ✅          │ ✅    │ ❌         │ ❌    │
 * │ Zones               │ ✅          │ ✅    │ ❌         │ ❌    │
 * │ Paramètres système  │ ✅          │ ❌    │ ❌         │ ❌    │
 * │ Créer comptes équipe│ ✅          │ ❌    │ ❌         │ ❌    │
 * └─────────────────────┴─────────────┴───────┴────────────┴───────┘
 *
 * Tableau des accès app store (store_owner) :
 * ┌──────────────────────────┬─────────────┐
 * │ Page Store App           │ Store Owner │
 * ├──────────────────────────┼─────────────┤
 * │ Dashboard store          │ ✅          │
 * │ Commandes du dépanneur   │ ✅          │
 * │ Catalogue / Produits     │ ✅          │
 * │ Horaires                 │ ✅          │
 * │ Paiements / Règlements   │ ✅ (lecture)│
 * │ Notifications            │ ✅          │
 * │ Profil dépanneur         │ ✅          │
 * │ Dashboard admin          │ ❌          │
 * │ Tous les dépanneurs      │ ❌          │
 * └──────────────────────────┴─────────────┘
 */

export type RoleKey = 'super_admin' | 'admin' | 'dispatcher' | 'agent' | 'store_owner' | 'client' | 'driver';

export type PermissionKey =
  | '*'
  | 'dashboard.read'
  // Commandes
  | 'orders.read' | 'orders.write' | 'orders.create' | 'orders.accept'
  // Dispatch / Tracking
  | 'dispatch.read' | 'dispatch.write' | 'tracking.read'
  // Chauffeurs
  | 'drivers.read' | 'drivers.write'
  // Support / Tickets
  | 'support.read' | 'support.write'
  // Clients
  | 'clients.read' | 'clients.write'
  // Stores
  | 'stores.read' | 'stores.write'
  // Store Owner — accès limité à son propre dépanneur
  | 'store.dashboard' | 'store.orders' | 'store.catalog' | 'store.schedule' | 'store.profile'
  // Promotions
  | 'promotions.read' | 'promotions.write'
  // Zones
  | 'zones.read' | 'zones.write'
  // Paramètres système (super_admin uniquement)
  | 'system_settings.read' | 'system_settings.write'
  // Gestion comptes équipe (super_admin uniquement)
  | 'users.read' | 'users.create' | 'users.write'
  // Finances
  | 'transactions.read' | 'refunds.write'
  | 'store_settlements.read' | 'store_settlements.write'
  // Notifications
  | 'notifications.read' | 'notifications.write'
  // Rapports
  | 'reports.read'
  // Profil personnel
  | 'profile.read' | 'profile.write'
  // Localisation (chauffeur)
  | 'location.write';

export interface RoleDefinition {
  role_key: RoleKey;
  label: string;
  is_system: boolean;
  app: 'admin' | 'store' | 'client' | 'driver' | 'all';
  description: string;
  color: string;
}

export const ROLES: Record<RoleKey, RoleDefinition> = {
  super_admin: {
    role_key: 'super_admin',
    label: 'Super Admin',
    is_system: true,
    app: 'admin',
    description: 'Accès complet à toutes les fonctionnalités du système',
    color: 'bg-purple-100 text-purple-800',
  },
  admin: {
    role_key: 'admin',
    label: 'Administrateur',
    is_system: true,
    app: 'admin',
    description: 'Accès complet sauf paramètres système et création de comptes',
    color: 'bg-blue-100 text-blue-800',
  },
  dispatcher: {
    role_key: 'dispatcher',
    label: 'Dispatcher',
    is_system: true,
    app: 'admin',
    description: 'Gestion des commandes, dispatch et chauffeurs',
    color: 'bg-orange-100 text-orange-800',
  },
  agent: {
    role_key: 'agent',
    label: 'Agent Support',
    is_system: true,
    app: 'admin',
    description: 'Support client et gestion des tickets',
    color: 'bg-yellow-100 text-yellow-800',
  },
  store_owner: {
    role_key: 'store_owner',
    label: 'Propriétaire Dépanneur',
    is_system: true,
    app: 'store',
    description: 'Accès à l\'app store pour gérer son dépanneur (commandes, catalogue, horaires)',
    color: 'bg-emerald-100 text-emerald-800',
  },
  client: {
    role_key: 'client',
    label: 'Client',
    is_system: true,
    app: 'client',
    description: 'Commander et suivre ses livraisons',
    color: 'bg-green-100 text-green-800',
  },
  driver: {
    role_key: 'driver',
    label: 'Chauffeur',
    is_system: true,
    app: 'driver',
    description: 'Accepter et livrer des commandes',
    color: 'bg-cyan-100 text-cyan-800',
  },
};

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  // ── Super Admin : accès total + gestion comptes équipe + paramètres système
  super_admin: [
    '*',
    'users.read', 'users.create', 'users.write',
    'system_settings.read', 'system_settings.write',
  ],

  // ── Admin : tout sauf créer comptes équipe et paramètres système
  admin: [
    'dashboard.read',
    'orders.read', 'orders.write',
    'dispatch.read', 'dispatch.write', 'tracking.read',
    'drivers.read', 'drivers.write',
    'support.read', 'support.write',
    'clients.read', 'clients.write',
    'stores.read', 'stores.write',
    'promotions.read', 'promotions.write',
    'zones.read', 'zones.write',
    'transactions.read',
    'refunds.write',
    'store_settlements.read', 'store_settlements.write',
    'notifications.read', 'notifications.write',
    'reports.read',
    'users.read',
  ],

  // ── Dispatcher : Dashboard, Commandes, Dispatch/Tracking, Chauffeurs
  dispatcher: [
    'dashboard.read',
    'orders.read', 'orders.write',
    'dispatch.read', 'dispatch.write', 'tracking.read',
    'drivers.read',
    'store_settlements.read', 'store_settlements.write',
    'notifications.read', 'notifications.write',
  ],

  // ── Agent Support : Dashboard, Support/Tickets uniquement
  agent: [
    'dashboard.read',
    'support.read', 'support.write',
    'notifications.read', 'notifications.write',
  ],

  // ── Store Owner : accès limité à l'app store de son propre dépanneur
  store_owner: [
    'store.dashboard',
    'store.orders',
    'store.catalog',
    'store.schedule',
    'store.profile',
    'store_settlements.read',
    'notifications.read', 'notifications.write',
    'profile.read', 'profile.write',
  ],

  // ── Client : commander, suivre sa livraison, profil personnel
  client: [
    'orders.read', 'orders.create',
    'profile.read', 'profile.write',
  ],

  // ── Chauffeur : accepter/livrer commandes, GPS, gains personnels
  driver: [
    'orders.read', 'orders.accept',
    'profile.read', 'profile.write',
    'location.write',
  ],
};

/**
 * Vérifie si un rôle possède une permission donnée
 * super_admin avec '*' a toutes les permissions
 */
export function roleHasPermission(role: RoleKey, permission: PermissionKey): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

/**
 * Retourne toutes les permissions d'un rôle
 */
export function getPermissionsForRole(role: RoleKey): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ADMIN_ROLES: RoleKey[] = ['super_admin', 'admin', 'dispatcher', 'agent'];
export const STORE_ROLES: RoleKey[] = ['store_owner'];
export const PUBLIC_ROLES: RoleKey[] = ['client', 'driver'];
export const ALL_ROLES: RoleKey[] = ['super_admin', 'admin', 'dispatcher', 'agent', 'store_owner', 'client', 'driver'];

// Pages accessibles par rôle (utilisé par le middleware et la sidebar admin)
export const ROLE_ALLOWED_PATHS: Record<string, RoleKey[]> = {
  '/admin/dashboard':    ['super_admin', 'admin', 'dispatcher', 'agent'],
  '/admin/orders':       ['super_admin', 'admin', 'dispatcher'],
  '/admin/dispatch':     ['super_admin', 'admin', 'dispatcher'],
  '/admin/tracking':     ['super_admin', 'admin', 'dispatcher'],
  '/admin/drivers':      ['super_admin', 'admin', 'dispatcher'],
  '/admin/support':      ['super_admin', 'admin', 'agent'],
  '/admin/tickets':      ['super_admin', 'admin', 'agent'],
  '/admin/clients':      ['super_admin', 'admin'],
  '/admin/stores':       ['super_admin', 'admin'],
  '/admin/promotions':   ['super_admin', 'admin'],
  '/admin/zones':        ['super_admin', 'admin'],
  '/admin/settings':     ['super_admin'],
  '/admin/users':        ['super_admin'],
  '/admin/users/create': ['super_admin'],
  // Store app — accessible uniquement aux store_owners et super_admin
  '/store':              ['store_owner', 'super_admin', 'admin'],
};
