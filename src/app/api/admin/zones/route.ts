import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const snap = await adminDb.collection('zones').get();
    let zones = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    // Normaliser les champs (zones utilisent nameFr/nameEn/isActive)
    zones = zones.map(z => ({
      ...z,
      name: z.nameFr || z.nameEn || z.name || z.id,
      status: z.isActive ? 'active' : 'inactive',
    }));
    
    if (status) {
      zones = zones.filter(z => z.status === status);
    }
    
    zones.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    // Enrichir avec stats
    const enriched = await Promise.all(zones.map(async (zone: any) => {
      const [ordersSnap, driversSnap, storesSnap] = await Promise.all([
        adminDb.collection('orders').where('zoneId', '==', zone.id).get(),
        adminDb.collection('driver_profiles').where('zoneId', '==', zone.id).get(),
        adminDb.collection('stores').where('zoneId', '==', zone.id).get(),
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
    console.error('zones API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = adminDb.collection('zones').doc();
    const now = new Date();
    await ref.set({
      ...body,
      isActive: body.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: ref.id, success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
