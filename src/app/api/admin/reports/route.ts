import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const snap = await adminDb.collection('reports').get();
    let reports = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (type) reports = reports.filter(r => r.type === type);
    
    reports.sort((a, b) => {
      const da = a.generatedAt?.toDate?.() || new Date(a.generatedAt || 0);
      const db2 = b.generatedAt?.toDate?.() || new Date(b.generatedAt || 0);
      return db2.getTime() - da.getTime();
    });
    
    return NextResponse.json({ reports, total: reports.length });
  } catch (e) {
    console.error('reports API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('reports').doc();
    await ref.set({ ...body, status: 'pending', generatedAt: new Date() });
    return NextResponse.json({ id: ref.id, success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
