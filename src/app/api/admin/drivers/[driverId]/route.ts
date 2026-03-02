import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
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
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const driverDoc = await adminDb.collection("driver_profiles").doc(driverId).get();

    if (!driverDoc.exists) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const driver = { id: driverDoc.id, ...serializeDoc(driverDoc.data()!) };

    // Get vehicle
    const vehicleSnap = await adminDb
      .collection("driver_vehicles")
      .where("driverId", "==", driverId)
      .limit(1)
      .get();
    const vehicle = vehicleSnap.empty
      ? null
      : { id: vehicleSnap.docs[0].id, ...serializeDoc(vehicleSnap.docs[0].data()) };

    // Get documents
    const docsSnap = await adminDb
      .collection("driver_documents")
      .where("driverId", "==", driverId)
      .get();
    const documents = docsSnap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));

    // Get recent orders (last 10)
    const ordersSnap = await adminDb
      .collection("orders")
      .where("driverId", "==", driverId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const recentOrders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    // Get zone
    let zone = null;
    if ((driver as Record<string, unknown>).zoneId) {
      const zoneDoc = await adminDb
        .collection("zones")
        .doc((driver as Record<string, unknown>).zoneId as string)
        .get();
      if (zoneDoc.exists) {
        zone = { id: zoneDoc.id, ...serializeDoc(zoneDoc.data()!) };
      }
    }

    return NextResponse.json({ driver, vehicle, documents, recentOrders, zone });
  } catch (error) {
    console.error("GET driver detail error:", error);
    return NextResponse.json({ error: "Failed to fetch driver" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await req.json();

    const allowedFields = [
      "applicationStatus", "verificationStatus", "status",
      "isOnline", "availabilityStatus", "zoneId", "zoneName",
      "notes", "suspensionReason",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedAt = FieldValue.serverTimestamp();

    await adminDb.collection("driver_profiles").doc(driverId).update(updates);

    return NextResponse.json({ success: true, driverId, updates });
  } catch (error) {
    console.error("PATCH driver error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}
