import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function serializeDoc(data: FirebaseFirestore.DocumentData) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      result[key] = value.toDate().toISOString();
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
    const status = searchParams.get("status") || "";
    const applicationStatus = searchParams.get("applicationStatus") || "";
    const isOnline = searchParams.get("isOnline") || "";
    const zoneId = searchParams.get("zoneId") || "";

    let query: FirebaseFirestore.Query = adminDb.collection("driver_profiles");

    if (status) query = query.where("status", "==", status);
    if (applicationStatus) query = query.where("applicationStatus", "==", applicationStatus);
    if (zoneId) query = query.where("zoneId", "==", zoneId);

    const snap = await query.get();
    let drivers = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));

    if (isOnline !== "") {
      const online = isOnline === "true";
      drivers = drivers.filter((d: Record<string, unknown>) => d.isOnline === online);
    }

    if (search) {
      const s = search.toLowerCase();
      drivers = drivers.filter((d: Record<string, unknown>) =>
        (d.firstName as string)?.toLowerCase().includes(s) ||
        (d.lastName as string)?.toLowerCase().includes(s) ||
        (d.email as string)?.toLowerCase().includes(s) ||
        (d.phone as string)?.toLowerCase().includes(s)
      );
    }

    // Sort by createdAt desc
    drivers.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aDate = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return bDate - aDate;
    });

    return NextResponse.json({ drivers, total: drivers.length });
  } catch (error) {
    console.error("GET /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, updates } = body;

    if (!driverId || !updates) {
      return NextResponse.json({ error: "driverId and updates required" }, { status: 400 });
    }

    await adminDb.collection("driver_profiles").doc(driverId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/drivers error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}
