export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const ADMIN_ROLES = ["super_admin", "admin", "dispatcher", "agent"] as const;
const SUPER_ADMIN_EMAILS = ["hedi_bennis17@gmail.com", "hedibennis17@gmail.com", "hedi@fastdep.ca"];

function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeSeconds,
    path: "/",
  };
}

async function resolveAdminRole(decoded: { uid: string; email?: string; role?: string }) {
  const claimRole = decoded.role;
  if (claimRole && ADMIN_ROLES.includes(claimRole as (typeof ADMIN_ROLES)[number])) {
    return claimRole;
  }

  const userDoc = await adminDb.collection("app_users").doc(decoded.uid).get();
  if (userDoc.exists) {
    const data = userDoc.data() ?? {};
    const role = (data.primary_role as string) || (data.role as string) || "";
    if (role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      try {
        await adminAuth.setCustomUserClaims(decoded.uid, { role });
      } catch {}
      return role;
    }
  }

  const adminQuery = await adminDb
    .collection("admins")
    .where("uid", "==", decoded.uid)
    .limit(1)
    .get();

  if (!adminQuery.empty) {
    const role = (adminQuery.docs[0]?.data()?.role as string) || "admin";
    if (ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      try {
        await adminAuth.setCustomUserClaims(decoded.uid, { role });
        await adminDb.collection("app_users").doc(decoded.uid).set({
          role, primary_role: role, status: "active", updatedAt: new Date(),
        }, { merge: true });
      } catch {}
      return role;
    }
  }

  const email = (decoded.email || "").toLowerCase();
  if (email && SUPER_ADMIN_EMAILS.includes(email)) {
    try {
      await adminAuth.setCustomUserClaims(decoded.uid, { role: "super_admin" });
    } catch {}
    return "super_admin";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken = typeof body?.idToken === "string" ? body.idToken : "";

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Token requis." }, { status: 400 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken, true);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Token admin invalide ou expiré." },
        { status: 401 }
      );
    }

    const role = await resolveAdminRole({
      uid: decoded.uid,
      email: decoded.email,
      role: (decoded as Record<string, unknown>).role as string | undefined,
    });

    if (!role) {
      return NextResponse.json(
        { ok: false, error: "Accès refusé. Ce compte n'a pas les droits d'administration." },
        { status: 403 }
      );
    }

    const displayName = (decoded.name as string) || "";
    const firstName = displayName.split(" ")[0] || "";
    const lastName = displayName.split(" ").slice(1).join(" ") || "";

    const response = NextResponse.json(
      {
        ok: true,
        uid: decoded.uid,
        role,
        email: decoded.email || "",
        displayName,
        firstName,
        lastName,
      },
      { status: 200 }
    );

    response.cookies.set("admin_token", idToken, getCookieOptions(55 * 60));
    // Cookie séparé pour le rôle — lisible par le middleware sans décoder le JWT
    response.cookies.set("admin_role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 55 * 60,
      path: "/",
    });
    response.cookies.delete("admin_session");
    response.cookies.delete("admin_session_mw");
    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur d'authentification." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, message: "Déconnexion réussie." });
  response.cookies.delete("admin_token");
  response.cookies.delete("admin_role");
  response.cookies.delete("admin_session");
  response.cookies.delete("admin_session_mw");
  return response;
}
