export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAdminBucket } from "@/lib/firebase-admin";

function isAdminRequest(req: NextRequest): boolean {
  // Vérifier le cookie admin_role (set par le login)
  const adminRole = req.cookies.get("admin_role")?.value;
  if (adminRole && ["super_admin", "admin"].includes(adminRole)) return true;

  // Fallback: vérifier admin_token cookie existe
  const adminToken = req.cookies.get("admin_token")?.value;
  return !!adminToken;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
    }

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

    console.log("[upload] Getting bucket...");
    const bucket = getAdminBucket();
    console.log("[upload] Bucket name:", bucket.name);
    const fileRef = bucket.file(fileName);

    console.log("[upload] Saving file:", fileName);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    console.log("[upload] File saved OK");
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
