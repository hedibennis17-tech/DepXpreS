export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminBucket } from "@/lib/firebase-admin";

function isAdmin(req: NextRequest) {
  const role = req.cookies.get("admin_role")?.value;
  const token = req.cookies.get("admin_token")?.value;
  return (role && ["super_admin","admin"].includes(role)) || !!token;
}

// POST /api/admin/products/upload
// Reçoit { fileName, contentType } → retourne une signed URL valide 15 min
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false, error:"Non autorisé" }, { status:401 });

  try {
    const body = await req.json().catch(() => null);
    const { fileName, contentType } = body || {};

    if (!fileName || !contentType) {
      return NextResponse.json({ ok:false, error:"fileName et contentType requis" }, { status:400 });
    }

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
    if (!allowed.includes(contentType)) {
      return NextResponse.json({ ok:false, error:"Format non supporté" }, { status:400 });
    }

    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
    const bucket = getAdminBucket();
    const fileRef = bucket.file(path);

    const [signedUrl] = await fileRef.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 min
      contentType,
    });

    // URL publique de lecture après upload
    const bucketName = bucket.name;
    const encodedPath = encodeURIComponent(path);
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

    return NextResponse.json({ ok:true, signedUrl, imageUrl, path });
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload]", msg);
    return NextResponse.json({ ok:false, error:msg }, { status:500 });
  }
}
