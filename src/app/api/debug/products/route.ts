export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snap = await adminDb.collection("products").limit(20).get();
    const docs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        price: data.price,
        storeId: data.storeId,
        storeName: data.storeName,
        isAvailable: data.isAvailable,
        isActive: data.isActive,
        categoryName: data.categoryName,
        imageUrl: data.imageUrl ? "✅ oui" : "❌ non",
      };
    });
    return NextResponse.json({ total: snap.size, docs });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
