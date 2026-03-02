import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');
    
    let query: FirebaseFirestore.Query = adminDb.collection('dispatch_queue');
    if (status) query = query.where('dispatchStatus', '==', status);
    if (zoneId) query = query.where('zoneId', '==', zoneId);
    query = query.orderBy('createdAt', 'desc');
    
    const snap = await query.get();
    const queue = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Événements récents
    const eventsSnap = await adminDb.collection('dispatch_events')
      .orderBy('createdAt', 'desc').limit(20).get();
    const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Chauffeurs disponibles
    const driversSnap = await adminDb.collection('driver_profiles')
      .where('driver_status', '==', 'online').get();
    const availableDrivers = driversSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Métriques
    const allQueue = snap.docs.map(d => d.data());
    const metrics = {
      total: allQueue.length,
      queued: allQueue.filter(d => d.dispatchStatus === 'queued').length,
      assigned: allQueue.filter(d => d.dispatchStatus === 'assigned').length,
      completed: allQueue.filter(d => d.dispatchStatus === 'completed').length,
      availableDrivers: availableDrivers.length,
    };
    
    return NextResponse.json({ queue, events, availableDrivers, metrics });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;
    
    // Récupérer la commande
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const order = orderDoc.data()!;
    
    // Créer entrée dispatch
    const ref = adminDb.collection('dispatch_queue').doc(`dispatch-${orderId}`);
    const dispatchData = {
      id: ref.id,
      orderId,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      storeName: order.storeName,
      zoneId: order.zoneId,
      zoneName: order.zoneName,
      dispatchMode: body.mode || 'auto',
      dispatchStatus: 'queued',
      selectedDriverId: null,
      selectedDriverName: null,
      candidateDriverIds: [],
      attemptCount: 0,
      maxAttempts: 3,
      assignedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'normal',
    };
    
    await ref.set(dispatchData);
    
    // Log événement
    await adminDb.collection('dispatch_events').add({
      dispatchId: ref.id,
      orderId,
      eventType: 'order_queued',
      actorId: 'admin',
      actorType: 'admin',
      actorName: 'Admin',
      description: `Commande ${order.orderNumber} ajoutée à la file de dispatch`,
      metadata: {},
      createdAt: new Date(),
    });
    
    return NextResponse.json({ dispatch: dispatchData });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
