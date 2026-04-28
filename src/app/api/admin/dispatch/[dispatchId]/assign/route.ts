export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { notifyAll } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: Promise<{ dispatchId: string }> }) {
  try {
    const { dispatchId } = await params;
    const { driverId, adminId = 'admin', adminName = 'Admin' } = await req.json();

    // Récupérer le dispatch
    const dispatchDoc = await adminDb.collection('dispatch_queue').doc(dispatchId).get();
    if (!dispatchDoc.exists) return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
    const dispatch = dispatchDoc.data()!;

    // Récupérer chauffeur + commande + store + client en parallèle
    const [driverProfileDoc, driverUserDoc, orderDoc] = await Promise.all([
      adminDb.collection('driver_profiles').doc(driverId).get(),
      adminDb.collection('app_users').doc(driverId).get(),
      adminDb.collection('orders').doc(dispatch.orderId).get(),
    ]);

    if (!driverProfileDoc.exists) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const driver = driverProfileDoc.data()!;
    const driverUser = driverUserDoc.exists ? driverUserDoc.data()! : {};
    const order = orderDoc.data()!;

    const driverName = driver.full_name || driver.fullName || driverUser.display_name || 'Chauffeur';
    const driverPhone = driver.phone || driver.phoneNumber || driverUser.phone || '';
    const driverEmail = driverUser.email || driver.email || '';

    // Récupérer store et client
    const [storeDoc, clientDoc] = await Promise.all([
      order.storeId ? adminDb.collection('stores').doc(order.storeId).get() : Promise.resolve(null),
      order.clientId ? adminDb.collection('app_users').doc(order.clientId).get() : Promise.resolve(null),
    ]);
    const store = storeDoc?.exists ? storeDoc.data()! : {};
    const client = clientDoc?.exists ? clientDoc.data()! : {};

    const now = new Date();
    const batch = adminDb.batch();

    // ── 1. Mettre à jour dispatch_queue ─────────────────────────────────
    batch.update(adminDb.collection('dispatch_queue').doc(dispatchId), {
      dispatchStatus: 'assigned',
      selectedDriverId: driverId,
      selectedDriverName: driverName,
      assignedAt: now,
      updatedAt: now,
      attemptCount: (dispatch.attemptCount || 0) + 1,
    });

    // ── 2. Mettre à jour la commande — CHAMPS UNIFIÉS ────────────────────
    // status = "assigned" pour que le chauffeur le voit dans son app
    batch.update(adminDb.collection('orders').doc(dispatch.orderId), {
      driverId,
      driverName,
      status: 'assigned',          // ← champ que le chauffeur écoute
      order_status: 'driver_assigned',
      assignedAt: now,
      driver_assigned_at: now,
      dispatcher_id: adminId,
      updatedAt: now,
      // Ajouter les coords du store si manquantes
      storeLat: order.storeLat || store.lat || store.latitude || null,
      storeLng: order.storeLng || store.lng || store.longitude || null,
      storePhone: order.storePhone || store.phone || '',
      storeAddress: order.storeAddress || store.address || '',
    });

    // ── 3. Mettre à jour le profil chauffeur ─────────────────────────────
    batch.update(adminDb.collection('driver_profiles').doc(driverId), {
      current_order_id: dispatch.orderId,
      availability_status: 'reserved',
      updatedAt: now,
    });

    // ── 4. Notification in-app pour le chauffeur ─────────────────────────
    const notifRef = adminDb.collection('notifications').doc();
    batch.set(notifRef, {
      userId: driverId,
      userType: 'driver',
      type: 'new_order',
      title: '🚗 Nouvelle commande!',
      body: `Commande ${order.orderNumber || dispatch.orderNumber} — ${order.storeName || dispatch.storeName} → ${order.deliveryAddress || ''}`,
      orderId: dispatch.orderId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // ── 5. Log dispatch event ─────────────────────────────────────────────
    const eventRef = adminDb.collection('dispatch_events').doc();
    batch.set(eventRef, {
      id: eventRef.id,
      dispatchId,
      orderId: dispatch.orderId,
      eventType: 'driver_assigned',
      actorId: adminId,
      actorType: 'admin',
      actorName: adminName,
      description: `Chauffeur ${driverName} assigné à ${order.orderNumber || dispatch.orderNumber}`,
      metadata: { driverId, driverName },
      createdAt: now,
    });

    // ── 6. Historique statut ──────────────────────────────────────────────
    const histRef = adminDb.collection('order_status_history').doc();
    batch.set(histRef, {
      id: histRef.id,
      orderId: dispatch.orderId,
      status: 'assigned',
      note: `Chauffeur ${driverName} assigné via dispatch`,
      actorId: adminId,
      actorType: 'admin',
      createdAt: now,
    });

    await batch.commit();

    // ── 7. Notifications SMS/Email (après le batch) ───────────────────────
    try {
      await notifyAll('assigned', {
        orderNumber:     order.orderNumber || dispatch.orderNumber || '',
        orderId:         dispatch.orderId,
        storeName:       order.storeName || store.name || '',
        storeAddress:    order.storeAddress || store.address || '',
        storePhone:      order.storePhone || store.phone || '',
        storeEmail:      store.email || store.ownerEmail || '',
        clientName:      order.clientName || client.display_name || 'Client',
        clientPhone:     order.clientPhone || client.phone || '',
        clientEmail:     client.email || '',
        deliveryAddress: order.deliveryAddress || '',
        driverName,
        driverPhone,
        driverEmail,
        total:           order.total,
        items:           order.items,
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Chauffeur ${driverName} assigné avec succès`,
      driverName,
      orderId: dispatch.orderId,
    });

  } catch (e) {
    console.error('dispatch assign error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
