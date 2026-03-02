/**
 * middleware.ts — Protection des routes DepXpreS
 * Vérification du cookie admin_session (Firebase ID token)
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
    const sessionToken = request.cookies.get('admin_session')?.value;

    // Pas de session → redirection vers login
    if (!sessionToken) {
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

    // Décoder le cookie (format: "uid:role" — simple, léger, sans vérification Firebase ici)
    // La vérification complète du token Firebase est faite dans les route handlers via requirePermission()
    try {
      const [uid, role] = sessionToken.split(':');

      if (!uid || !role || !ADMIN_ROLES.includes(role)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { ok: false, error: 'Session invalide ou rôle insuffisant.' },
            { status: 403 }
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

    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Session corrompue.' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
