export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Récupérer tous les profils chauffeurs sans filtre strict
    const [profilesSnap, appUsersSnap] = await Promise.all([
      adminDb.collection("driver_profiles").get(),
      adminDb.collection("app_users").where("role", "in", ["driver", "super_admin"]).get(),
    ]);

    const appUsersMap: Record<string, any> = {};
    appUsersSnap.docs.forEach(d => { appUsersMap[d.id] = d.data(); });

    const drivers = profilesSnap.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .filter((d: any) => {
        // Chauffeur en ligne = n'importe lequel de ces champs
        return d.isOnline === true
          || d.driver_status === 'online'
          || d.online === true
          || d.is_online === true;
      })
      .map((d: any) => {
        const user = appUsersMap[d.id] || {};
        return {
          id: d.id,
          name: d.full_name || d.fullName || user.display_name
            || `${user.first_name || ''} ${user.last_name || ''}`.trim()
            || user.email?.split('@')[0] || 'Chauffeur',
          phone: d.phone || d.phoneNumber || user.phone || '',
          email: user.email || d.email || '',
          rating: d.rating_average || d.rating || 0,
          vehicle: d.vehicle_make
            ? `${d.vehicle_make} ${d.vehicle_model || ''}`.trim()
            : (d.vehicle || d.vehicleType || ''),
          zone: d.current_zone_id || d.zoneId || '',
          isOnline: true,
          deliveriesToday: d.deliveries_today || 0,
          photoUrl: d.photoUrl || user.photoURL || '',
        };
      })
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 20);

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("candidate-drivers error:", error);
    return NextResponse.json({ drivers: [], error: String(error) });
  }
}
