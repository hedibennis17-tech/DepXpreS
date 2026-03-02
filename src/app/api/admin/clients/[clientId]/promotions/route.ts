import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET() {
  try {
    const snap = await adminDb.collection('promotions')
      .where('status', '==', 'active').get();
    const promotions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ promotions, total: promotions.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
