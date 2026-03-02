import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  try {
    const { promoId } = await params;
    const doc = await adminDb.collection('promotions').doc(promoId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ promotion: serializeDoc({ id: doc.id, ...doc.data() }) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  try {
    const { promoId } = await params;
    const body = await req.json();
    await adminDb.collection('promotions').doc(promoId).update({ ...body, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  try {
    const { promoId } = await params;
    await adminDb.collection('promotions').doc(promoId).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
