export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getAdminBucket } from "@/lib/firebase-admin";

function isAdmin(req: NextRequest) {
  const role = req.cookies.get("admin_role")?.value;
  const token = req.cookies.get("admin_token")?.value;
  const storeSession = req.cookies.get("store_session")?.value;
  return (role && ["super_admin","admin"].includes(role)) || !!token || !!storeSession;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok:false, error:"Non autorisé" }, { status:401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ ok:false, error:"Aucun fichier" }, { status:400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok:false, error:"Max 5 Mo" }, { status:400 });

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ ok:false, error:"Format non supporté" }, { status:400 });
    }

    // Nom de fichier sans caractères spéciaux
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload via bucket admin
    const bucket = getAdminBucket();
    const fileRef = bucket.file(path);

    // Générer un token pour l'accès public via firebasestorage.googleapis.com
    const downloadToken = crypto.randomUUID();

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
      resumable: false,
    });

    const bucketName = bucket.name;
    const encodedPath = encodeURIComponent(path);
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return NextResponse.json({ ok:true, imageUrl });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload] ERROR:", msg);
    return NextResponse.json({ ok:false, error: `Upload: ${msg}` }, { status:500 });
  }
}
