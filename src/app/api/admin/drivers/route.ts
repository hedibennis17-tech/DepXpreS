export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Lire driver_profiles (source principale)
    const snap = await adminDb.collection("driver_profiles").get();
    let drivers = await Promise.all(snap.docs.map(async d => {
      const data = d.data();
      const uid = data.user_id || d.id;

      // Enrichir avec app_users
      let userData: Record<string, unknown> = {};
      try {
        const userDoc = await adminDb.collection("app_users").doc(uid).get();
        if (userDoc.exists) userData = userDoc.data() || {};
      } catch {}

      // Commande active
      let activeOrder = null;
      try {
        const orderSnap = await adminDb.collection("orders")
          .where("driverId", "==", uid)
          .where("status", "in", ["assigned", "picked_up", "en_route"])
          .limit(1).get();
        if (!orderSnap.empty) activeOrder = { id: orderSnap.docs[0].id, ...orderSnap.docs[0].data() };
      } catch {}

      const fullName = data.full_name || userData.display_name || 
        `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "—";
      return {
        id: uid,
        uid,
        name: fullName,
        firstName: userData.first_name || data.full_name?.split(" ")[0] || "",
        lastName: userData.last_name || data.full_name?.split(" ").slice(1).join(" ") || "",
        email: userData.email || data.email || "—",
        phone: data.phone || userData.phone || "—",
        status: data.application_status || "draft",
        isOnline: data.isOnline === true || data.driver_status === "online" || data.online === true || data.is_online === true,
        driver_status: data.driver_status || "offline",
        zone: data.current_zone_id || "—",
        rating: data.rating_average || 0,
        totalDeliveries: data.total_deliveries || 0,
        vehicle: data.vehicle_make ? `${data.vehicle_make} ${data.vehicle_model || ""}`.trim() : "—",
        activeOrder: activeOrder ? activeOrder.id : null,
        photoUrl: data.photoUrl || "",
        createdAt: data.created_at || null,
      };
    }));

    if (status && status !== "all") {
      if (status === "online") drivers = drivers.filter(d => d.isOnline);
      else drivers = drivers.filter(d => d.status === status);
    }

    drivers.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));

    return NextResponse.json({ drivers, total: drivers.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
