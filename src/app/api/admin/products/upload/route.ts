export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleAuthError, requirePermission } from "@/lib/auth/auth-guards";
import { getAdminStorage } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "stores.write");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ ok: false, error: "Aucun fichier reçu." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Fichier trop lourd (max 5 Mo)." }, { status: 400 });

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) return NextResponse.json({ ok: false, error: "Format non supporté (JPG, PNG, WEBP)." }, { status: 400 });

    const storage = getAdminStorage();
    const bucket = storage.bucket();

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return NextResponse.json({ ok: true, imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return handleAuthError(error);
  }
}
