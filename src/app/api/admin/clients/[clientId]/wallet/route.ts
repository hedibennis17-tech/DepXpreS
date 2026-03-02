import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params;
    const snap = await adminDb.collection('wallets')
      .where('ownerId', '==', clientId)
      .where('ownerType', '==', 'client')
      .limit(1).get();
    if (snap.empty) return NextResponse.json({ wallet: null });
    const wallet = { id: snap.docs[0].id, ...snap.docs[0].data() };
    return NextResponse.json({ wallet });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
