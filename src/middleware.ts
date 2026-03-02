import { NextRequest, NextResponse } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/driver/login',
  '/driver/signup',
  '/api/auth/client/signup',
  '/api/auth/driver/signup',
  '/api/auth/login',
  '/api/address/search',
  '/api/address/resolve',
  '/api/address/reverse',
];

// Routes admin protégées
const ADMIN_ROUTES = ['/admin', '/api/admin'];

// Rôles autorisés à accéder au dashboard admin
const ADMIN_ROLES = ['super_admin', 'admin', 'dispatcher', 'agent'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes publiques
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Laisser passer les assets statiques et Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Protection des routes admin
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
    // Vérifier le cookie de session admin
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (!sessionCookie) {
      // Rediriger vers le login admin
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non autorisé. Connexion requise.' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier le rôle dans le cookie (format: "uid:role")
    try {
      const [, role] = sessionCookie.split(':');
      if (!role || !ADMIN_ROLES.includes(role)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Accès refusé. Rôle insuffisant.' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Restrictions spécifiques par rôle
      // Seul super_admin peut accéder à /admin/users/create et /api/admin/users (POST)
      if (pathname === '/admin/users/create' || pathname === '/admin/users') {
        if (role !== 'super_admin' && role !== 'admin') {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Accès refusé. Réservé au super admin.' }, { status: 403 });
          }
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }

      // Dispatcher: accès limité
      if (role === 'dispatcher') {
        const allowedPaths = [
          '/admin/dashboard',
          '/admin/orders',
          '/admin/drivers',
          '/admin/dispatch',
          '/admin/tracking',
          '/api/admin/orders',
          '/api/admin/drivers',
          '/api/admin/dispatch',
        ];
        const isAllowed = allowedPaths.some(p => pathname.startsWith(p));
        if (!isAllowed) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
          }
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }

      // Agent: accès limité au support
      if (role === 'agent') {
        const allowedPaths = [
          '/admin/dashboard',
          '/admin/support',
          '/admin/tickets',
          '/api/admin/support',
          '/api/admin/tickets',
        ];
        const isAllowed = allowedPaths.some(p => pathname.startsWith(p));
        if (!isAllowed) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
          }
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Session invalide.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
