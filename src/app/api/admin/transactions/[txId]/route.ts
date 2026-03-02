import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ txId: string }> }) {
  try {
    const { txId } = await params;
    // Check payments first
    const payDoc = await adminDb.collection('payments').doc(txId).get();
    if (payDoc.exists) return NextResponse.json({ transaction: { id: payDoc.id, ...payDoc.data(), transactionType: 'payment' } });
    // Check payouts
    const payoutDoc = await adminDb.collection('payouts').doc(txId).get();
    if (payoutDoc.exists) return NextResponse.json({ transaction: { id: payoutDoc.id, ...payoutDoc.data(), transactionType: 'payout' } });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
