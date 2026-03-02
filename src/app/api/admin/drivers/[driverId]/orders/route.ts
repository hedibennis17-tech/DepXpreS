import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;
    const snap = await adminDb.collection('orders')
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalEarned = orders.reduce((sum: number, o: any) => sum + (o.deliveryFee || 3.99), 0);
    return NextResponse.json({ orders, total: orders.length, totalEarned: Math.round(totalEarned * 100) / 100 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
