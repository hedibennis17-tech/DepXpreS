import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/driver/login",
  "/driver/signup",
  "/admin/login",
  "/store-login",
  "/store-signup",
  "/store/pending",
  "/api/auth/client/signup",
  "/api/auth/driver/signup",
  "/api/auth/store/signup",
  "/api/auth/store/login",
  "/api/store/products",
  "/api/driver/profile",
  "/api/store/upload",
  "/api/auth/login",
  "/api/admin/auth/login",
  "/api/admin/auth/verify",
  "/api/address/search",
  "/api/address/resolve",
  "/api/address/reverse",
  "/api/admin/test",
  "/api/admin/debug",
  "/api/admin/test-notif",
  "/api/messages-store",
  "/api/admin/notify-store",
  "/api/admin/notify",
  "/api/admin/payments",
  "/api/debug/products",
  "/api/client/products",
];

const ADMIN_ROLES = ["super_admin", "admin", "dispatcher", "agent"] as const;
const STORE_ROLES = ["store_owner", "super_admin", "admin"] as const;

const DISPATCHER_ALLOWED = [
  "/admin/dashboard",
  "/admin/orders",
  "/admin/dispatch",
  "/admin/tracking",
  "/admin/drivers",
  "/api/admin/orders",
  "/api/admin/dispatch",
  "/api/admin/tracking",
  "/api/admin/drivers",
];

const AGENT_ALLOWED = [
  "/admin/dashboard",
  "/admin/support",
  "/admin/tickets",
  "/api/admin/support",
  "/api/admin/tickets",
];

const SUPER_ADMIN_ONLY = [
  "/admin/settings",
  "/admin/users/create",
  "/api/admin/settings",
];

type JwtPayload = {
  aud?: string;
  iss?: string;
  exp?: number;
  sub?: string;
  user_id?: string;
  role?: string;
};

function decodeJWTPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1]!;
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function getRoleFromAdminToken(token: string | undefined | null): string | null {
  if (!token) return null;

  const claims = decodeJWTPayload(token);
  if (!claims) return null;

  if (!claims.exp || Date.now() / 1000 > claims.exp) return null;

  const expectedProjectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-1471071484-26917";

  if (claims.aud && claims.aud !== expectedProjectId) return null;
  if (claims.iss && !claims.iss.includes("securetoken.google.com")) return null;

  return typeof claims.role === "string" ? claims.role : null;
}

function jsonUnauthorized(message: string, status = 401) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminRoute) {
    const adminToken = request.cookies.get("admin_token")?.value;
    const adminRole = request.cookies.get("admin_role")?.value;

    // Vérification: on a besoin du token ET du rôle
    // On accepte le rôle du cookie admin_role (set par l'API après vérification server-side)
    // ET on valide que le token n'est pas expiré via le JWT decode
    let role: string | null = null;

    if (adminRole && ADMIN_ROLES.includes(adminRole as (typeof ADMIN_ROLES)[number])) {
      // Si on a un admin_role cookie valide, on l'utilise directement
      // Le token Firebase est vérifié côté serveur au moment du login
      if (adminToken) {
        const claims = decodeJWTPayload(adminToken);
        const isExpired = claims && claims.exp && Date.now() / 1000 > claims.exp;
        if (!isExpired) {
          role = adminRole;
        }
      }
    } else if (adminToken) {
      // Fallback: essayer de lire le rôle depuis le JWT (pour les sessions existantes)
      role = getRoleFromAdminToken(adminToken);
    }

    if (!role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      if (pathname.startsWith("/api/")) {
        return jsonUnauthorized("Non autorisé. Session admin invalide ou expirée.");
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isSuperAdminOnly = SUPER_ADMIN_ONLY.some((p) => pathname.startsWith(p));
    if (isSuperAdminOnly && role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return jsonUnauthorized("Réservé au Super Admin.", 403);
      }
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (role === "dispatcher") {
      const allowed = DISPATCHER_ALLOWED.some((p) => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith("/api/")) {
          return jsonUnauthorized("Accès refusé pour le rôle Dispatcher.", 403);
        }
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (role === "agent") {
      const allowed = AGENT_ALLOWED.some((p) => pathname.startsWith(p));
      if (!allowed) {
        if (pathname.startsWith("/api/")) {
          return jsonUnauthorized("Accès refusé pour le rôle Agent Support.", 403);
        }
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  const isStoreRoute = pathname.startsWith("/store") || pathname.startsWith("/api/store");
  if (isStoreRoute && pathname !== "/store-login") {
    const adminToken = request.cookies.get("admin_token")?.value;
    const role = getRoleFromAdminToken(adminToken);
    const storeSession = request.cookies.get("store_session")?.value;

    let storeRole: string | null = null;
    if (storeSession) {
      const parts = storeSession.split(":");
      storeRole = parts[1] || null;
    }

    const effectiveRole = role || storeRole;

    if (!effectiveRole || !STORE_ROLES.includes(effectiveRole as (typeof STORE_ROLES)[number])) {
      if (pathname.startsWith("/api/")) {
        return jsonUnauthorized("Non autorisé. Connexion store requise.");
      }
      const loginUrl = new URL("/store-login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
