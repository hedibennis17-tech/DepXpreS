export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getAdminBucket, adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // Vérifier via Authorization header (Firebase ID token) OU cookies
    let uid = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid;
      } catch {}
    }

    // Fallback: accepter si cookies store/admin présents
    const session = req.cookies.get("store_session")?.value;
    const role = req.cookies.get("admin_role")?.value;
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!uid && !session && !adminToken && !(role && ["super_admin","admin"].includes(role))) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "Aucun fichier" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Max 10 Mo" }, { status: 400 });

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","image/gif","application/pdf"];
    if (!allowed.includes(file.type)) return NextResponse.json({ ok: false, error: "Format non supporté" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const folder = uid ? `drivers/${uid}` : "drivers/uploads";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getAdminBucket();
    const fileRef = bucket.file(path);
    const downloadToken = crypto.randomUUID();

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
      resumable: false,
    });

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
    return NextResponse.json({ ok: true, imageUrl });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[driver/upload]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
