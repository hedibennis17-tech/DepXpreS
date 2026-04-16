export const runtime = "nodejs";

/**
 * POST /api/admin/products/upload
 * Upload une image vers Firebase Storage côté serveur (bypass CORS)
 * Retourne l'URL publique de téléchargement
 */
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { handleAuthError, requirePermission } from "@/lib/auth/auth-guards";

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!saStr) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY non défini");
  return admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(saStr) as admin.ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-1471071484-26917.firebasestorage.app",
  });
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "stores.write");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Aucun fichier reçu." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "Fichier trop lourd (max 5 Mo)." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Type de fichier non supporté." }, { status: 400 });
    }

    const app = getAdminApp();
    const bucket = admin.storage(app).bucket();

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    });

    // URL publique directe
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({ ok: true, imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return handleAuthError(error);
  }
}
