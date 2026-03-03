export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(_: NextRequest, { params }: { params: Promise<{ dispatchId: string }> }) {
  try {
    const { dispatchId } = await params;
    
    const dispatchDoc = await adminDb.collection('dispatch_queue').doc(dispatchId).get();
    if (!dispatchDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const dispatch = dispatchDoc.data()!;
    
    // Récupérer tous les chauffeurs online et disponibles
    const driversSnap = await adminDb.collection('driver_profiles')
      .where('driver_status', '==', 'online')
      .get();
    
    const candidates = driversSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((d: any) => 
        d.availability_status === 'available' && 
        d.application_status === 'approved' &&
        d.id !== dispatch.selectedDriverId
      )
      .map((d: any) => ({
        id: d.id,
        name: d.full_name || d.fullName,
        phone: d.phone,
        rating: d.rating_average || 4.5,
        zone: d.current_zone_id,
        deliveriesToday: d.deliveries_today || 0,
        isAvailable: d.availability_status === 'available',
      }));
    
    return NextResponse.json({ candidates, total: candidates.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
