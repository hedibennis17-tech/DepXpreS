import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params;
    const snap = await adminDb.collection('orders')
      .where('clientId', '==', clientId)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    return NextResponse.json({ orders, total: orders.length, totalSpent: Math.round(totalSpent * 100) / 100 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
