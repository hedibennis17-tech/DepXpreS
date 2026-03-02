import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    
    let query: FirebaseFirestore.Query = adminDb.collection('support_tickets');
    if (status) query = query.where('status', '==', status);
    if (category) query = query.where('category', '==', category);
    if (priority) query = query.where('priority', '==', priority);
    query = query.orderBy('createdAt', 'desc');
    
    const snap = await query.get();
    const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Métriques
    const allSnap = await adminDb.collection('support_tickets').get();
    const all = allSnap.docs.map(d => d.data());
    const metrics = {
      total: all.length,
      open: all.filter(t => t.status === 'open').length,
      inProgress: all.filter(t => t.status === 'in_progress').length,
      resolved: all.filter(t => t.status === 'resolved').length,
      escalated: all.filter(t => t.status === 'escalated').length,
      urgent: all.filter(t => t.priority === 'urgent').length,
    };
    
    return NextResponse.json({ tickets, metrics, total: tickets.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
