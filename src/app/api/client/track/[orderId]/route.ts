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
    let driverLat = null, driverLng = null;
    if (d.driverId) {
      const driverDoc = await adminDb.collection("driver_profiles").doc(d.driverId as string).get();
      if (driverDoc.exists) {
        const dd = serializeDoc(driverDoc.data() || {});
        driverLat = dd.currentLat || dd.lat || null;
        driverLng = dd.currentLng || dd.lng || null;
      }
    }
    let storeLat = null, storeLng = null;
    if (d.storeId) {
      const storeDoc = await adminDb.collection("stores").doc(d.storeId as string).get();
      if (storeDoc.exists) {
        const sd = serializeDoc(storeDoc.data() || {});
        storeLat = sd.lat || sd.latitude || null;
        storeLng = sd.lng || sd.longitude || null;
      }
    }
    const STATUS_ETA: Record<string, number> = { on_the_way: 15, en_route: 15, preparing: 25, confirmed: 35, pending: 45 };
    const estimatedMinutes = STATUS_ETA[d.status as string] || null;
    return NextResponse.json({
      order_id: orderId,
      status: d.status || "pending",
      store_name: d.storeName || d.store_name || "Dépanneur",
      store_lat: storeLat,
      store_lng: storeLng,
      delivery_address: d.deliveryAddress || "",
      delivery_lat: d.deliveryLat || null,
      delivery_lng: d.deliveryLng || null,
      driver_name: d.driverName || null,
      driver_phone: d.driverPhone || null,
      driver_lat: driverLat,
      driver_lng: driverLng,
      estimated_minutes: estimatedMinutes,
    });
  } catch (err) {
    console.error("Track GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
