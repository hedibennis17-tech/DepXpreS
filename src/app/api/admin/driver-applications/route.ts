import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const snap = await adminDb.collection('driver_applications').get();
    let apps = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (status) apps = apps.filter(a => a.status === status || a.applicationStatus === status);
    
    apps.sort((a, b) => {
      const da = a.submittedAt?.toDate?.() || new Date(a.submittedAt || 0);
      const db2 = b.submittedAt?.toDate?.() || new Date(b.submittedAt || 0);
      return db2.getTime() - da.getTime();
    });
    
    const all = snap.docs.map(d => d.data()) as any[];
    const metrics = {
      total: all.length,
      pending: all.filter(a => a.status === 'pending' || a.applicationStatus === 'pending').length,
      approved: all.filter(a => a.status === 'approved' || a.applicationStatus === 'approved').length,
      rejected: all.filter(a => a.status === 'rejected' || a.applicationStatus === 'rejected').length,
    };
    
    return NextResponse.json({ applications: apps, metrics, total: apps.length });
  } catch (e) {
    console.error('driver-applications API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
