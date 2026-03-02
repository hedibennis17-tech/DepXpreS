/**
 * middleware.ts — Protection des routes DepXpreS
 * Vérification du cookie admin_session (uid:role) ou admin_token (Firebase JWT)
 * Restrictions par rôle : super_admin > admin > dispatcher > agent
 */
import { NextRequest, NextResponse } from 'next/server';

// Routes publiques — aucune vérification requise
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
];

// Rôles autorisés à accéder au dashboard admin
const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

// Chemins accessibles par le dispatcher
const DISPATCHER_ALLOWED = [
  '/admin/dashboard',
  '/admin/orders',
  '/admin/drivers',
  '/admin/dispatch',
  '/admin/tracking',
  '/api/admin/orders',
  '/api/admin/drivers',
  '/api/admin/dispatch',
  '/api/admin/tracking',
];

// Chemins accessibles par l'agent support
const AGENT_ALLOWED = [
  '/admin/dashboard',
  '/admin/support',
  '/admin/tickets',
  '/api/admin/support',
  '/api/admin/tickets',
];

// Décoder un JWT Firebase sans vérification de signature (Edge Runtime compatible)
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Ajouter le padding base64
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    // Décoder base64url → base64 → string
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Laisser passer les assets statiques et Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Laisser passer les routes publiques
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 3. Protection des routes admin (/admin/* et /api/admin/*)
  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdminRoute) {
    // Essayer d'abord le cookie admin_session (uid:role)
    const sessionToken = request.cookies.get('admin_session')?.value;
    // Ensuite essayer le cookie admin_token (Firebase JWT complet)
    const jwtToken = request.cookies.get('admin_token')?.value;

    let uid = '';
    let role = '';

    if (sessionToken) {
      // Format: "uid:role"
      try {
        const parts = sessionToken.split(':');
        uid = parts[0] || '';
        role = parts[1] || '';
      } catch {
        // Session corrompue
      }
    } else if (jwtToken) {
      // Décoder le JWT Firebase directement
      const claims = decodeJWTPayload(jwtToken);
      if (claims) {
        // Vérifier l'expiration
        const exp = claims.exp as number;
        if (!exp || Date.now() / 1000 <= exp) {
          uid = (claims.user_id || claims.sub) as string || '';
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

    // Restrictions super_admin : seul lui peut créer des comptes équipe
    if (
      (pathname === '/admin/users/create' || pathname.startsWith('/admin/users/create')) &&
      role !== 'super_admin'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Réservé au Super Admin.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Restrictions dispatcher
    if (role === 'dispatcher') {
      const allowed = DISPATCHER_ALLOWED.some(p => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { ok: false, error: 'Accès refusé pour le rôle dispatcher.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    // Restrictions agent
    if (role === 'agent') {
      const allowed = AGENT_ALLOWED.some(p => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { ok: false, error: 'Accès refusé pour le rôle agent.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
