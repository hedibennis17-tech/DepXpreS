export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;
    const snap = await adminDb.collection('reviews')
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc').get();
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const avg = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + (r.driverRating || 0), 0) / reviews.length : 0;
    return NextResponse.json({ reviews, total: reviews.length, avgRating: Math.round(avg * 10) / 10 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
