import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firestore-serialize';

// Workflow des statuts valides et transitions autorisées
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['preparing', 'cancelled'],
  preparing:   ['ready', 'cancelled'],
  ready:       ['assigned', 'cancelled'],
  assigned:    ['picked_up', 'cancelled'],
  picked_up:   ['en_route'],
  en_route:    ['arrived'],
  arrived:     ['delivered'],
  delivered:   ['completed'],
  completed:   [],
  cancelled:   [],
  disputed:    ['resolved', 'cancelled'],
};

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête',
  assigned:   'Chauffeur assigné',
  picked_up:  'Ramassée',
  en_route:   'En route',
  arrived:    'Arrivé',
  delivered:  'Livrée',
  completed:  'Terminée',
  cancelled:  'Annulée',
  disputed:   'Litige',
  resolved:   'Résolue',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { newStatus, driverId, note, location } = body;

    const db = adminDb;

    // Récupérer la commande actuelle
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const order = orderSnap.data()!;
    const currentStatus = order.status;

    // Valider la transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({
        error: `Transition invalide: ${currentStatus} → ${newStatus}`,
        allowed,
      }, { status: 400 });
    }

    const now = new Date();
    const timestamp = now.toISOString();

    // Préparer la mise à jour
    const updateData: Record<string, any> = {
      status: newStatus,
      updatedAt: timestamp,
      [`statusTimestamps.${newStatus}`]: timestamp,
    };

    // Actions spécifiques selon le statut
    if (newStatus === 'assigned' && driverId) {
      updateData.driverId = driverId;
      updateData.assignedAt = timestamp;
    }
    if (newStatus === 'picked_up') {
      updateData.pickedUpAt = timestamp;
    }
    if (newStatus === 'en_route') {
      updateData.enRouteAt = timestamp;
    }
    if (newStatus === 'arrived') {
      updateData.arrivedAt = timestamp;
    }
    if (newStatus === 'delivered') {
      updateData.deliveredAt = timestamp;
    }
    if (newStatus === 'completed') {
      updateData.completedAt = timestamp;
    }
    if (newStatus === 'cancelled') {
      updateData.cancelledAt = timestamp;
      updateData.cancelNote = note || '';
    }
    if (location) {
      updateData.lastDriverLocation = location;
    }

    // Mettre à jour la commande
    await orderRef.update(updateData);

    // Ajouter à l'historique des statuts
    await db.collection('orders').doc(orderId).collection('status_history').add({
      fromStatus: currentStatus,
      toStatus: newStatus,
      label: STATUS_LABELS[newStatus] || newStatus,
      changedAt: timestamp,
      changedBy: driverId || 'admin',
      note: note || '',
      location: location || null,
    });

    // Mettre à jour le dispatch si assignation
    if (newStatus === 'assigned' && driverId) {
      const dispatchQuery = await db.collection('dispatch_queue')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();

      if (!dispatchQuery.empty) {
        await dispatchQuery.docs[0].ref.update({
          dispatchStatus: 'assigned',
          selectedDriverId: driverId,
          updatedAt: timestamp,
        });
      }

      // Mettre à jour le statut du chauffeur
      const driverRef = db.collection('driver_profiles').doc(driverId);
      const driverSnap = await driverRef.get();
      if (driverSnap.exists) {
        await driverRef.update({
          currentOrderId: orderId,
          status: 'delivering',
          updatedAt: timestamp,
        });
      }
    }

    // Si livraison terminée, libérer le chauffeur
    if ((newStatus === 'completed' || newStatus === 'cancelled') && order.driverId) {
      const driverRef = db.collection('driver_profiles').doc(order.driverId);
      const driverSnap = await driverRef.get();
      if (driverSnap.exists) {
        await driverRef.update({
          currentOrderId: null,
          status: 'online',
          updatedAt: timestamp,
          totalDeliveries: (driverSnap.data()!.totalDeliveries || 0) + (newStatus === 'completed' ? 1 : 0),
        });
      }
    }

    // Créer une notification pour le client
    const notifData: Record<string, any> = {
      type: 'order_status',
      orderId,
      userId: order.clientId,
      userType: 'client',
      title: `Commande ${STATUS_LABELS[newStatus]}`,
      body: getNotificationBody(newStatus, order),
      status: 'sent',
      read: false,
      createdAt: timestamp,
    };
    await db.collection('notifications').add(notifData);

    // Récupérer la commande mise à jour
    const updatedSnap = await orderRef.get();
    const updatedOrder = serializeDoc((updatedSnap as any).data?.() as Record<string, unknown> ?? {});

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      transition: { from: currentStatus, to: newStatus },
    });

  } catch (error: any) {
    console.error('Workflow status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getNotificationBody(status: string, order: any): string {
  const messages: Record<string, string> = {
    confirmed:  'Votre commande a été confirmée et sera préparée bientôt.',
    preparing:  'Le dépanneur prépare votre commande.',
    ready:      'Votre commande est prête, en attente d\'un chauffeur.',
    assigned:   'Un chauffeur a été assigné à votre commande.',
    picked_up:  'Le chauffeur a récupéré votre commande.',
    en_route:   'Votre commande est en route vers vous !',
    arrived:    'Le chauffeur est arrivé à votre adresse.',
    delivered:  'Votre commande a été livrée. Bon appétit !',
    completed:  'Commande terminée. Merci d\'utiliser DepXpreS !',
    cancelled:  'Votre commande a été annulée.',
  };
  return messages[status] || `Statut mis à jour: ${status}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const db = adminDb;

    const historySnap = await db.collection('orders')
      .doc(orderId)
      .collection('status_history')
      .get();

    const history = historySnap.docs
      .map(doc => ({ id: doc.id, ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}) }))
      .sort((a: any, b: any) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
