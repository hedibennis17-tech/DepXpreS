export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore-serialize";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });
  try {
    const doc = await adminDb.collection("client_profiles").doc(uid).get();
    const d = doc.exists ? serializeDoc(doc.data() || {}) : {};
    const balance = Number(d.walletBalance || d.wallet_balance) || 0;
    const loyaltyPoints = Number(d.loyaltyPoints || d.loyalty_points) || 0;
    let transactions: unknown[] = [];
    try {
      const txSnap = await adminDb.collection("wallet_transactions")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      transactions = txSnap.docs.map(txDoc => {
        const tx = serializeDoc(txDoc.data());
        return {
          id: txDoc.id,
          type: tx.type || "debit",
          amount: Number(tx.amount) || 0,
          description: tx.description || "",
          date: tx.createdAt ? new Date(tx.createdAt as string).toLocaleDateString("fr-CA") : "",
        };
      });
    } catch {}
    return NextResponse.json({ balance, loyalty_points: loyaltyPoints, transactions });
  } catch (err) {
    console.error("Wallet GET error:", err);
    return NextResponse.json({ balance: 0, loyalty_points: 0, transactions: [] });
  }
}
