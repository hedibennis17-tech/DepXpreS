export const runtime = "nodejs";
/**
 * POST /api/admin/auth/verify
 * Vérifie si un utilisateur est admin en consultant Firestore
 * Utilisé comme fallback quand le custom claim "role" n'est pas défini
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

const ADMIN_ROLES = ["super_admin", "admin", "dispatcher", "agent"];

// Liste des super admins hardcodés (fallback ultime)
const SUPER_ADMIN_EMAILS = [
  "hedi_bennis17@gmail.com",
  "hedi@fastdep.ca",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, uid, email } = body;

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Token requis." }, { status: 400 });
    }

    // Vérifier le token Firebase
    let verifiedUid = uid;
    let verifiedEmail = email;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      verifiedUid = decoded.uid;
      verifiedEmail = decoded.email || email;
      
      // Si le token a déjà un rôle valide dans les custom claims
      const claimRole = (decoded as Record<string, unknown>).role as string;
      if (claimRole && ADMIN_ROLES.includes(claimRole)) {
        return NextResponse.json({ ok: true, role: claimRole, uid: verifiedUid });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Token invalide." }, { status: 401 });
    }

    // Vérifier dans Firestore collection "app_users"
    try {
      const userDoc = await adminDb.collection("app_users").doc(verifiedUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const role = userData?.primary_role || userData?.role || "";
        if (role && ADMIN_ROLES.includes(role)) {
          // Définir le custom claim pour les prochaines connexions
          await adminAuth.setCustomUserClaims(verifiedUid, { role });
          return NextResponse.json({ ok: true, role, uid: verifiedUid });
        }
      }
    } catch {
      // Continuer avec le fallback
    }

    // Vérifier dans Firestore collection "admins"
    try {
      const adminQuery = await adminDb.collection("admins")
        .where("uid", "==", verifiedUid)
        .limit(1)
        .get();
      if (!adminQuery.empty) {
        const adminData = adminQuery.docs[0].data();
        const role = adminData?.role || "admin";
        if (ADMIN_ROLES.includes(role)) {
          await adminAuth.setCustomUserClaims(verifiedUid, { role });
          return NextResponse.json({ ok: true, role, uid: verifiedUid });
        }
      }
    } catch {
      // Continuer avec le fallback
    }

    // Fallback : vérifier l'email dans la liste des super admins hardcodés
    if (verifiedEmail && SUPER_ADMIN_EMAILS.includes(verifiedEmail.toLowerCase())) {
      const role = "super_admin";
      // Définir le custom claim automatiquement
      try {
        await adminAuth.setCustomUserClaims(verifiedUid, { role });
      } catch {
        // Ignorer l'erreur de définition du claim
      }
      return NextResponse.json({ ok: true, role, uid: verifiedUid });
    }

    return NextResponse.json({
      ok: false,
      error: "Accès refusé. Ce compte n'a pas les droits d'administration.",
    }, { status: 403 });

  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json({ ok: false, error: "Erreur de vérification." }, { status: 500 });
  }
}
