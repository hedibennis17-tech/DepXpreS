export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Test 1: tous les produits sans filtre
    const snap = await adminDb.collection("products").limit(50).get();
    
    const docs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        price: data.price,
        storeId: data.storeId || "❌ manquant",
        isAvailable: data.isAvailable,
        isActive: data.isActive,
        categoryName: data.categoryName || "❌ manquant",
      };
    });

    return NextResponse.json({ 
      total: snap.size, 
      avecStoreId: docs.filter(d => d.storeId !== "❌ manquant").length,
      avecCategorie: docs.filter(d => d.categoryName !== "❌ manquant").length,
      docs 
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
