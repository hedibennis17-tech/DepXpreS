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
    const { amount, reason = "Remboursement admin" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderDoc.data()!;

    // Get payment
    const paymentSnap = await adminDb
      .collection("payments")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();

    if (paymentSnap.empty) {
      return NextResponse.json({ error: "No payment found for this order" }, { status: 400 });
    }

    const paymentDoc = paymentSnap.docs[0];
    const payment = paymentDoc.data();
    const newRefundedAmount = (payment.refundedAmount || 0) + amount;

    if (newRefundedAmount > payment.amount) {
      return NextResponse.json(
        { error: `Refund amount exceeds payment amount (${payment.amount})` },
        { status: 400 }
      );
    }

    const isFullRefund = newRefundedAmount >= payment.amount;
    const newPaymentStatus = isFullRefund ? "refunded" : "partially_refunded";

    const batch = adminDb.batch();

    // Create refund record
    const refundRef = adminDb.collection("refunds").doc();
    batch.set(refundRef, {
      paymentId: paymentDoc.id,
      orderId,
      clientId: order.clientId,
      amount,
      reason,
      status: "completed",
      createdBy: "admin-hedi",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update payment
    batch.update(adminDb.collection("payments").doc(paymentDoc.id), {
      refundedAmount: newRefundedAmount,
      paymentStatus: newPaymentStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update order if full refund
    if (isFullRefund) {
      batch.update(adminDb.collection("orders").doc(orderId), {
        status: "refunded",
        paymentStatus: "refunded",
        updatedAt: FieldValue.serverTimestamp(),
      });

      const histRef = adminDb
        .collection("orders")
        .doc(orderId)
        .collection("status_history")
        .doc();
      batch.set(histRef, {
        orderId,
        fromStatus: order.status,
        toStatus: "refunded",
        changedByUserId: "admin-hedi",
        changedByType: "admin",
        note: `Remboursement complet: ${reason}`,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    // Notification
    await adminDb.collection("notifications").add({
      recipientUserId: order.clientId,
      recipientRole: "client",
      channel: "in_app",
      notificationType: "refund_issued",
      titleFr: "Remboursement effectué",
      bodyFr: `Un remboursement de ${amount.toFixed(2)}$ a été effectué pour la commande ${orderId}.`,
      payload: { orderId, amount },
      status: "queued",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      refundId: refundRef.id,
      amount,
      newRefundedAmount,
      isFullRefund,
    });
  } catch (error) {
    console.error("POST refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
