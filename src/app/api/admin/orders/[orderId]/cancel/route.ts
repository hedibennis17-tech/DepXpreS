export const runtime = "nodejs";
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
    const { reason = "Annulé par l'administrateur" } = body;

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderDoc.data()!;

    if (["cancelled", "completed", "refunded"].includes(order.status)) {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    // Cancel order
    batch.update(adminDb.collection("orders").doc(orderId), {
      status: "cancelled",
      cancelReason: reason,
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Status history
    const histRef = adminDb
      .collection("orders")
      .doc(orderId)
      .collection("status_history")
      .doc();
    batch.set(histRef, {
      orderId,
      fromStatus: order.status,
      toStatus: "cancelled",
      changedByUserId: "admin-hedi",
      changedByType: "admin",
      note: reason,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Release driver if assigned
    if (order.driverId) {
      batch.update(adminDb.collection("driver_profiles").doc(order.driverId), {
        currentOrderId: null,
        availabilityStatus: "available",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    // Notification to client
    await adminDb.collection("notifications").add({
      recipientUserId: order.clientId,
      recipientRole: "client",
      channel: "in_app",
      notificationType: "order_cancelled",
      titleFr: "Commande annulée",
      bodyFr: `Votre commande ${orderId} a été annulée. Raison: ${reason}`,
      payload: { orderId },
      status: "queued",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("POST cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
