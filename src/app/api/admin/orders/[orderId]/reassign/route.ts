import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { newDriverId, reason = "Réassignation admin" } = body;

    if (!newDriverId) {
      return NextResponse.json({ error: "newDriverId required" }, { status: 400 });
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderDoc.data()!;

    if (["cancelled", "completed", "refunded"].includes(order.status)) {
      return NextResponse.json({ error: `Cannot reassign a ${order.status} order` }, { status: 400 });
    }

    const newDriverDoc = await adminDb.collection("driver_profiles").doc(newDriverId).get();
    if (!newDriverDoc.exists) {
      return NextResponse.json({ error: "New driver not found" }, { status: 404 });
    }
    const newDriver = newDriverDoc.data()!;

    const batch = adminDb.batch();

    // Release old driver
    if (order.driverId && order.driverId !== newDriverId) {
      batch.update(adminDb.collection("driver_profiles").doc(order.driverId), {
        currentOrderId: null,
        availabilityStatus: "available",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Update order
    batch.update(adminDb.collection("orders").doc(orderId), {
      driverId: newDriverId,
      driverName: `${newDriver.firstName} ${newDriver.lastName}`,
      status: "driver_assigned",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Status history
    const histRef = adminDb.collection("orders").doc(orderId).collection("status_history").doc();
    batch.set(histRef, {
      orderId,
      fromStatus: order.status,
      toStatus: "driver_assigned",
      changedByUserId: "admin-hedi",
      changedByType: "admin",
      note: `Réassignation: ${reason}`,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Reserve new driver
    batch.update(adminDb.collection("driver_profiles").doc(newDriverId), {
      currentOrderId: orderId,
      availabilityStatus: "reserved",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true, orderId, newDriverId });
  } catch (error) {
    console.error("POST reassign error:", error);
    return NextResponse.json({ error: "Failed to reassign driver" }, { status: 500 });
  }
}
