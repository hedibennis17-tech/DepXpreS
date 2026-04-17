export const runtime = "nodejs";
// ENDPOINT TEMPORAIRE — À SUPPRIMER APRÈS UTILISATION
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "depxpres-fix-2026") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const OLD = "hedi_bennis17@gmail.com";
    const NEW = "hedibennis17@gmail.com";

    // Trouver l'utilisateur
    const user = await adminAuth.getUserByEmail(OLD);
    const uid = user.uid;

    // Changer l'email
    await adminAuth.updateUser(uid, { email: NEW });

    // Mettre à jour les custom claims
    await adminAuth.setCustomUserClaims(uid, { role: "super_admin" });

    // Mettre à jour Firestore
    await adminDb.collection("app_users").doc(uid).set({
      email: NEW,
      role: "super_admin",
      primary_role: "super_admin",
      status: "active",
      display_name: "Hedi Bennis",
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({
      ok: true,
      message: `Email changé: ${OLD} → ${NEW}`,
      uid,
      role: "super_admin"
    });
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
