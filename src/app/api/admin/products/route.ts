import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function serializeDoc(data: FirebaseFirestore.DocumentData) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
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
    if (requiresAge !== "") query = query.where("requiresAgeVerification", "==", requiresAge === "true");

    const snap = await query.get();
    let products = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));

    if (search) {
      const s = search.toLowerCase();
      products = products.filter((p: Record<string, unknown>) =>
        (p.name as string)?.toLowerCase().includes(s) ||
        (p.description as string)?.toLowerCase().includes(s) ||
        (p.barcode as string)?.toLowerCase().includes(s)
      );
    }

    products.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.totalSold as number) || 0) - ((a.totalSold as number) || 0)
    );

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, storeId, price, stock, description, requiresAgeVerification = false } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "name and price required" }, { status: 400 });
    }

    const productRef = await adminDb.collection("products").add({
      name, categoryId, storeId, price, stock: stock || 0,
      description, requiresAgeVerification,
      isActive: true, totalSold: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, productId: productRef.id });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, updates } = body;

    if (!productId || !updates) {
      return NextResponse.json({ error: "productId and updates required" }, { status: 400 });
    }

    await adminDb.collection("products").doc(productId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
