export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ ok: false, error: "Token requis" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection("app_users").doc(uid).get();
    if (!userDoc.exists) return NextResponse.json({ ok: false, error: "Compte introuvable." }, { status: 404 });

    const userData = userDoc.data()!;
    const role = userData.role || "";

    if (!["store_owner", "store_manager", "super_admin"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Accès refusé. Ce portail est réservé aux commercants partenaires." }, { status: 403 });
    }

    const storeId = userData.storeId || uid;
    const storeName = userData.storeName || "";

    // Vérifier statut du store
    let storeStatus = "pending";
    try {
      const storeDoc = await adminDb.collection("stores").doc(storeId).get();
      if (storeDoc.exists) storeStatus = storeDoc.data()?.status || "pending";
    } catch {}

    const res = NextResponse.json({
      ok: true, uid, role, storeId, storeName, storeStatus
    });

    // Set cookie httpOnly pour le middleware
    res.cookies.set("store_session", `${uid}:${role}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 55 * 60,
      path: "/",
    });

    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("store_session");
  return res;
}
