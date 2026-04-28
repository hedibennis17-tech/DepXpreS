export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // 1. Essayer la sous-collection items d'abord
    const subSnap = await adminDb
      .collection("orders")
      .doc(orderId)
      .collection("items")
      .get();

    if (!subSnap.empty) {
      const items = subSnap.docs.map(d => ({ id: d.id, ...serializeDoc(d.data()) }));
      return NextResponse.json({ items });
    }

    // 2. Fallback: lire le champ items[] du doc principal
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ items: [] });

    const data = orderDoc.data() as any;
    const items = (data.items || []).map((item: any, idx: number) => ({
      id: `item_${idx}`,
      ...item,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
