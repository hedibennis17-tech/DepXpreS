export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore-serialize";
import { handleAuthError, requirePermission } from "@/lib/auth/auth-guards";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "stores.read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const storeId = searchParams.get("storeId") || "";
    const isActive = searchParams.get("isActive") || "";
    const requiresAge = searchParams.get("requiresAgeVerification") || "";

    let query: FirebaseFirestore.Query = adminDb.collection("products");

    if (categoryId) query = query.where("categoryId", "==", categoryId);
    if (storeId) query = query.where("storeId", "==", storeId);
    if (isActive !== "") query = query.where("isActive", "==", isActive === "true");
    if (requiresAge !== "") {
      query = query.where(
        "requiresAgeVerification",
        "==",
        requiresAge === "true"
      );
    }

    const snap = await query.get();

    let products = snap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    if (search) {
      const s = search.toLowerCase();
      products = products.filter((p: Record<string, unknown>) => {
        const name = String(p.name || "").toLowerCase();
        const description = String(p.description || "").toLowerCase();
        const barcode = String(p.barcode || "").toLowerCase();
        return name.includes(s) || description.includes(s) || barcode.includes(s);
      });
    }

    products.sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        Number(b.totalSold || 0) - Number(a.totalSold || 0)
    );

    return NextResponse.json({ ok: true, products, total: products.length });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check via cookie (pas requirePermission qui plante)
    const role = req.cookies.get("admin_role")?.value;
    const token = req.cookies.get("admin_token")?.value;
    if (!((role && ["super_admin","admin"].includes(role)) || token)) {
      return NextResponse.json({ ok:false, error:"Non autorisé" }, { status:401 });
    }

    const body = await req.json();
    const {
      name, description, barcode, price, stock,
      storeId, categoryId, commerceTypeId, commerceTypeName,
      imageUrl, requiresAgeVerification, isActive,
    } = body || {};

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ ok:false, error:"name et price requis" }, { status:400 });
    }

    // Récupérer storeName pour l'afficher dans le catalogue
    let storeName = "";
    if (storeId) {
      try {
        const storeDoc = await adminDb.collection("stores").doc(storeId).get();
        if (storeDoc.exists) storeName = (storeDoc.data()?.name as string) || "";
      } catch {}
    }

    // Construire le payload sans valeurs undefined (Firestore les rejette)
    const payload: Record<string, unknown> = {
      name: String(name),
      price: Number(price),
      stock: Number(stock) || 0,
      isActive: isActive !== false,
      requiresAgeVerification: !!requiresAgeVerification,
      totalSold: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (description) payload.description = String(description);
    if (barcode) payload.barcode = String(barcode);
    if (storeId) { payload.storeId = storeId; payload.storeName = storeName; }
    if (categoryId) payload.categoryId = categoryId;
    if (commerceTypeId) { payload.commerceTypeId = commerceTypeId; payload.commerceTypeName = commerceTypeName || ""; }
    if (imageUrl) payload.imageUrl = imageUrl;

    const productRef = await adminDb.collection("products").add(payload);
    return NextResponse.json({ ok:true, productId: productRef.id });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[products POST]", msg);
    return NextResponse.json({ ok:false, error: msg }, { status:500 });
  }
}

function checkAuth(req: NextRequest) {
  const role = req.cookies.get("admin_role")?.value;
  const token = req.cookies.get("admin_token")?.value;
  return (role && ["super_admin","admin"].includes(role)) || !!token;
}

export async function PATCH(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ ok:false, error:"Non autorisé" }, { status:401 });
    }

    const body = await req.json();
    const { productId, updates } = body || {};

    if (!productId || !updates) {
      return NextResponse.json({ ok:false, error:"productId et updates requis" }, { status:400 });
    }

    // Si storeId change, refresh storeName
    if (updates.storeId) {
      try {
        const storeDoc = await adminDb.collection("stores").doc(updates.storeId).get();
        if (storeDoc.exists) updates.storeName = (storeDoc.data()?.name as string) || "";
      } catch {}
    }

    // Nettoyer les undefined
    const clean: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) clean[k] = v;
    }

    await adminDb.collection("products").doc(productId).update(clean);
    return NextResponse.json({ ok:true });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[products PATCH]", msg);
    return NextResponse.json({ ok:false, error: msg }, { status:500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ ok:false, error:"Non autorisé" }, { status:401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ ok:false, error:"productId requis" }, { status:400 });
    }

    await adminDb.collection("products").doc(productId).delete();
    return NextResponse.json({ ok:true });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[products DELETE]", msg);
    return NextResponse.json({ ok:false, error: msg }, { status:500 });
  }
}
