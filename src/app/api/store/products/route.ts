export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function isStore(req: NextRequest) {
  const session = req.cookies.get("store_session")?.value;
  const role = req.cookies.get("admin_role")?.value;
  return !!session || (!!role && ["super_admin","admin"].includes(role));
}

export async function POST(req: NextRequest) {
  if (!isStore(req)) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const { storeId, name, price, description, stock, categoryId, categoryName,
            subcategoryId, subcategoryName, requiresAgeVerification, isAvailable, imageUrl } = body;
    if (!name || price === undefined) return NextResponse.json({ ok: false, error: "name et price requis" }, { status: 400 });
    const payload: Record<string, unknown> = {
      storeId, name: String(name), price: Number(price),
      stock: Number(stock) || 0,
      description: description || "",
      isAvailable: isAvailable !== false,
      requiresAgeVerification: !!requiresAgeVerification,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (categoryId) { payload.categoryId = categoryId; payload.categoryName = categoryName || ""; }
    if (subcategoryId) { payload.subcategoryId = subcategoryId; payload.subcategoryName = subcategoryName || ""; }
    if (imageUrl) payload.imageUrl = imageUrl;
    const ref = await adminDb.collection("products").add(payload);
    return NextResponse.json({ ok: true, productId: ref.id });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isStore(req)) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  try {
    const { productId, updates } = await req.json();
    if (!productId) return NextResponse.json({ ok: false, error: "productId requis" }, { status: 400 });
    const clean: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const [k, v] of Object.entries(updates || {})) {
      if (v !== undefined) clean[k] = v;
    }
    await adminDb.collection("products").doc(productId).update(clean);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
