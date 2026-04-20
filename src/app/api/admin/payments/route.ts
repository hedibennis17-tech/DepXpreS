export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, driverName, amount, type, note, storeName, method, email } = body;
    if (!driverId || !amount) return NextResponse.json({ error: "driverId et amount requis" }, { status: 400 });

    const paymentRef = adminDb.collection("payments").doc();
    await paymentRef.set({
      id: paymentRef.id,
      driverId,
      driverName: driverName || "",
      driverEmail: email || "",
      amount: parseFloat(amount),
      type: type || "driver_payment", // driver_payment | store_payment
      storeName: storeName || null,
      note: note || "",
      method: method || "interac",
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
      paidBy: "admin",
    });

    // Mettre à jour wallet + total_paid dans driver_profiles
    await adminDb.collection("driver_profiles").doc(driverId).update({
      wallet_balance: FieldValue.increment(type === "driver_payment" ? amount : 0),
      total_paid: FieldValue.increment(amount),
      updated_at: FieldValue.serverTimestamp(),
    });

    // Créer notification pour le chauffeur
    await adminDb.collection("notifications").add({
      userId: driverId,
      type: "payment",
      title: type === "driver_payment" ? "💰 Paiement reçu !" : "🛒 Avance pour commerce",
      body: `Vous avez reçu $${parseFloat(amount).toFixed(2)} par Interac.${note ? ` Note: ${note}` : ""}`,
      amount,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, paymentId: paymentRef.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");
    let q = adminDb.collection("payments").orderBy("createdAt", "desc").limit(50);
    if (driverId) q = q.where("driverId", "==", driverId) as any;
    const snap = await q.get();
    const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ payments, total: payments.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
