export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const snap = await adminDb.collection('products')
      .where('storeId', '==', storeId)
      .orderBy('name', 'asc').get();
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ products, total: products.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
