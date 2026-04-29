export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ dispatchId: string }> }) {
  try {
    const { dispatchId } = await params;

    const dispatchDoc = await adminDb.collection('dispatch_queue').doc(dispatchId).get();
    if (!dispatchDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const dispatch = dispatchDoc.data()!;

    // Récupérer TOUS les profils chauffeurs (pas de filtre strict)
    const driversSnap = await adminDb.collection('driver_profiles').get();
    const appUsersSnap = await adminDb.collection('app_users')
      .where('role', 'in', ['driver', 'super_admin']).get();

    const appUsersMap: Record<string, any> = {};
    appUsersSnap.docs.forEach(d => { appUsersMap[d.id] = d.data(); });

    const candidates = driversSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((d: any) => {
        const user = appUsersMap[d.id];
        // Chauffeur en ligne = isOnline OU driver_status = online OU toggle activé
        const isOnline = d.isOnline === true
          || d.driver_status === 'online'
          || d.online === true
          || d.is_online === true;
        // Pas déjà assigné à cette commande
        const notCurrentDriver = d.id !== dispatch.selectedDriverId;
        // Pas en train de faire une livraison active
        const notBusy = !d.current_order_id
          || d.availability_status === 'available'
          || d.availability_status !== 'busy';
        return isOnline && notCurrentDriver;
      })
      .map((d: any) => {
        const user = appUsersMap[d.id] || {};
        return {
          id: d.id,
          name: d.full_name || d.fullName || user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Chauffeur',
          phone: d.phone || d.phoneNumber || user.phone || '',
          email: user.email || d.email || '',
          rating: d.rating_average || d.rating || 0,
          vehicle: d.vehicle_make ? `${d.vehicle_make} ${d.vehicle_model || ''}`.trim() : (d.vehicle || ''),
          zone: d.current_zone_id || d.zoneId || '',
          deliveriesToday: d.deliveries_today || 0,
          isAvailable: true,
          photoUrl: d.photoUrl || user.photoURL || '',
        };
      });

    return NextResponse.json({ candidates, total: candidates.length });
  } catch (e) {
    console.error('candidates error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
