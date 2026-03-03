import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  ADMIN_ROLES,
  type RoleKey,
  type PermissionKey,
  roleHasPermission,
} from "./roles-permissions";

export interface AuthUser {
  uid: string;
  email: string;
  role: RoleKey;
  status: string;
  displayName: string;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

function getCookieToken(req: NextRequest): string | null {
  return req.cookies.get("admin_token")?.value ?? null;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser> {
  const idToken = getBearerToken(req) || getCookieToken(req);

  if (!idToken) {
    throw new AuthError("Non autorisé. Token admin manquant.", 401);
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    throw new AuthError("Token admin invalide ou expiré.", 401);
  }

  const userDoc = await adminDb.collection("app_users").doc(decoded.uid).get();
  if (!userDoc.exists) {
    throw new AuthError("Utilisateur introuvable.", 404);
  }

  const userData = userDoc.data() ?? {};
  const role = ((decoded.role as string) ||
    (userData.primary_role as string) ||
    (userData.role as string) ||
    "") as RoleKey;

  if (!role || !ADMIN_ROLES.includes(role)) {
    throw new AuthError("Accès réservé aux administrateurs.", 403);
  }

  const status = (userData.status as string) || "active";
  if (["blocked", "suspended", "deleted"].includes(status)) {
    throw new AuthError("Compte suspendu ou bloqué.", 403);
  }

  const firstName = (userData.first_name as string) || "";
  const lastName = (userData.last_name as string) || "";
  const displayName =
    (userData.display_name as string) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (decoded.name as string) ||
    "";

  return {
    uid: decoded.uid,
    email: (decoded.email as string) || (userData.email as string) || "",
    role,
    status,
    displayName,
  };
}

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

export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!ADMIN_ROLES.includes(user.role)) {
    throw new AuthError("Accès réservé aux administrateurs.", 403);
  }
  return user;
}

export async function requireSuperAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (user.role !== "super_admin") {
    throw new AuthError("Accès réservé au Super Admin.", 403);
  }
  return user;
}

export function userHasPermission(role: RoleKey, permission: PermissionKey): boolean {
  return roleHasPermission(role, permission);
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.statusCode }
    );
  }

  console.error("Erreur auth inattendue:", error);
  return NextResponse.json(
    { ok: false, error: "Erreur interne du serveur." },
    { status: 500 }
  );
}
