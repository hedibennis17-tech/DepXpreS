import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');
    
    // Récupérer dispatch_queue sans orderBy pour éviter l'index requis
    const snap = await adminDb.collection('dispatch_queue').get();
    let queue = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (status) queue = queue.filter(d => d.dispatchStatus === status);
    if (zoneId) queue = queue.filter(d => d.zoneId === zoneId);
    
    // Trier côté serveur
    queue.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : 0);
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : 0);
      return db2.getTime() - da.getTime();
    });
    
    // Enrichir avec numéro de commande depuis orders
    const enriched = await Promise.all(queue.map(async (item: any) => {
      if (item.orderId && !item.orderNumber) {
        try {
          const orderDoc = await adminDb.collection('orders').doc(item.orderId).get();
          if (orderDoc.exists) {
            const od = orderDoc.data() as any;
            return { ...item, orderNumber: od.orderNumber, storeName: od.storeName, zoneName: od.zoneName };
          }
        } catch {}
      }
      return item;
    }));
    
    // Chauffeurs disponibles (isOnline = true)
    const driversSnap = await adminDb.collection('driver_profiles').get();
    const availableDrivers = driversSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((d: any) => d.isOnline === true || d.status === 'online');
    
    // Métriques
    const allQueue = snap.docs.map(d => d.data()) as any[];
    const metrics = {
      total: allQueue.length,
      queued: allQueue.filter(d => d.dispatchStatus === 'queued').length,
      assigned: allQueue.filter(d => d.dispatchStatus === 'assigned').length,
      completed: allQueue.filter(d => d.dispatchStatus === 'completed').length,
      failed: allQueue.filter(d => d.dispatchStatus === 'failed').length,
      availableDrivers: availableDrivers.length,
    };
    
    return NextResponse.json({ queue: enriched, events: [], availableDrivers, metrics });
  } catch (e) {
    console.error('dispatch API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;
    
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const order = orderDoc.data()!;
    
    const ref = adminDb.collection('dispatch_queue').doc(`dispatch-${orderId}`);
    const dispatchData = {
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
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 'normal',
    };
    
    await ref.set(dispatchData);
    return NextResponse.json({ dispatch: { id: ref.id, ...dispatchData } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
