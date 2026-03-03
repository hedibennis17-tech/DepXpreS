/**
 * roles-permissions.ts
 * Définition des rôles et permissions DepXpreS
 *
 * Hiérarchie : super_admin > admin > dispatcher > agent > client / driver
 *
 * Tableau des accès dashboard :
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
 */

export type RoleKey = 'super_admin' | 'admin' | 'dispatcher' | 'agent' | 'client' | 'driver';

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
}

export const ROLES: Record<RoleKey, RoleDefinition> = {
  super_admin: { role_key: 'super_admin', label: 'Super Admin',  is_system: true },
  admin:       { role_key: 'admin',       label: 'Admin',        is_system: true },
  dispatcher:  { role_key: 'dispatcher',  label: 'Dispatcher',   is_system: true },
  agent:       { role_key: 'agent',       label: 'Agent Support', is_system: true },
  client:      { role_key: 'client',      label: 'Client',       is_system: true },
  driver:      { role_key: 'driver',      label: 'Chauffeur',    is_system: true },
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
export const PUBLIC_ROLES: RoleKey[] = ['client', 'driver'];

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
};
