import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    let query: FirebaseFirestore.Query = adminDb.collection('reports');
    if (type) query = query.where('type', '==', type);
    query = query.orderBy('createdAt', 'desc');
    
    const snap = await query.get();
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ reports, total: reports.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
