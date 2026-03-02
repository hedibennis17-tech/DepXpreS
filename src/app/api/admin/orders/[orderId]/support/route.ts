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
      .collection("support_tickets")
      .where("orderId", "==", orderId)
      .get();

    const tickets = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET support error:", error);
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 });
  }
}
