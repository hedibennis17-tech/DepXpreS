import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const driverId = searchParams.get('driverId');
    
    let query: FirebaseFirestore.Query = adminDb.collection('reviews');
    if (storeId) query = query.where('storeId', '==', storeId);
    if (driverId) query = query.where('driverId', '==', driverId);
    query = query.orderBy('createdAt', 'desc');
    
    const snap = await query.get();
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.overallRating || 0), 0) / reviews.length
      : 0;
    
    return NextResponse.json({ reviews, total: reviews.length, avgRating: Math.round(avgRating * 10) / 10 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
