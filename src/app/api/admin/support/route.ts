import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    
    const snap = await adminDb.collection('support_tickets').get();
    let tickets = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : null),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        slaDueAt: data.slaDueAt?.toDate?.()?.toISOString() || (data.slaDueAt?._seconds ? new Date(data.slaDueAt._seconds * 1000).toISOString() : null),
      };
    }) as any[];
    
    if (status) tickets = tickets.filter(t => t.status === status);
    if (category) tickets = tickets.filter(t => t.category === category);
    if (priority) tickets = tickets.filter(t => t.priority === priority);
    
    tickets.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });
    
    const all = snap.docs.map(d => d.data()) as any[];
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
    console.error('support API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('support_tickets').doc();
    await ref.set({ ...body, status: 'open', createdAt: new Date(), updatedAt: new Date() });
    return NextResponse.json({ id: ref.id, success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
