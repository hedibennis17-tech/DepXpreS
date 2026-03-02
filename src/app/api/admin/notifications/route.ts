import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientType = searchParams.get('recipientType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: FirebaseFirestore.Query = adminDb.collection('notifications');
    if (recipientType) query = query.where('recipientType', '==', recipientType);
    if (status) query = query.where('status', '==', status);
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    const snap = await query.get();
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Stats
    const allSnap = await adminDb.collection('notifications').get();
    const all = allSnap.docs.map(d => d.data());
    const stats = {
      total: all.length,
      unread: all.filter(n => !n.read).length,
      delivered: all.filter(n => n.status === 'delivered').length,
      failed: all.filter(n => n.status === 'failed').length,
    };
    
    return NextResponse.json({ notifications, stats, total: notifications.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('notifications').doc();
    const data = {
      ...body,
      id: ref.id,
      status: 'sent',
      read: false,
      createdAt: new Date(),
      deliveredAt: new Date(),
    };
    await ref.set(data);
    return NextResponse.json({ notification: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
