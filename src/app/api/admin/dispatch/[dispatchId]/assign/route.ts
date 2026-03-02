import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ dispatchId: string }> }) {
  try {
    const { dispatchId } = await params;
    const { driverId, adminId = 'admin-hedi', adminName = 'Hedi Bennis' } = await req.json();
    
    // Récupérer le dispatch
    const dispatchDoc = await adminDb.collection('dispatch_queue').doc(dispatchId).get();
    if (!dispatchDoc.exists) return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
    const dispatch = dispatchDoc.data()!;
    
    // Récupérer le chauffeur
    const driverDoc = await adminDb.collection('driver_profiles').doc(driverId).get();
    if (!driverDoc.exists) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    const driver = driverDoc.data()!;
    
    const now = new Date();
    const batch = adminDb.batch();
    
    // Mettre à jour dispatch_queue
    batch.update(adminDb.collection('dispatch_queue').doc(dispatchId), {
      dispatchStatus: 'assigned',
      selectedDriverId: driverId,
      selectedDriverName: driver.full_name || driver.fullName,
      assignedAt: now,
      updatedAt: now,
      attemptCount: (dispatch.attemptCount || 0) + 1,
    });
    
    // Mettre à jour la commande
    batch.update(adminDb.collection('orders').doc(dispatch.orderId), {
      driverId,
      driverName: driver.full_name || driver.fullName,
      order_status: 'driver_assigned',
      driver_assigned_at: now,
      dispatcher_id: adminId,
      updatedAt: now,
    });
    
    // Mettre à jour le chauffeur
    batch.update(adminDb.collection('driver_profiles').doc(driverId), {
      current_order_id: dispatch.orderId,
      availability_status: 'reserved',
      updatedAt: now,
    });
    
    // Log événement
    const eventRef = adminDb.collection('dispatch_events').doc();
    batch.set(eventRef, {
      id: eventRef.id,
      dispatchId,
      orderId: dispatch.orderId,
      eventType: 'driver_assigned',
      actorId: adminId,
      actorType: 'admin',
      actorName: adminName,
      description: `Chauffeur ${driver.full_name || driver.fullName} assigné à la commande ${dispatch.orderNumber}`,
      metadata: { driverId, driverName: driver.full_name || driver.fullName },
      createdAt: now,
    });
    
    // Historique statut commande
    const histRef = adminDb.collection('order_status_history').doc();
    batch.set(histRef, {
      id: histRef.id,
      orderId: dispatch.orderId,
      status: 'driver_assigned',
      note: `Chauffeur ${driver.full_name || driver.fullName} assigné`,
      actorId: adminId,
      actorType: 'admin',
      createdAt: now,
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: `Chauffeur ${driver.full_name || driver.fullName} assigné avec succès`,
      driverName: driver.full_name || driver.fullName,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
