export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params;
    const snap = await adminDb.collection('support_tickets')
      .where('clientId', '==', clientId)
      .orderBy('createdAt', 'desc').get();
    const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ tickets, total: tickets.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
