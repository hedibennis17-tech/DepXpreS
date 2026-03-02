import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const snap = await adminDb.collection('orders')
      .where('storeId', '==', storeId)
      .orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ orders, total: orders.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
