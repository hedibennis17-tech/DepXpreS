export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = { id: orderDoc.id, ...serializeDoc(orderDoc.data()!) };

    // Fetch payment
    const paymentSnap = await adminDb
      .collection("payments")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();
    const payment = paymentSnap.empty
      ? null
      : { id: paymentSnap.docs[0].id, ...serializeDoc(paymentSnap.docs[0].data()) };

    // Fetch client profile
    let client = null;
    if ((order as Record<string, unknown>).clientId) {
      const clientDoc = await adminDb
        .collection("client_profiles")
        .doc((order as Record<string, unknown>).clientId as string)
        .get();
      if (clientDoc.exists) {
        client = { id: clientDoc.id, ...serializeDoc(clientDoc.data()!) };
      }
    }

    // Fetch driver profile
    let driver = null;
    if ((order as Record<string, unknown>).driverId) {
      const driverDoc = await adminDb
        .collection("driver_profiles")
        .doc((order as Record<string, unknown>).driverId as string)
        .get();
      if (driverDoc.exists) {
        driver = { id: driverDoc.id, ...serializeDoc(driverDoc.data()!) };
      }
    }

    // Fetch store
    let store = null;
    if ((order as Record<string, unknown>).storeId) {
      const storeDoc = await adminDb
        .collection("stores")
        .doc((order as Record<string, unknown>).storeId as string)
        .get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...serializeDoc(storeDoc.data()!) };
      }
    }

    // Fetch zone
    let zone = null;
    if ((order as Record<string, unknown>).zoneId) {
      const zoneDoc = await adminDb
        .collection("zones")
        .doc((order as Record<string, unknown>).zoneId as string)
        .get();
      if (zoneDoc.exists) {
        zone = { id: zoneDoc.id, ...serializeDoc(zoneDoc.data()!) };
      }
    }

    return NextResponse.json({ order, payment, client, driver, store, zone });
  } catch (error) {
    console.error("GET /api/admin/orders/[orderId] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    const body = await req.json();
    const { driverId, driverName, status, ...rest } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
      ...rest,
    };
    if (driverId)    updateData.driverId   = driverId;
    if (driverName)  updateData.driverName = driverName;
    if (status)      updateData.status     = status;
    if (status === "assigned") updateData.assignedAt = new Date();

    await adminDb.collection("orders").doc(orderId).update(updateData);

    // Notif chauffeur
    if (driverId && status === "assigned") {
      const { FieldValue } = await import("firebase-admin/firestore");
      await adminDb.collection("notifications").add({
        userId: driverId, userType: "driver", type: "new_order",
        title: "🚗 Nouvelle commande assignée",
        body: `Une commande vous a été assignée. Ouvrez l'app pour accepter.`,
        orderId, read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
