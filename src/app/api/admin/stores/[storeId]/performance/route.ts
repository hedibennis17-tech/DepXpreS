export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const ordersSnap = await adminDb.collection('orders').where('storeId', '==', storeId).get();
    const orders = ordersSnap.docs.map(d => d.data());
    const completed = orders.filter(o => o.order_status === 'completed');
    const revenue = completed.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrderValue = completed.length > 0 ? revenue / completed.length : 0;
    return NextResponse.json({
      performance: {
        totalOrders: orders.length,
        completedOrders: completed.length,
        cancelledOrders: orders.filter(o => o.order_status === 'cancelled').length,
        revenue: Math.round(revenue * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        completionRate: orders.length > 0 ? Math.round((completed.length / orders.length) * 100) : 0,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
