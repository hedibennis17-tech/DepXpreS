import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const snap = await adminDb.collection('promotions').get();
    let promotions = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : null),
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || (data.expiresAt?._seconds ? new Date(data.expiresAt._seconds * 1000).toISOString() : null),
      };
    }) as any[];
    
    if (status === 'active') promotions = promotions.filter(p => p.isActive === true);
    else if (status === 'inactive') promotions = promotions.filter(p => p.isActive === false);
    
    promotions.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });
    
    return NextResponse.json({ promotions, total: promotions.length });
  } catch (e) {
    console.error('promotions API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('promotions').doc();
    const data = { ...body, id: ref.id, createdAt: new Date(), updatedAt: new Date(), usedCount: 0 };
    await ref.set(data);
    return NextResponse.json({ promotion: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
