import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') || searchParams.get('resourceType');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const snap = await adminDb.collection('audit_logs').get();
    let logs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (entityType) logs = logs.filter(l => l.entityType === entityType || l.resourceType === entityType);
    
    logs.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return db2.getTime() - da.getTime();
    });
    
    return NextResponse.json({ logs: logs.slice(0, limit), total: logs.length });
  } catch (e) {
    console.error('audit-logs API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
