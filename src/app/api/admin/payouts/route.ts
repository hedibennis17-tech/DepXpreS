import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let query: FirebaseFirestore.Query = adminDb.collection('payouts');
    if (status) query = query.where('status', '==', status);
    query = query.orderBy('createdAt', 'desc');
    const snap = await query.get();
    const payouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalAmount = payouts.reduce((s: number, p: any) => s + (p.amount || 0), 0);
    return NextResponse.json({ payouts, total: payouts.length, totalAmount: Math.round(totalAmount * 100) / 100 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
