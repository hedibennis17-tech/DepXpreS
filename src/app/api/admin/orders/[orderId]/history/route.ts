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
      .collection("status_history")
      .orderBy("createdAt", "asc")
      .get();

    const history = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));
    return NextResponse.json({ history });
  } catch (error) {
    console.error("GET history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
