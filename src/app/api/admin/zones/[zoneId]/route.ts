import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ zoneId: string }> }) {
  try {
    const { zoneId } = await params;
    const doc = await adminDb.collection('zones').doc(zoneId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const data = doc.data() as any;
    const zone = {
      id: doc.id,
      ...data,
      name: data.nameFr || data.nameEn || data.name || doc.id,
      status: data.isActive ? 'active' : 'inactive',
    };
    
    // Stats de la zone
    const [ordersSnap, driversSnap, storesSnap] = await Promise.all([
      adminDb.collection('orders').where('zoneId', '==', zoneId).get(),
      adminDb.collection('driver_profiles').where('zoneId', '==', zoneId).get(),
      adminDb.collection('stores').where('zoneId', '==', zoneId).get(),
    ]);
    
    const orders = ordersSnap.docs.map(d => d.data());
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    return NextResponse.json({
      zone,
      stats: {
        ordersCount: ordersSnap.size,
        driversCount: driversSnap.size,
        storesCount: storesSnap.size,
        revenue: Math.round(revenue * 100) / 100,
        completedOrders: orders.filter(o => o.status === 'completed').length,
      },
      drivers: driversSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      stores: storesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ zoneId: string }> }) {
  try {
    const { zoneId } = await params;
    const body = await req.json();
    await adminDb.collection('zones').doc(zoneId).update({ ...body, updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
