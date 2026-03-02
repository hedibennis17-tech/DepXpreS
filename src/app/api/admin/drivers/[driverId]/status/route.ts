import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;
    const { status, reason } = await req.json();
    
    await adminDb.collection('driver_profiles').doc(driverId).update({
      driver_status: status,
      updatedAt: new Date(),
    });
    
    // Log audit
    await adminDb.collection('audit_logs').add({
      actorId: 'admin-hedi',
      actorName: 'Hedi Bennis',
      actorType: 'admin',
      action: 'driver.status_changed',
      resourceType: 'driver',
      resourceId: driverId,
      description: `Statut chauffeur changé à ${status}. Raison: ${reason || 'N/A'}`,
      metadata: { status, reason },
      createdAt: new Date(),
    });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
