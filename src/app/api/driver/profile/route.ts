export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function getUid(req: NextRequest, bodyUid?: string): Promise<string> {
  // 1. Essayer via Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
      return decoded.uid;
    } catch {}
  }
  // 2. Fallback sur le uid du body
  return bodyUid || "";
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const uid = await getUid(req, body.uid);
    if (!uid) return NextResponse.json({ error: "uid requis" }, { status: 400 });

    const { uid: _uid, ...updates } = body;

    // S'assurer que user_id est présent dans driver_profiles
    const profileData: Record<string, unknown> = {
      ...updates,
      user_id: uid,
      updated_at: FieldValue.serverTimestamp(),
    };

    // Mettre à jour driver_profiles
    await adminDb.collection("driver_profiles").doc(uid).set(profileData, { merge: true });

    // Mettre à jour app_users
    const userUpdates: Record<string, unknown> = { updated_at: FieldValue.serverTimestamp() };
    if (updates.phone) userUpdates.phone = updates.phone;
    if (updates.photoUrl) userUpdates.photoUrl = updates.photoUrl;
    if (updates.full_name) userUpdates.display_name = updates.full_name;
    if (updates.application_status) userUpdates.application_status = updates.application_status;
    // S'assurer que le rôle est bien driver
    userUpdates.role = "driver";

    await adminDb.collection("app_users").doc(uid).set(userUpdates, { merge: true });

    return NextResponse.json({ ok: true, uid });
  } catch (e) {
    console.error("[driver/profile PATCH]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
