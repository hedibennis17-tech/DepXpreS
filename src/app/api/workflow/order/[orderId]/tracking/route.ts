import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const db = adminDb;

    // Récupérer la commande
    const orderSnap = await db.collection('orders').doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }
    const order = { id: orderSnap.id, ...serializeDoc((orderSnap as any).data?.() as Record<string, unknown> ?? {}) } as any;

    // Récupérer le chauffeur si assigné
    let driver = null;
    if (order.driverId) {
      const driverSnap = await db.collection('driver_profiles').doc(order.driverId).get();
      if (driverSnap.exists) {
        const d = serializeDoc((driverSnap as any).data?.() as Record<string, unknown> ?? {});
        driver = {
          id: driverSnap.id,
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone,
          rating: d.rating,
          totalDeliveries: d.totalDeliveries,
          vehicleType: d.vehicleType,
          vehiclePlate: d.vehiclePlate,
          photoUrl: d.photoUrl,
          lastLocation: d.lastLocation,
          lastLocationAt: d.lastLocationAt,
          status: d.status,
        };
      }
    }

    // Récupérer le store
    let store = null;
    if (order.storeId) {
      const storeSnap = await db.collection('stores').doc(order.storeId).get();
      if (storeSnap.exists) {
        const s = serializeDoc((storeSnap as any).data?.() as Record<string, unknown> ?? {});
        store = {
          id: storeSnap.id,
          name: s.name,
          address: s.address,
          phone: s.phone,
          location: s.location,
        };
      }
    }

    // Récupérer l'historique des statuts
    const historySnap = await db.collection('orders')
      .doc(orderId)
      .collection('status_history')
      .get();

    const statusHistory = historySnap.docs
      .map(doc => ({ id: doc.id, ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}) }))
      .sort((a: any, b: any) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    // Récupérer les reviews existants
    const reviewsSnap = await db.collection('reviews')
      .where('orderId', '==', orderId)
      .get();
    const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}) }));

    // Calculer l'ETA estimé
    const etaMinutes = calculateETA(order.status, order);

    return NextResponse.json({
      order: {
        ...order,
        etaMinutes,
      },
      driver,
      store,
      statusHistory,
      reviews,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateETA(status: string, order: any): number | null {
  const etaMap: Record<string, number> = {
    pending:    35,
    confirmed:  30,
    preparing:  25,
    ready:      15,
    assigned:   20,
    picked_up:  15,
    en_route:   10,
    arrived:    2,
    delivered:  0,
    completed:  0,
  };
  return etaMap[status] ?? null;
}
