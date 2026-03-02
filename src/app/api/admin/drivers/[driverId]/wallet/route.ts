import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;
    const snap = await adminDb.collection('wallets')
      .where('ownerId', '==', driverId)
      .where('ownerType', '==', 'driver')
      .limit(1).get();
    if (snap.empty) return NextResponse.json({ wallet: null });
    return NextResponse.json({ wallet: { id: snap.docs[0].id, ...snap.docs[0].data() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
