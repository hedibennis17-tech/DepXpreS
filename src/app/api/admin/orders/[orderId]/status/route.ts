import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["driver_assigned", "cancelled"],
  driver_assigned: ["driver_en_route_store", "cancelled"],
  driver_en_route_store: ["at_store", "cancelled"],
  at_store: ["en_route", "cancelled"],
  en_route: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
  disputed: ["cancelled", "completed"],
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { toStatus, note = "" } = body;

    if (!toStatus) {
      return NextResponse.json({ error: "toStatus required" }, { status: 400 });
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderDoc.data()!;

    const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(toStatus)) {
      return NextResponse.json(
        {
          error: `Invalid transition from ${order.status} to ${toStatus}. Allowed: ${allowedTransitions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status: toStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (toStatus === "delivered") updateData.deliveredAt = FieldValue.serverTimestamp();
    if (toStatus === "completed") updateData.completedAt = FieldValue.serverTimestamp();
    if (toStatus === "cancelled") {
      updateData.cancelledAt = FieldValue.serverTimestamp();
      updateData.cancelReason = note || "Annulé par l'admin";
    }

    const batch = adminDb.batch();

    batch.update(adminDb.collection("orders").doc(orderId), updateData as any);

    const histRef = adminDb
      .collection("orders")
      .doc(orderId)
      .collection("status_history")
      .doc();
    batch.set(histRef, {
      orderId,
      fromStatus: order.status,
      toStatus,
      changedByUserId: "admin-hedi",
      changedByType: "admin",
      note: note || `Statut changé à ${toStatus} par l'admin`,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Release driver if completed or cancelled
    if (["completed", "cancelled"].includes(toStatus) && order.driverId) {
      batch.update(adminDb.collection("driver_profiles").doc(order.driverId), {
        currentOrderId: null,
        availabilityStatus: "available",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, orderId, fromStatus: order.status, toStatus });
  } catch (error) {
    console.error("POST status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
