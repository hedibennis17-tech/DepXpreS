export const runtime = "nodejs";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DELIVERY_ZONES } from "@/lib/delivery-zones";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== "depxpres-zones-2026")
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const BATCH_SIZE = 400;
    let count = 0;

    for (let i = 0; i < DELIVERY_ZONES.length; i += BATCH_SIZE) {
      const batch = adminDb.batch();
      DELIVERY_ZONES.slice(i, i + BATCH_SIZE).forEach(zone => {
        const ref = adminDb.collection("delivery_zones").doc(zone.id);
        batch.set(ref, zone);
        count++;
      });
      await batch.commit();
    }

    const active = DELIVERY_ZONES.filter(z => z.is_active).length;
    const core = DELIVERY_ZONES.filter(z => z.is_core).length;

    return NextResponse.json({
      ok: true,
      message: "Zones seedées avec succès ✅",
      stats: {
        total: count,
        active,
        core,
        expansion: count - core,
        groups: [...new Set(DELIVERY_ZONES.map(z => z.delivery_zone_group))]
      }
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
