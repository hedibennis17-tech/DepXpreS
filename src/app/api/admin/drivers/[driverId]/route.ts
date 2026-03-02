import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Serialise les timestamps Firestore en ISO strings
function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      result[key] = (value as { toDate: () => Date }).toDate().toISOString();
    } else if (value && typeof value === "object" && "_seconds" in value) {
      result[key] = new Date((value as { _seconds: number })._seconds * 1000).toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

type SerializedDoc = Record<string, unknown> & { id: string };

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

    const driver: SerializedDoc = { id: driverDoc.id, ...serializeDoc(driverDoc.data()!) };

    // Véhicule
    const vehicleSnap = await adminDb
      .collection("driver_vehicles")
      .where("driverId", "==", driverId)
      .limit(1)
      .get();
    const vehicle: SerializedDoc | null = vehicleSnap.empty
      ? null
      : { id: vehicleSnap.docs[0].id, ...serializeDoc(vehicleSnap.docs[0].data() as Record<string, unknown>) };

    // Documents
    const docsSnap = await adminDb
      .collection("driver_documents")
      .where("driverId", "==", driverId)
      .get();
    const documents: SerializedDoc[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data() as Record<string, unknown>),
    }));

    // Commandes récentes (sans orderBy pour éviter l'index composite)
    const ordersSnap = await adminDb
      .collection("orders")
      .where("driverId", "==", driverId)
      .limit(20)
      .get();
    const recentOrders: SerializedDoc[] = ordersSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...serializeDoc(doc.data() as Record<string, unknown>),
      }))
      .sort((a, b) => {
        const aDate = typeof (a as Record<string, unknown>).createdAt === "string" ? new Date((a as Record<string, unknown>).createdAt as string).getTime() : 0;
        const bDate = typeof (b as Record<string, unknown>).createdAt === "string" ? new Date((b as Record<string, unknown>).createdAt as string).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 10);

    // Zone
    let zone: SerializedDoc | null = null;
    const zoneId = driver.zoneId;
    if (typeof zoneId === "string" && zoneId) {
      const zoneDoc = await adminDb.collection("zones").doc(zoneId).get();
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

    await adminDb.collection("driver_profiles").doc(driverId).update(
      updates as { [key: string]: unknown }
    );

    return NextResponse.json({ success: true, driverId, updates: Object.keys(updates) });
  } catch (error) {
    console.error("PATCH driver error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    
    // Désactiver le compte plutôt que de supprimer
    await adminDb.collection("driver_profiles").doc(driverId).update({
      applicationStatus: "rejected",
      isOnline: false,
      availabilityStatus: "offline",
      deletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    } as { [key: string]: unknown });

    return NextResponse.json({ success: true, driverId });
  } catch (error) {
    console.error("DELETE driver error:", error);
    return NextResponse.json({ error: "Failed to deactivate driver" }, { status: 500 });
  }
}
