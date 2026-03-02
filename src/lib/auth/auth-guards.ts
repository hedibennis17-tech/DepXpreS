/**
 * auth-guards.ts
 * Système de vérification des permissions basé sur Firebase Admin SDK + Firestore
 * Équivalent Firebase de requirePermission(userId, 'orders.write')
 */

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { ROLE_PERMISSIONS, ADMIN_ROLES, type RoleKey, type PermissionKey, roleHasPermission } from './roles-permissions';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthUser {
  uid: string;
  email: string;
  role: RoleKey;
  status: string;
  displayName: string;
}

/**
 * Vérifie le token Firebase depuis le header Authorization ou le cookie admin_session
 * Retourne l'utilisateur authentifié ou lève une erreur
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  // 1. Chercher le token dans Authorization: Bearer <token>
  let idToken: string | null = null;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    idToken = authHeader.slice(7);
  }

  // 2. Sinon chercher dans le cookie admin_session
  if (!idToken) {
    idToken = req.cookies.get('admin_session')?.value ?? null;
  }

  if (!idToken) {
    throw new AuthError('Non autorisé. Token manquant.', 401);
  }

  // 3. Vérifier le token Firebase
  let decoded: { uid: string };
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw new AuthError('Token invalide ou expiré.', 401);
  }

  // 4. Récupérer le profil dans app_users
  const userDoc = await adminDb.collection('app_users').doc(decoded.uid).get();
  if (!userDoc.exists) {
    throw new AuthError('Utilisateur introuvable.', 404);
  }

  const userData = userDoc.data()!;

  if (userData.status === 'blocked' || userData.status === 'suspended' || userData.status === 'deleted') {
    throw new AuthError('Compte suspendu ou bloqué.', 403);
  }

  return {
    uid: decoded.uid,
    email: userData.email,
    role: userData.primary_role as RoleKey,
    status: userData.status,
    displayName: userData.display_name ?? `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim(),
  };
}

/**
 * Vérifie qu'un utilisateur possède une permission donnée
 * Lève une AuthError si la permission est refusée
 * Équivalent de requirePermission(userId, 'orders.write')
 */
export async function requirePermission(
  req: NextRequest,
  permission: PermissionKey
): Promise<AuthUser> {
  const user = await getAuthUser(req);

  if (!roleHasPermission(user.role, permission)) {
    throw new AuthError(
      `Permission refusée. Rôle "${user.role}" ne possède pas "${permission}".`,
      403
    );
  }

  return user;
}

/**
 * Vérifie qu'un utilisateur est un admin (super_admin, admin, dispatcher, agent)
 */
export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);

  if (!ADMIN_ROLES.includes(user.role)) {
    throw new AuthError('Accès réservé aux administrateurs.', 403);
  }

  return user;
}

/**
 * Vérifie que l'utilisateur est super_admin uniquement
 */
export async function requireSuperAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);

  if (user.role !== 'super_admin') {
    throw new AuthError('Accès réservé au Super Admin.', 403);
  }

  return user;
}

/**
 * Classe d'erreur d'authentification
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Helper pour gérer les erreurs d'auth dans les route handlers
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.statusCode }
    );
  }
  console.error('Erreur auth inattendue:', error);
  return NextResponse.json(
    { ok: false, error: 'Erreur interne du serveur.' },
    { status: 500 }
  );
}

/**
 * Vérifie si un utilisateur a une permission (sans lever d'erreur)
 * Utile pour les vérifications conditionnelles
 */
export function userHasPermission(role: RoleKey, permission: PermissionKey): boolean {
  return roleHasPermission(role, permission);
}
