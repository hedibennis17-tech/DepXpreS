export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleAuthError, requirePermission } from "@/lib/auth/auth-guards";
import { getAdminBucket } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "stores.write");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ ok: false, error: "Aucun fichier reçu." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Fichier trop lourd (max 5 Mo)." }, { status: 400 });

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Format non supporté (JPG, PNG, WEBP)." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = getAdminBucket();
    const fileRef = bucket.file(fileName);

    // Sauvegarder SANS public:true (évite les erreurs ACL/IAM)
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    // Rendre le fichier accessible publiquement via Firebase Storage rules
    // URL format standard Firebase Storage (pas besoin de makePublic)
    const bucketName = bucket.name;
    const encodedPath = encodeURIComponent(fileName);
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

    return NextResponse.json({ ok: true, imageUrl });

  } catch (error) {
    console.error("[upload] error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: `Erreur upload: ${msg}` }, { status: 500 });
  }
}
