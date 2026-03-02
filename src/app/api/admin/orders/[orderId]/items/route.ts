import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const snap = await adminDb
      .collection("orders")
      .doc(orderId)
      .collection("items")
      .get();

    const items = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
