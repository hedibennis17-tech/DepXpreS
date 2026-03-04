export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore-serialize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
  try {
    const doc = await adminDb.collection("orders").doc(orderId).get();
    if (!doc.exists) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const d = serializeDoc(doc.data() || {});
    return NextResponse.json({
      id: doc.id,
      status: d.status || "pending",
      store_name: d.storeName || d.store_name || "Dépanneur",
      store_phone: d.storePhone || null,
      store_address: d.storeAddress || null,
      items: Array.isArray(d.items) ? d.items : [],
      subtotal: Number(d.subtotal) || 0,
      delivery_fee: Number(d.deliveryFee) || 4.99,
      tps: Number(d.tps) || 0,
      tvq: Number(d.tvq) || 0,
      total: Number(d.total) || 0,
      delivery_address: d.deliveryAddress || "",
      created_at: d.createdAt ? new Date(d.createdAt as string).toLocaleDateString("fr-CA") : "",
      estimated_delivery: d.estimatedDelivery || null,
      driver_name: d.driverName || null,
      driver_phone: d.driverPhone || null,
      notes: d.notes || "",
    });
  } catch (err) {
    console.error("Order detail GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
