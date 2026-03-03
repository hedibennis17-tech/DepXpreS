export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;
    const snap = await adminDb.collection('payouts')
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc').get();
    const payouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalPaid = payouts.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pending = payouts.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    return NextResponse.json({ payouts, total: payouts.length, totalPaid: Math.round(totalPaid * 100) / 100, pending: Math.round(pending * 100) / 100 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
