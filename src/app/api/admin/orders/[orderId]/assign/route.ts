import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { driverId } = body;

    if (!driverId) {
      return NextResponse.json({ error: "driverId required" }, { status: 400 });
    }

    // Validate order exists
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderDoc.data()!;

    if (["cancelled", "completed", "refunded"].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot assign driver to a ${order.status} order` },
        { status: 400 }
      );
    }

    // Validate driver
    const driverDoc = await adminDb.collection("driver_profiles").doc(driverId).get();
    if (!driverDoc.exists) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }
    const driver = driverDoc.data()!;

    if (!driver.isOnline) {
      return NextResponse.json({ error: "Driver is not online" }, { status: 400 });
    }
    if (driver.availabilityStatus !== "available") {
      return NextResponse.json({ error: "Driver is not available" }, { status: 400 });
    }

    const batch = adminDb.batch();

    // Update order
    batch.update(adminDb.collection("orders").doc(orderId), {
      driverId,
      driverName: `${driver.firstName} ${driver.lastName}`,
      status: "driver_assigned",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Add status history
    const histRef = adminDb
      .collection("orders")
      .doc(orderId)
      .collection("status_history")
      .doc();
    batch.set(histRef, {
      orderId,
      fromStatus: order.status,
      toStatus: "driver_assigned",
      changedByUserId: "admin-hedi",
      changedByType: "admin",
      note: "Chauffeur assigné manuellement depuis le panel admin",
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update driver availability
    batch.update(adminDb.collection("driver_profiles").doc(driverId), {
      currentOrderId: orderId,
      availabilityStatus: "reserved",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Add notification
    await adminDb.collection("notifications").add({
      recipientUserId: order.clientId,
      recipientRole: "client",
      channel: "in_app",
      notificationType: "order_driver_assigned",
      titleFr: "Chauffeur assigné",
      bodyFr: `Un chauffeur a été assigné à votre commande ${orderId}.`,
      payload: { orderId },
      status: "queued",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, driverId, orderId });
  } catch (error) {
    console.error("POST assign error:", error);
    return NextResponse.json({ error: "Failed to assign driver" }, { status: 500 });
  }
}
