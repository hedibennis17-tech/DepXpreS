import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * POST /api/address/reverse
 * Body: { latitude: number, longitude: number, radiusMeters?: number, province?: string }
 * Retourne l'adresse BDOA la plus proche des coordonnées GPS fournies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, radiusMeters = 500, province = "QC" } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "latitude and longitude are required", item: null },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates", item: null },
        { status: 400 }
      );
    }

    // Calculer une bounding box approximative pour filtrer
    // 1 degré de latitude ≈ 111km, 1 degré de longitude ≈ 111km * cos(lat)
    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    const snapshot = await adminDb
      .collection("bdoa_addresses")
      .where("province_code", "==", province)
      .where("latitude", ">=", lat - latDelta)
      .where("latitude", "<=", lat + latDelta)
      .limit(50)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ item: null });
    }

    // Trouver l'adresse la plus proche
    let closest: { doc: FirebaseFirestore.QueryDocumentSnapshot; distance: number } | null = null;

    for (const doc of snapshot.docs) {
      const d = doc.data();
      const docLat = d.latitude as number;
      const docLng = d.longitude as number;

      // Vérifier aussi la longitude
      if (Math.abs(docLng - lng) > lngDelta) continue;

      // Distance Haversine simplifiée
      const dLat = ((docLat - lat) * Math.PI) / 180;
      const dLng = ((docLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((docLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371000 * c; // en mètres

      if (!closest || distance < closest.distance) {
        closest = { doc, distance };
      }
    }

    if (!closest) {
      return NextResponse.json({ item: null });
    }

    const d = closest.doc.data();
    const line1 = [d.numero_rue, d.nom_rue, d.type_rue, d.dir_rue]
      .filter(Boolean)
      .join(" ");
    const cityName = d.ville_pcs || d.ville || d.sdrnom || "";
    const label = d.adr_complete || `${line1}, ${cityName}, ${d.province_code} ${d.code_postal || ""}`.trim();

    return NextResponse.json({
      item: {
        addressId: closest.doc.id,
        label: label.trim(),
        line1: line1 || d.adr_complete || "",
        city: cityName,
        provinceCode: d.province_code || "QC",
        postalCode: d.code_postal || "",
        latitude: d.latitude || 0,
        longitude: d.longitude || 0,
        supplier: d.fournisseur || "",
        distanceMeters: Math.round(closest.distance),
      },
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return NextResponse.json({ error: "Reverse geocode failed", item: null }, { status: 500 });
  }
}
