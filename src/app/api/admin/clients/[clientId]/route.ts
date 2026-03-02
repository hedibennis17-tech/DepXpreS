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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const clientDoc = await adminDb.collection("client_profiles").doc(clientId).get();

    if (!clientDoc.exists) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = { id: clientDoc.id, ...serializeDoc(clientDoc.data()!) };

    // Get wallet
    const walletSnap = await adminDb
      .collection("wallets")
      .where("userId", "==", clientId)
      .limit(1)
      .get();
    const wallet = walletSnap.empty
      ? null
      : { id: walletSnap.docs[0].id, ...serializeDoc(walletSnap.docs[0].data()) };

    // Get recent orders
    const ordersSnap = await adminDb
      .collection("orders")
      .where("clientId", "==", clientId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const recentOrders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    // Get addresses
    const addressesSnap = await adminDb
      .collection("client_addresses")
      .where("clientId", "==", clientId)
      .get();
    const addresses = addressesSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    return NextResponse.json({ client, wallet, recentOrders, addresses });
  } catch (error) {
    console.error("GET client detail error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();

    const allowedFields = ["status", "notes", "isEmailVerified", "isPhoneVerified"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await adminDb.collection("client_profiles").doc(clientId).update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH client error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
