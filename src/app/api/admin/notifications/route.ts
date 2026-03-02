import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientRole = searchParams.get('recipientRole') || searchParams.get('recipientType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const snap = await adminDb.collection('notifications').get();
    let notifications = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : null),
      };
    }) as any[];
    
    if (recipientRole) notifications = notifications.filter(n => n.recipientRole === recipientRole || n.recipientType === recipientRole);
    if (status) notifications = notifications.filter(n => n.status === status);
    
    notifications.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });
    
    const all = snap.docs.map(d => d.data()) as any[];
    const stats = {
      total: all.length,
      unread: all.filter(n => !n.isRead && !n.read).length,
      delivered: all.filter(n => n.status === 'delivered' || n.status === 'sent').length,
      failed: all.filter(n => n.status === 'failed').length,
    };
    
    return NextResponse.json({ notifications: notifications.slice(0, limit), stats, total: notifications.length });
  } catch (e) {
    console.error('notifications API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('notifications').doc();
    const data = {
      ...body,
      status: 'sent',
      isRead: false,
      createdAt: new Date(),
      deliveredAt: new Date(),
    };
    await ref.set(data);
    return NextResponse.json({ notification: { id: ref.id, ...data } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
