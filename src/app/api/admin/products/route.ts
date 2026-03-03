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
    await requirePermission(req, "stores.write");

    const body = await req.json();
    const {
      name,
      categoryId,
      storeId,
      price,
      stock,
      description,
      requiresAgeVerification = false,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { ok: false, error: "name and price required" },
        { status: 400 }
      );
    }

    const productRef = await adminDb.collection("products").add({
      name,
      categoryId,
      storeId,
      price,
      stock: stock || 0,
      description,
      requiresAgeVerification,
      isActive: true,
      totalSold: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, productId: productRef.id });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission(req, "stores.write");

    const body = await req.json();
    const { productId, updates } = body;

    if (!productId || !updates) {
      return NextResponse.json(
        { ok: false, error: "productId and updates required" },
        { status: 400 }
      );
    }

    await adminDb.collection("products").doc(productId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
