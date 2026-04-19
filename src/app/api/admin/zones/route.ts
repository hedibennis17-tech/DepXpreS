export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function checkAuth(req: NextRequest) {
  const role = req.cookies.get("admin_role")?.value;
  const token = req.cookies.get("admin_token")?.value;
  return (role && ["super_admin","admin","dispatcher"].includes(role)) || !!token;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const group = searchParams.get("group");

    const snap = await adminDb.collection("delivery_zones").orderBy("sort_order").get();
    let zones = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    if (status === "active") zones = zones.filter(z => z.is_active);
    if (status === "inactive") zones = zones.filter(z => !z.is_active);
    if (group) zones = zones.filter(z => z.delivery_zone_group === group);

    // Enrichir avec stats temps réel
    const enriched = await Promise.all(zones.map(async (zone: any) => {
      try {
        const [ordersSnap, driversSnap, storesSnap] = await Promise.all([
          adminDb.collection("orders").where("zoneId", "==", zone.id).limit(500).get(),
          adminDb.collection("drivers").where("zoneId", "==", zone.id).limit(100).get(),
          adminDb.collection("stores").where("zoneName", "in", [zone.name, ...(zone.aliases || [])]).limit(100).get(),
        ]);
        return { ...zone, ordersCount: ordersSnap.size, driversCount: driversSnap.size, storesCount: storesSnap.size };
      } catch {
        return { ...zone, ordersCount: 0, driversCount: 0, storesCount: 0 };
      }
    }));

    return NextResponse.json({ zones: enriched, total: enriched.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const docId = id || body.slug || `zone-${Date.now()}`;
    await adminDb.collection("delivery_zones").doc(docId).set({
      ...data,
      is_active: data.is_active ?? true,
      is_core: data.is_core ?? true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, id: docId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { zoneId, updates } = await req.json();
    if (!zoneId) return NextResponse.json({ error: "zoneId requis" }, { status: 400 });
    await adminDb.collection("delivery_zones").doc(zoneId).update({
      ...updates, updatedAt: FieldValue.serverTimestamp()
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
