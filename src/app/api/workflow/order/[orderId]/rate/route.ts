import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firestore-serialize';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { raterType, rateeType, rating, comment, tags } = body;
    // raterType: 'client' | 'driver'
    // rateeType: 'driver' | 'client'
    // rating: 1-5
    // tags: string[] (ex: ['ponctuel', 'professionnel', 'rapide'])

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5 requis)' }, { status: 400 });
    }

    const db = adminDb;
    const now = new Date().toISOString();

    // Récupérer la commande
    const orderSnap = await db.collection('orders').doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }
    const order = orderSnap.data()!;

    // Vérifier que la commande est terminée
    if (!['completed', 'delivered'].includes(order.status)) {
      return NextResponse.json({
        error: 'Le rating n\'est possible qu\'après livraison'
      }, { status: 400 });
    }

    // Créer le document de review
    const reviewData = {
      orderId,
      raterType,
      rateeType,
      raterId: raterType === 'client' ? order.clientId : order.driverId,
      rateeId: rateeType === 'driver' ? order.driverId : order.clientId,
      rating,
      comment: comment || '',
      tags: tags || [],
      createdAt: now,
    };

    await db.collection('reviews').add(reviewData);

    // Mettre à jour la note moyenne du ratee
    if (rateeType === 'driver' && order.driverId) {
      const driverRef = db.collection('driver_profiles').doc(order.driverId);
      const driverSnap = await driverRef.get();
      if (driverSnap.exists) {
        const driverData = driverSnap.data()!;
        const currentRating = driverData.rating || 5.0;
        const totalRatings = driverData.totalRatings || 0;
        const newTotal = totalRatings + 1;
        const newRating = ((currentRating * totalRatings) + rating) / newTotal;
        await driverRef.update({
          rating: Math.round(newRating * 10) / 10,
          totalRatings: newTotal,
          updatedAt: now,
        });
      }
    }

    if (rateeType === 'client' && order.clientId) {
      const clientRef = db.collection('client_profiles').doc(order.clientId);
      const clientSnap = await clientRef.get();
      if (clientSnap.exists) {
        const clientData = clientSnap.data()!;
        const currentRating = clientData.rating || 5.0;
        const totalRatings = clientData.totalRatings || 0;
        const newTotal = totalRatings + 1;
        const newRating = ((currentRating * totalRatings) + rating) / newTotal;
        await clientRef.update({
          rating: Math.round(newRating * 10) / 10,
          totalRatings: newTotal,
          updatedAt: now,
        });
      }
    }

    // Marquer la commande comme notée
    const ratingField = raterType === 'client' ? 'clientRated' : 'driverRated';
    await db.collection('orders').doc(orderId).update({
      [ratingField]: true,
      [`${raterType}Rating`]: rating,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      review: reviewData,
      message: 'Note enregistrée avec succès',
    });

  } catch (error: any) {
    console.error('Rating error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const db = adminDb;

    const reviewsSnap = await db.collection('reviews')
      .where('orderId', '==', orderId)
      .get();

    const reviews = reviewsSnap.docs.map(doc => ({
      id: doc.id,
      ...serializeDoc((doc as any).data?.() as Record<string, unknown> ?? {}),
    }));

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
