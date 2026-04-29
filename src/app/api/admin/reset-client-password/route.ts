export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    if (!email || !newPassword) return NextResponse.json({ error: "email + newPassword requis" }, { status: 400 });
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { password: newPassword });
    // Créer/updater le profil client dans Firestore
    const ref = adminDb.collection("app_users").doc(user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ uid: user.uid, email, display_name: email.split("@")[0], role: "client", createdAt: new Date().toISOString() });
    } else {
      await ref.update({ role: snap.data()?.role || "client" });
    }
    return NextResponse.json({ success: true, uid: user.uid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
