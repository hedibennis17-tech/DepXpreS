import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/address/search?q=...&province=QC&city=...&limit=10
 * Recherche d'adresses BDOA pour l'interface admin
 */
export async function GET(req: NextRequest) {
  try {
    // Vérification auth admin optionnelle (peut être public pour les formulaires)
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const province = searchParams.get("province") ?? "QC";
    const city = searchParams.get("city") ?? null;
    const limitParam = parseInt(searchParams.get("limit") ?? "10", 10);
    const limit = Math.min(Math.max(limitParam, 1), 20);
    const grandMontrealOnly = searchParams.get("grand_montreal") === "true";

    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const qLower = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    let query = adminDb
      .collection("bdoa_addresses")
      .where("province_code", "==", province);

    if (grandMontrealOnly) {
      query = query.where("is_grand_montreal", "==", true) as typeof query;
    }

    if (city) {
      query = query.where("ville_pcs", "==", city.toUpperCase()) as typeof query;
    }

    // Recherche par search_text (préfixe)
    const snapshot = await query
      .where("search_text", ">=", qLower)
      .where("search_text", "<=", qLower + "\uf8ff")
      .limit(limit * 2)
      .get();

    let docs = snapshot.docs;

    // Si pas assez, chercher par adr_complete_lower
    if (docs.length < limit) {
      const snapshot2 = await adminDb
        .collection("bdoa_addresses")
        .where("province_code", "==", province)
        .where("adr_complete_lower", ">=", qLower)
        .where("adr_complete_lower", "<=", qLower + "\uf8ff")
        .limit(limit)
        .get();

      const existingIds = new Set(docs.map((d) => d.id));
      for (const doc of snapshot2.docs) {
        if (!existingIds.has(doc.id)) {
          docs.push(doc);
          existingIds.add(doc.id);
        }
      }
    }

    const items = docs.slice(0, limit).map((doc) => {
      const d = doc.data();
      const cityName = d.ville_pcs || d.ville || d.sdrnom || "";
      return {
        addressId: doc.id,
        label: d.label || d.adr_complete || "",
        line1: d.line1 || d.adr_complete || "",
        city: cityName,
        provinceCode: d.province_code || "QC",
        postalCode: d.code_postal || "",
        latitude: d.latitude || 0,
        longitude: d.longitude || 0,
        supplier: d.fournisseur || "",
        isGrandMontreal: d.is_grand_montreal || false,
      };
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Admin address search error:", error);
    return NextResponse.json(
      { error: "Search failed", items: [] },
      { status: 500 }
    );
  }
}
