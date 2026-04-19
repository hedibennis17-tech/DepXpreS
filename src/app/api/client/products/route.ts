export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone") || "";

    // Charger tous les produits via Admin SDK (bypass règles Firestore)
    const snap = await adminDb.collection("products").limit(100).get();
    
    const products = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || "",
          categoryName: data.categoryName || data.category || "",
          subcategoryName: data.subcategoryName || "",
          storeId: data.storeId || "",
          storeName: data.storeName || "",
          isAvailable: data.isAvailable,
          isActive: data.isActive,
        };
      })
      .filter(p => 
        p.name && p.price > 0 &&
        (p.isAvailable === true || p.isActive === true ||
         (p.isAvailable === undefined && p.isActive === undefined))
      );

    return NextResponse.json({ ok: true, products, total: products.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
