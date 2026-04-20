export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(_: NextRequest, { params }: { params: { driverId: string } }) {
  try {
    const uid = params.driverId;
    const [pDoc, uDoc] = await Promise.all([
      adminDb.collection("driver_profiles").doc(uid).get(),
      adminDb.collection("app_users").doc(uid).get(),
    ]);

    const p = pDoc.exists ? pDoc.data()! : {};
    const u = uDoc.exists ? uDoc.data()! : {};

    // Stats wallet
    const paymentsSnap = await adminDb.collection("payments")
      .where("driverId", "==", uid).get();
    const total_paid = paymentsSnap.docs
      .filter(d => d.data().status === "completed")
      .reduce((s, d) => s + (d.data().amount || 0), 0);

    const driver = {
      id: uid, uid,
      name: p.full_name || u.display_name || "—",
      email: u.email || "—",
      phone: p.phone || u.phone || "—",
      status: p.application_status || "draft",
      isOnline: p.driver_status === "online",
      driver_status: p.driver_status || "offline",
      zone: p.current_zone_id || "—",
      zone_name: p.zone_name || "",
      rating: p.rating_average || 0,
      totalDeliveries: p.total_deliveries || 0,
      vehicle: p.vehicle_make ? `${p.vehicle_make} ${p.vehicle_model}` : "—",
      photoUrl: p.photoUrl || u.photoUrl || "",
      address: p.address || "", city: p.city || "", postalCode: p.postalCode || "",
      vehicle_type: p.vehicle_type || "",
      vehicle_make: p.vehicle_make || "",
      vehicle_model: p.vehicle_model || "",
      vehicle_year: p.vehicle_year || null,
      vehicle_color: p.vehicle_color || "",
      vehicle_plate: p.vehicle_plate || "",
      license_number: p.license_number || "",
      license_expiry: p.license_expiry || "",
      insurance_provider: p.insurance_provider || "",
      insurance_policy: p.insurance_policy || "",
      insurance_expiry: p.insurance_expiry || "",
      registration_expiry: p.registration_expiry || "",
      wallet_balance: p.wallet_balance || 0,
      total_paid,
      application_status: p.application_status || "draft",
      wizard_completed: p.wizard_completed || false,
    };

    return NextResponse.json({ driver });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { driverId: string } }) {
  try {
    const uid = params.driverId;
    const updates = await req.json();
    await adminDb.collection("driver_profiles").doc(uid).update({
      ...updates,
      updated_at: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
