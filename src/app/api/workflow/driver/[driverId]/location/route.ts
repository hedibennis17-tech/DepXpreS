import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc } from '@/lib/firestore-serialize';

// POST — Mettre à jour la position GPS du chauffeur
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await req.json();
    const { lat, lng, heading, speed, orderId } = body;

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Coordonnées GPS requises' }, { status: 400 });
    }

    const db = adminDb;
    const now = new Date().toISOString();

    // Mettre à jour la position dans driver_profiles
    const driverRef = db.collection('driver_profiles').doc(driverId);
    await driverRef.update({
      lastLocation: { lat, lng },
      lastLocationAt: now,
      heading: heading || 0,
      speed: speed || 0,
      updatedAt: now,
    });

    // Si le chauffeur a une commande active, mettre à jour la position dans la commande
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        lastDriverLocation: { lat, lng, updatedAt: now },
        updatedAt: now,
      });

      // Ajouter un point de tracking
      await db.collection('tracking_sessions').add({
        driverId,
        orderId,
        lat,
        lng,
        heading: heading || 0,
        speed: speed || 0,
        recordedAt: now,
      });
    }

    return NextResponse.json({ success: true, location: { lat, lng, updatedAt: now } });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — Récupérer la position actuelle du chauffeur
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const db = adminDb;

    const driverSnap = await db.collection('driver_profiles').doc(driverId).get();
    if (!driverSnap.exists) {
      return NextResponse.json({ error: 'Chauffeur introuvable' }, { status: 404 });
    }

    const driver = serializeDoc((driverSnap as any).data?.() as Record<string, unknown> ?? {});
    return NextResponse.json({
      driverId,
      location: driver.lastLocation || null,
      lastLocationAt: driver.lastLocationAt || null,
      status: driver.status,
      currentOrderId: driver.currentOrderId || null,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
