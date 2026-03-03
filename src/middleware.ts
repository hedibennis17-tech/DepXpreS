/**
 * middleware.ts — Protection des routes DepXpreS
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
import { NextRequest, NextResponse } from 'next/server';

// ── Routes publiques — aucune vérification requise ──────────────────────────
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/driver/login',
  '/driver/signup',
  '/admin/login',
  '/api/auth/client/signup',
  '/api/auth/driver/signup',
  '/api/auth/login',
  '/api/admin/auth/login',
  '/api/address/search',
  '/api/address/resolve',
  '/api/address/reverse',
  '/api/admin/test',
  '/api/admin/debug',
];

// ── Rôles autorisés à accéder au dashboard admin ────────────────────────────
const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

// ── Rôles autorisés à accéder à l'app store ─────────────────────────────────
const STORE_ROLES = ['store_owner', 'super_admin', 'admin'];

// ── Chemins accessibles par rôle ────────────────────────────────────────────
// Dispatcher : Dashboard, Commandes, Dispatch/Tracking, Chauffeurs
const DISPATCHER_ALLOWED = [
  '/admin/dashboard',
  '/admin/orders',
  '/admin/dispatch',
  '/admin/tracking',
  '/admin/drivers',
  '/api/admin/orders',
  '/api/admin/dispatch',
  '/api/admin/tracking',
  '/api/admin/drivers',
];

// Agent Support : Dashboard, Support/Tickets uniquement
const AGENT_ALLOWED = [
  '/admin/dashboard',
  '/admin/support',
  '/admin/tickets',
  '/api/admin/support',
  '/api/admin/tickets',
];

// Super Admin uniquement : Paramètres système + Créer comptes équipe
const SUPER_ADMIN_ONLY = [
  '/admin/settings',
  '/admin/users/create',
  '/api/admin/settings',
];

// ── Décoder un JWT Firebase sans vérification de signature (Edge Runtime) ───
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ── Middleware principal ─────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Assets statiques et Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Routes publiques
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 3. Protection des routes admin (/admin/* et /api/admin/*)
  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminRoute) {
    // Lire le cookie admin_session (uid:role) ou admin_token (Firebase JWT)
    const sessionToken = request.cookies.get('admin_session')?.value;
    const jwtToken     = request.cookies.get('admin_token')?.value;

    let uid  = '';
    let role = '';

    if (sessionToken) {
      // Format : "uid:role"
      const parts = sessionToken.split(':');
      uid  = parts[0] || '';
      role = parts[1] || '';
    } else if (jwtToken) {
      const claims = decodeJWTPayload(jwtToken);
      if (claims) {
        const exp = claims.exp as number;
        if (!exp || Date.now() / 1000 <= exp) {
          uid  = ((claims.user_id || claims.sub) as string) || '';
          role = (claims.role as string) || '';
        }
      }
    }

    // Pas de session valide → redirection vers login
    if (!uid || !role || !ADMIN_ROLES.includes(role)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Non autorisé. Connexion requise.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ── Restrictions Super Admin uniquement ──────────────────────────────
    // Paramètres système et création de comptes équipe
    const isSuperAdminOnly = SUPER_ADMIN_ONLY.some(p => pathname.startsWith(p));
    if (isSuperAdminOnly && role !== 'super_admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Réservé au Super Admin.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // ── Restrictions Dispatcher ──────────────────────────────────────────
    // Accès : Dashboard, Commandes, Dispatch/Tracking, Chauffeurs
    // Interdit : Support, Clients, Stores, Promotions, Zones, Settings, Users
    if (role === 'dispatcher') {
      const allowed = DISPATCHER_ALLOWED.some(p => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { ok: false, error: 'Accès refusé pour le rôle Dispatcher.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    // ── Restrictions Agent Support ───────────────────────────────────────
    // Accès : Dashboard, Support/Tickets uniquement
    // Interdit : Commandes, Dispatch, Chauffeurs, Clients, Stores, etc.
    if (role === 'agent') {
      const allowed = AGENT_ALLOWED.some(p => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { ok: false, error: 'Accès refusé pour le rôle Agent Support.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  // 4. Protection des routes store (/store/* et /api/store/*)
  const isStoreRoute =
    pathname.startsWith('/store') || pathname.startsWith('/api/store');

  if (isStoreRoute && pathname !== '/store-login') {
    // Lire le cookie store_session (uid:role:storeId) ou admin_session
    const storeSession = request.cookies.get('store_session')?.value;
    const adminSession = request.cookies.get('admin_session')?.value;
    const jwtToken     = request.cookies.get('admin_token')?.value;

    let uid   = '';
    let role  = '';

    if (storeSession) {
      const parts = storeSession.split(':');
      uid  = parts[0] || '';
      role = parts[1] || '';
    } else if (adminSession) {
      const parts = adminSession.split(':');
      uid  = parts[0] || '';
      role = parts[1] || '';
    } else if (jwtToken) {
      const claims = decodeJWTPayload(jwtToken);
      if (claims) {
        uid  = ((claims.user_id || claims.sub) as string) || '';
        role = (claims.role as string) || '';
      }
    }

    if (!uid || !STORE_ROLES.includes(role)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Non autorisé. Connexion store requise.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/store-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
