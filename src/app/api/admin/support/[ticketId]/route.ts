export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params;
    const doc = await adminDb.collection('support_tickets').doc(ticketId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ticket: serializeDoc({ id: doc.id, ...doc.data() }) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.status === 'resolved') update.resolvedAt = new Date();
    await adminDb.collection('support_tickets').doc(ticketId).update(update);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
