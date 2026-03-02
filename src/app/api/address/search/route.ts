import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * GET /api/address/search?q=...&province=QC&city=Laval&limit=8
 * Autocomplete d'adresses depuis la collection BDOA Firestore
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const province = searchParams.get("province") ?? "QC";
    const city = searchParams.get("city") ?? null;
    const limitParam = parseInt(searchParams.get("limit") ?? "8", 10);
    const limit = Math.min(Math.max(limitParam, 1), 20);

    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const grandMontrealOnly = searchParams.get("grand_montreal") === "true";
    const qLower = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    // Recherche dans Firestore collection bdoa_addresses
    let query = adminDb
      .collection("bdoa_addresses")
      .where("province_code", "==", province);

    if (grandMontrealOnly) {
      query = query.where("is_grand_montreal", "==", true) as typeof query;
    }

    if (city) {
      query = query.where("ville_pcs", "==", city.toUpperCase()) as typeof query;
    }

    // Recherche par préfixe sur search_text
    const snapshot = await query
      .where("search_text", ">=", qLower)
      .where("search_text", "<=", qLower + "\uf8ff")
      .limit(limit * 3)
      .get();

    // Si pas assez de résultats, chercher aussi par adr_complete
    let docs = snapshot.docs;

    if (docs.length < limit) {
      const snapshot2 = await adminDb
        .collection("bdoa_addresses")
        .where("province_code", "==", province)
        .where("adr_complete_lower", ">=", qLower)
        .where("adr_complete_lower", "<=", qLower + "\uf8ff")
        .limit(limit * 2)
        .get();

      // Fusionner les résultats sans doublons
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
      const line1 = [d.numero_rue, d.nom_rue, d.type_rue, d.dir_rue]
        .filter(Boolean)
        .join(" ");
      const cityName = d.ville_pcs || d.ville || d.sdrnom || "";
      const label = d.adr_complete || `${line1}, ${cityName}, ${d.province_code} ${d.code_postal || ""}`.trim();

      const postalFormatted = d.code_postal
        ? d.code_postal.length === 6
          ? `${d.code_postal.slice(0, 3)} ${d.code_postal.slice(3)}`
          : d.code_postal
        : "";
      const fullLabel = [line1 || d.adr_complete, cityName, d.province_code || "QC", postalFormatted]
        .filter(Boolean)
        .join(", ");

      return {
        addressId: doc.id,
        label: label.trim(),
        fullLabel: fullLabel.trim(),
        line1: line1 || d.adr_complete || "",
        city: cityName,
        provinceCode: d.province_code || "QC",
        postalCode: postalFormatted || d.code_postal || "",
        latitude: d.latitude || 0,
        longitude: d.longitude || 0,
        supplier: d.fournisseur || "",
        isGrandMontreal: d.is_grand_montreal || false,
        matchScore: 0.9,
      };
    });

    return NextResponse.json(
      { items, total: items.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json({ error: "Search failed", items: [] }, { status: 500 });
  }
}
