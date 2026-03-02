import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Get order zone
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    const order = orderDoc.data();
    const zoneId = order?.zoneId;

    // Find available, approved drivers
    let query: FirebaseFirestore.Query = adminDb
      .collection("driver_profiles")
      .where("applicationStatus", "==", "approved")
      .where("verificationStatus", "==", "approved");

    const snap = await query.get();
    const drivers = snap.docs
      .map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }))
      .filter((d: Record<string, unknown>) => 
        d.isOnline === true && 
        d.availabilityStatus === "available" &&
        d.status !== "suspended"
      )
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
        ((b.rating as number) || 0) - ((a.rating as number) || 0)
      )
      .slice(0, 10);

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("GET candidate-drivers error:", error);
    return NextResponse.json({ error: "Failed to fetch candidate drivers" }, { status: 500 });
  }
}
