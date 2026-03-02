import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query: FirebaseFirestore.Query = adminDb.collection('promotions');
    if (status) query = query.where('status', '==', status);
    query = query.orderBy('createdAt', 'desc');
    
    const snap = await query.get();
    const promotions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ promotions, total: promotions.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('promotions').doc();
    const data = { ...body, id: ref.id, createdAt: new Date(), updatedAt: new Date(), usageCount: 0 };
    await ref.set(data);
    return NextResponse.json({ promotion: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
