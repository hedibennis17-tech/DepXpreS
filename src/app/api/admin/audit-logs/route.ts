import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get('resourceType');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: FirebaseFirestore.Query = adminDb.collection('audit_logs');
    if (resourceType) query = query.where('resourceType', '==', resourceType);
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    const snap = await query.get();
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ logs, total: logs.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
