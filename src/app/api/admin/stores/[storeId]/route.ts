export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const doc = await adminDb.collection('stores').doc(storeId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const store = serializeDoc({ id: doc.id, ...doc.data() });
    
    const [ordersSnap, productsSnap, reviewsSnap] = await Promise.all([
      adminDb.collection('orders').where('storeId', '==', storeId).get(),
      adminDb.collection('products').where('storeId', '==', storeId).get(),
      adminDb.collection('reviews').where('storeId', '==', storeId).get(),
    ]);
    
    const orders = ordersSnap.docs.map(d => d.data());
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const reviews = reviewsSnap.docs.map(d => d.data());
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.storeRating || 0), 0) / reviews.length : 0;
    
    return NextResponse.json({
      store,
      stats: {
        ordersCount: ordersSnap.size,
        productsCount: productsSnap.size,
        reviewsCount: reviewsSnap.size,
        revenue: Math.round(revenue * 100) / 100,
        avgRating: Math.round(avgRating * 10) / 10,
        completedOrders: orders.filter(o => o.order_status === 'completed').length,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const body = await req.json();
    await adminDb.collection('stores').doc(storeId).update({ ...body, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
