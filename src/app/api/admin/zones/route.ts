import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query: FirebaseFirestore.Query = adminDb.collection('zones');
    if (status) query = query.where('status', '==', status);
    query = query.orderBy('name', 'asc');
    
    const snap = await query.get();
    const zones = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Enrichir avec stats
    const enriched = await Promise.all(zones.map(async (zone: any) => {
      const [ordersSnap, driversSnap, storesSnap] = await Promise.all([
        adminDb.collection('orders').where('zoneId', '==', zone.id).get(),
        adminDb.collection('driver_profiles').where('current_zone_id', '==', zone.id).get(),
        adminDb.collection('stores').where('zone_id', '==', zone.id).get(),
      ]);
      return {
        ...zone,
        ordersCount: ordersSnap.size,
        driversCount: driversSnap.size,
        storesCount: storesSnap.size,
      };
    }));
    
    return NextResponse.json({ zones: enriched, total: enriched.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
