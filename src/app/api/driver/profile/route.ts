export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, ...updates } = body;
    if (!uid) return NextResponse.json({ error: "uid requis" }, { status: 400 });

    // Mettre à jour driver_profiles
    await adminDb.collection("driver_profiles").doc(uid).set({
      ...updates,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Mettre à jour app_users aussi
    if (updates.phone || updates.photoUrl) {
      await adminDb.collection("app_users").doc(uid).set({
        ...(updates.phone ? { phone: updates.phone } : {}),
        ...(updates.photoUrl ? { photoUrl: updates.photoUrl } : {}),
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
