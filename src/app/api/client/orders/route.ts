export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from "@/lib/firestore-serialize";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  try {
    const snap = await adminDb.collection("orders")
      .where("clientId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    const orders = snap.docs.map(doc => {
      const d = serializeDoc(doc.data());
      return {
        id: doc.id,
        store_name: d.storeName || d.store_name || "Dépanneur",
        status: d.status || "pending",
        total: Number(d.total) || 0,
        items_count: Array.isArray(d.items) ? d.items.length : 0,
        created_at: d.createdAt ? new Date(d.createdAt as string).toLocaleDateString("fr-CA") : "",
        estimated_delivery: d.estimatedDelivery || null,
      };
    });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, storeId, storeName, items, subtotal, deliveryFee, tps, tvq, total, deliveryAddress, deliveryLat, deliveryLng, notes, paymentMethod, clientName, clientEmail, clientPhone } = body;
    if (!clientId || !storeId || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const TPS_RATE = 0.05;
    const TVQ_RATE = 0.09975;
    const calcSubtotal = subtotal || items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
    const calcDelivery = deliveryFee ?? (calcSubtotal >= 50 ? 0 : 4.99);
    const taxable = calcSubtotal + calcDelivery;
    const calcTps = tps ?? Math.round(taxable * TPS_RATE * 100) / 100;
    const calcTvq = tvq ?? Math.round(taxable * TVQ_RATE * 100) / 100;
    const calcTotal = total ?? Math.round((taxable + calcTps + calcTvq) * 100) / 100;
    const ref = await adminDb.collection("orders").add({
      clientId,
      clientName: clientName || "",
      clientEmail: clientEmail || "",
      clientPhone: clientPhone || "",
      storeId,
      storeName: storeName || "",
      items,
      subtotal: calcSubtotal,
      deliveryFee: calcDelivery,
      tps: calcTps,
      tvq: calcTvq,
      total: calcTotal,
      deliveryAddress: deliveryAddress || "",
      deliveryLat: deliveryLat || null,
      deliveryLng: deliveryLng || null,
      notes: notes || "",
      paymentMethod: paymentMethod || "cash",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, order_id: ref.id });
  } catch (err) {
    console.error("Order POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
