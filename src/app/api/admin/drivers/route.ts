import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Serialise les timestamps Firestore en ISO strings pour éviter les erreurs d'hydratation React
function serializeDoc(data: FirebaseFirestore.DocumentData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      result[key] = (value as { toDate: () => Date }).toDate().toISOString();
    } else if (value && typeof value === "object" && "_seconds" in value) {
      result[key] = new Date((value as { _seconds: number })._seconds * 1000).toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const applicationStatus = searchParams.get("applicationStatus") || "";
    const isOnlineParam = searchParams.get("isOnline") || "";
    const zoneId = searchParams.get("zoneId") || "";
    const limitParam = parseInt(searchParams.get("limit") || "100");

    let query: FirebaseFirestore.Query = adminDb.collection("driver_profiles");

    if (applicationStatus) query = query.where("applicationStatus", "==", applicationStatus);
    if (zoneId) query = query.where("zoneId", "==", zoneId);

    const snap = await query.limit(limitParam).get();
    let drivers = snap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    // Filtre isOnline côté serveur (évite index composite)
    if (isOnlineParam !== "") {
      const online = isOnlineParam === "true";
      drivers = drivers.filter((d) => (d as Record<string, unknown>).isOnline === online);
    }

    // Filtre de recherche textuelle
    if (search) {
      const s = search.toLowerCase();
      drivers = drivers.filter((d) => {
        const dr = d as Record<string, unknown>;
        return (
          String(dr.firstName || "").toLowerCase().includes(s) ||
          String(dr.lastName || "").toLowerCase().includes(s) ||
          String(dr.email || "").toLowerCase().includes(s) ||
          String(dr.phone || "").toLowerCase().includes(s)
        );
      });
    }

    // Tri par date de création décroissante (côté serveur, pas d'index requis)
    drivers.sort((a, b) => {
      const aDate = (a as Record<string, unknown>).createdAt
        ? new Date((a as Record<string, unknown>).createdAt as string).getTime()
        : 0;
      const bDate = (b as Record<string, unknown>).createdAt
        ? new Date((b as Record<string, unknown>).createdAt as string).getTime()
        : 0;
      return bDate - aDate;
    });

    return NextResponse.json({ drivers, total: drivers.length });
  } catch (error) {
    console.error("GET /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone, zoneId, zoneName,
      applicationStatus = "pending",
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, email requis" },
        { status: 400 }
      );
    }

    const newDriver = {
      firstName,
      lastName,
      email,
      phone: phone || "",
      zoneId: zoneId || "",
      zoneName: zoneName || "",
      applicationStatus,
      isOnline: false,
      rating: 0,
      totalDeliveries: 0,
      accountCreated: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("driver_profiles").add(newDriver);
    return NextResponse.json({ success: true, driverId: docRef.id });
  } catch (error) {
    console.error("POST /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, updates } = body;

    if (!driverId || !updates) {
      return NextResponse.json(
        { error: "driverId et updates requis" },
        { status: 400 }
      );
    }

    await adminDb.collection("driver_profiles").doc(driverId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, driverId });
  } catch (error) {
    console.error("PATCH /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}
