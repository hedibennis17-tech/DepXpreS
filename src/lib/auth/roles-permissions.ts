/**
 * Définition statique des rôles et permissions DepXpreS
 * Équivalent Firebase des tables SQL roles / role_permissions
 * Stocké en mémoire pour éviter les appels Firestore sur chaque requête
 */

export type RoleKey = 'super_admin' | 'admin' | 'dispatcher' | 'agent' | 'client' | 'driver';

export type PermissionKey =
  | '*'
  | 'dashboard.read'
  | 'orders.read' | 'orders.write' | 'orders.create' | 'orders.accept'
  | 'clients.read' | 'clients.write'
  | 'drivers.read' | 'drivers.write'
  | 'stores.read' | 'stores.write'
  | 'zones.read' | 'zones.write'
  | 'dispatch.read' | 'dispatch.write'
  | 'transactions.read'
  | 'refunds.write'
  | 'promotions.read' | 'promotions.write'
  | 'notifications.read' | 'notifications.write'
  | 'support.read' | 'support.write'
  | 'reports.read'
  | 'users.read' | 'users.create' | 'users.write'
  | 'profile.read' | 'profile.write'
  | 'location.write'
  | 'store_settlements.read' | 'store_settlements.write';

export interface RoleDefinition {
  role_key: RoleKey;
  label: string;
  is_system: boolean;
}

export const ROLES: Record<RoleKey, RoleDefinition> = {
  super_admin: { role_key: 'super_admin', label: 'Super Admin',  is_system: true },
  admin:       { role_key: 'admin',       label: 'Admin',        is_system: true },
  dispatcher:  { role_key: 'dispatcher',  label: 'Dispatcher',   is_system: true },
  agent:       { role_key: 'agent',       label: 'Agent',        is_system: true },
  client:      { role_key: 'client',      label: 'Client',       is_system: true },
  driver:      { role_key: 'driver',      label: 'Driver',       is_system: true },
};

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  super_admin: ['*', 'users.read', 'users.create', 'users.write'],

  admin: [
    'dashboard.read',
    'orders.read', 'orders.write',
    'clients.read', 'clients.write',
    'drivers.read', 'drivers.write',
    'stores.read', 'stores.write',
    'zones.read', 'zones.write',
    'dispatch.read', 'dispatch.write',
    'transactions.read',
    'store_settlements.read', 'store_settlements.write',
    'refunds.write',
    'promotions.read', 'promotions.write',
    'notifications.read', 'notifications.write',
    'support.read', 'support.write',
    'reports.read',
    'users.read',
  ],

  dispatcher: [
    'dashboard.read',
    'orders.read', 'orders.write',
    'drivers.read',
    'dispatch.read', 'dispatch.write',
    'stores.read',
    'zones.read',
    'store_settlements.read', 'store_settlements.write',
    'notifications.read', 'notifications.write',
  ],

  agent: [
    'dashboard.read',
    'orders.read',
    'clients.read',
    'drivers.read',
    'support.read', 'support.write',
    'notifications.read', 'notifications.write',
  ],

  client: [
    'orders.read', 'orders.create',
    'profile.read', 'profile.write',
  ],

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
