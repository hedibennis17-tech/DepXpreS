import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDHZkzDCSJXxltAnvWeSeC9wLylN93G3S0";

/**
 * GET /api/address/search?q=...&province=QC&city=...&limit=8&grand_montreal=true
 *
 * Stratégie de recherche:
 * 1. Si la requête commence par un chiffre → recherche Firestore BDOA par search_text
 * 2. Sinon → Google Maps Geocoding API (recherche par nom de rue)
 * 3. Fallback: Firestore par adr_complete_lower
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const province = searchParams.get("province") ?? "QC";
    const cityFilter = searchParams.get("city") ?? null;
    const limitParam = parseInt(searchParams.get("limit") ?? "8", 10);
    const limit = Math.min(Math.max(limitParam, 1), 20);
    const grandMontrealOnly = searchParams.get("grand_montreal") !== "false";

    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    // Normaliser la requête
    const qLower = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    const startsWithNumber = /^\d/.test(qLower);

    // ===== STRATÉGIE 1: Firestore BDOA (si commence par un numéro) =====
    if (startsWithNumber) {
      const snap = await adminDb
        .collection("bdoa_addresses")
        .where("search_text", ">=", qLower)
        .where("search_text", "<=", qLower + "\uf8ff")
        .limit(limit * 3)
        .get();

      let docs = snap.docs.filter((doc) => {
        const d = doc.data();
        if (province && d.province_code && d.province_code !== province) return false;
        if (grandMontrealOnly && !d.is_grand_montreal) return false;
        if (cityFilter && d.ville_pcs !== cityFilter.toUpperCase()) return false;
        return true;
      });

      if (docs.length >= 2) {
        const items = docs.slice(0, limit).map((doc) => formatDoc(doc));
        return NextResponse.json(
          { items, total: items.length, source: "bdoa" },
          { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
        );
      }
    }

    // ===== STRATÉGIE 2: Google Maps Geocoding API =====
    try {
      const region = "ca";
      const components = `country:CA|administrative_area:QC`;
      const biasLocation = grandMontrealOnly ? "&location=45.5017,-73.5673&radius=50000" : "";
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q + ", Québec, Canada")}&components=${encodeURIComponent(components)}&region=${region}${biasLocation}&key=${GOOGLE_MAPS_KEY}&language=fr`;

      const geoResp = await fetch(geocodeUrl, { signal: AbortSignal.timeout(3000) });
      const geoData = await geoResp.json();

      if (geoData.status === "OK" && geoData.results?.length > 0) {
        const items = geoData.results.slice(0, limit).map((result: {
          formatted_address: string;
          address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
          geometry: { location: { lat: number; lng: number } };
          place_id: string;
        }) => {
          const comps = result.address_components || [];
          const getComp = (type: string) =>
            comps.find((c) => c.types.includes(type))?.long_name || "";
          const getCompShort = (type: string) =>
            comps.find((c) => c.types.includes(type))?.short_name || "";

          const streetNumber = getComp("street_number");
          const route = getComp("route");
          const city =
            getComp("locality") ||
            getComp("sublocality") ||
            getComp("administrative_area_level_3");
          const postalCode = getComp("postal_code");
          const provinceShort = getCompShort("administrative_area_level_1");

          const line1 = [streetNumber, route].filter(Boolean).join(" ") || route;
          const fullLabel = result.formatted_address;

          return {
            addressId: result.place_id,
            label: line1 || fullLabel,
            fullLabel,
            line1,
            city,
            provinceCode: provinceShort || "QC",
            postalCode,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            supplier: "Google Maps",
            isGrandMontreal: true,
            matchScore: 0.85,
          };
        });

        return NextResponse.json(
          { items, total: items.length, source: "google" },
          { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
        );
      }
    } catch {
      // Google Maps échoué, continuer avec Firestore fallback
    }

    // ===== STRATÉGIE 3: Firestore fallback (search_text pour tout) =====
    const snap = await adminDb
      .collection("bdoa_addresses")
      .where("search_text", ">=", qLower)
      .where("search_text", "<=", qLower + "\uf8ff")
      .limit(limit * 3)
      .get();

    let docs = snap.docs.filter((doc) => {
      const d = doc.data();
      if (province && d.province_code && d.province_code !== province) return false;
      if (grandMontrealOnly && !d.is_grand_montreal) return false;
      if (cityFilter && d.ville_pcs !== cityFilter.toUpperCase()) return false;
      return true;
    });

    const items = docs.slice(0, limit).map((doc) => formatDoc(doc));
    return NextResponse.json(
      { items, total: items.length, source: "bdoa_fallback" },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Address search error:", error);
    return NextResponse.json({ error: "Search failed", items: [] }, { status: 500 });
  }
}

function formatDoc(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const d = doc.data();
  const line1 =
    d.line1 ||
    [d.numero_rue, d.nom_rue, d.type_rue, d.dir_rue].filter(Boolean).join(" ");
  const cityName = d.ville_pcs || d.ville || d.sdrnom || "";
  const label =
    d.adr_complete ||
    `${line1}, ${cityName}, ${d.province_code} ${d.code_postal || ""}`.trim();

  const postalFormatted =
    d.code_postal
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
    supplier: d.fournisseur || "BDOA",
    isGrandMontreal: d.is_grand_montreal || false,
    matchScore: 0.9,
  };
}
