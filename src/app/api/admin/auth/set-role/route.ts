export const runtime = "nodejs";
/**
 * POST /api/admin/auth/set-role
 * Définit le custom claim "role" sur un compte Firebase Auth
 * Utilisé pour initialiser les comptes super_admin
 * Protégé par une clé secrète (ADMIN_SETUP_KEY)
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, role, setupKey } = body;

    // Vérification de la clé secrète de setup
    const expectedKey = process.env.ADMIN_SETUP_KEY || "fastdep-setup-2024";
    if (setupKey !== expectedKey) {
      return NextResponse.json({ error: "Clé de setup invalide." }, { status: 403 });
    }

    if (!uid && !email) {
      return NextResponse.json({ error: "uid ou email requis." }, { status: 400 });
    }

    const validRoles = ["super_admin", "admin", "dispatcher", "agent"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: `Rôle invalide. Valeurs acceptées: ${validRoles.join(", ")}` }, { status: 400 });
    }

    let targetUid = uid;

    // Si on a un email, chercher l'UID correspondant
    if (!targetUid && email) {
      const user = await adminAuth.getUserByEmail(email);
      targetUid = user.uid;
    }

    // Définir le custom claim
    await adminAuth.setCustomUserClaims(targetUid, { role });

    // Récupérer les infos de l'utilisateur pour confirmation
    const user = await adminAuth.getUser(targetUid);

    return NextResponse.json({
      ok: true,
      message: `Rôle "${role}" défini avec succès pour ${user.email}`,
      uid: targetUid,
      email: user.email,
      role,
    });
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e.code === "auth/user-not-found") {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    console.error("set-role error:", error);
    return NextResponse.json({ error: "Erreur lors de la définition du rôle." }, { status: 500 });
  }
}
