import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * GET /api/address/resolve?q=...&province=QC&city=Laval
 * Résolution d'une adresse complète (meilleur match unique)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const province = searchParams.get("province") ?? "QC";
    const city = searchParams.get("city") ?? null;

    if (q.length < 3) {
      return NextResponse.json({ item: null });
    }

    const qLower = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let query = adminDb
      .collection("bdoa_addresses")
      .where("province_code", "==", province)
      .where("search_text", ">=", qLower)
      .where("search_text", "<=", qLower + "\uf8ff")
      .limit(1);

    if (city) {
      query = adminDb
        .collection("bdoa_addresses")
        .where("province_code", "==", province)
        .where("ville_pcs", "==", city.toUpperCase())
        .where("search_text", ">=", qLower)
        .where("search_text", "<=", qLower + "\uf8ff")
        .limit(1);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({ item: null });
    }

    const doc = snapshot.docs[0];
    const d = doc.data();
    const line1 = [d.numero_rue, d.nom_rue, d.type_rue, d.dir_rue]
      .filter(Boolean)
      .join(" ");
    const cityName = d.ville_pcs || d.ville || d.sdrnom || "";
    const label = d.adr_complete || `${line1}, ${cityName}, ${d.province_code} ${d.code_postal || ""}`.trim();

    return NextResponse.json({
      item: {
        addressId: doc.id,
        label: label.trim(),
        line1: line1 || d.adr_complete || "",
        city: cityName,
        provinceCode: d.province_code || "QC",
        postalCode: d.code_postal || "",
        latitude: d.latitude || 0,
        longitude: d.longitude || 0,
        supplier: d.fournisseur || "",
        matchScore: 1.0,
      },
    });
  } catch (error) {
    console.error("Address resolve error:", error);
    return NextResponse.json({ error: "Resolve failed", item: null }, { status: 500 });
  }
}
