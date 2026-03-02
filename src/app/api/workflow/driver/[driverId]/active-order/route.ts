import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firestore-serialize';

// GET — Récupérer la commande active du chauffeur
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const db = adminDb;

    // Chercher la commande assignée au chauffeur
    const ordersSnap = await db.collection('orders')
      .where('driverId', '==', driverId)
      .get();

    const activeStatuses = ['assigned', 'picked_up', 'en_route', 'arrived'];
    const activeOrders = ordersSnap.docs
      .map(doc => ({ id: doc.id, ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}) }))
      .filter((o: any) => activeStatuses.includes(o.status));

    if (activeOrders.length === 0) {
      // Chercher les commandes en attente d'assignation dans le dispatch
      const dispatchSnap = await db.collection('dispatch_queue')
        .where('selectedDriverId', '==', driverId)
        .where('dispatchStatus', '==', 'assigned')
        .get();

      if (!dispatchSnap.empty) {
        const dispatch = dispatchSnap.docs[0];
        const dispatchData = serializeDoc((dispatch as any).data?.() as Record<string, unknown> ?? {});
        const orderSnap = await db.collection('orders').doc(String(dispatchData.orderId || '')).get();
        if (orderSnap.exists) {
          const order = { id: orderSnap.id, ...serializeDoc((orderSnap as any).data?.() as Record<string, unknown> ?? {}) };
          return NextResponse.json({ activeOrder: order, dispatch: { id: dispatch.id, ...dispatchData } });
        }
      }

      return NextResponse.json({ activeOrder: null, dispatch: null });
    }

    const activeOrder = activeOrders[0];

    // Récupérer les infos du store
    let store = null;
    if ((activeOrder as any).storeId) {
      const storeSnap = await db.collection('stores').doc((activeOrder as any).storeId).get();
      if (storeSnap.exists) store = { id: storeSnap.id, ...serializeDoc((storeSnap as any).data?.() as Record<string, unknown> ?? {}) };
    }

    // Récupérer les items
    const itemsSnap = await db.collection('orders').doc(activeOrder.id).collection('items').get();
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}) }));

    return NextResponse.json({
      activeOrder: { ...activeOrder, store, items },
      dispatch: null,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
