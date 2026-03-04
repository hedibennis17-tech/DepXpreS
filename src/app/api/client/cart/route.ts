import { NextRequest, NextResponse } from "next/server";

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;
const DELIVERY_FEE_BASE = 4.99;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, delivery_distance_km } = body;
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    let deliveryFee = DELIVERY_FEE_BASE;
    if (delivery_distance_km) {
      if (delivery_distance_km > 5) deliveryFee = 7.99;
      if (delivery_distance_km > 10) deliveryFee = 11.99;
      if (delivery_distance_km > 20) deliveryFee = 14.99;
    }
    if (subtotal >= 50) deliveryFee = 0;
    const taxableAmount = subtotal + deliveryFee;
    const tps = taxableAmount * TPS_RATE;
    const tvq = taxableAmount * TVQ_RATE;
    const total = taxableAmount + tps + tvq;
    return NextResponse.json({
      subtotal: Math.round(subtotal * 100) / 100,
      delivery_fee: Math.round(deliveryFee * 100) / 100,
      tps: Math.round(tps * 100) / 100,
      tvq: Math.round(tvq * 100) / 100,
      total: Math.round(total * 100) / 100,
      free_delivery_threshold: 50,
      free_delivery: subtotal >= 50,
    });
  } catch (err) {
    console.error("Cart POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
