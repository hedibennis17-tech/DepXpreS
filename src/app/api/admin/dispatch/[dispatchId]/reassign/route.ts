export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ dispatchId: string }> }) {
  try {
    const { dispatchId } = await params;
    const { newDriverId, reason = 'Réassignation admin', adminId = 'admin-hedi', adminName = 'Hedi Bennis' } = await req.json();
    
    const dispatchDoc = await adminDb.collection('dispatch_queue').doc(dispatchId).get();
    if (!dispatchDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const dispatch = dispatchDoc.data()!;
    
    const newDriverDoc = await adminDb.collection('driver_profiles').doc(newDriverId).get();
    if (!newDriverDoc.exists) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    const newDriver = newDriverDoc.data()!;
    
    const now = new Date();
    const batch = adminDb.batch();
    
    // Libérer l'ancien chauffeur
    if (dispatch.selectedDriverId) {
      batch.update(adminDb.collection('driver_profiles').doc(dispatch.selectedDriverId), {
        current_order_id: null,
        availability_status: 'available',
        updatedAt: now,
      });
    }
    
    // Assigner le nouveau chauffeur
    batch.update(adminDb.collection('dispatch_queue').doc(dispatchId), {
      selectedDriverId: newDriverId,
      selectedDriverName: newDriver.full_name || newDriver.fullName,
      updatedAt: now,
    });
    
    batch.update(adminDb.collection('orders').doc(dispatch.orderId), {
      driverId: newDriverId,
      driverName: newDriver.full_name || newDriver.fullName,
      updatedAt: now,
    });
    
    batch.update(adminDb.collection('driver_profiles').doc(newDriverId), {
      current_order_id: dispatch.orderId,
      availability_status: 'reserved',
      updatedAt: now,
    });
    
    const eventRef = adminDb.collection('dispatch_events').doc();
    batch.set(eventRef, {
      id: eventRef.id,
      dispatchId,
      orderId: dispatch.orderId,
      eventType: 'driver_reassigned',
      actorId: adminId,
      actorType: 'admin',
      actorName: adminName,
      description: `Réassignation: ${newDriver.full_name || newDriver.fullName}. Raison: ${reason}`,
      metadata: { oldDriverId: dispatch.selectedDriverId, newDriverId, reason },
      createdAt: now,
    });
    
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
