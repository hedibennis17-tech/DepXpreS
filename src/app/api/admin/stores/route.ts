import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

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
    const zoneId = searchParams.get("zoneId") || "";

    let query: FirebaseFirestore.Query = adminDb.collection("stores");
    if (status) query = query.where("status", "==", status);
    if (zoneId) query = query.where("zoneId", "==", zoneId);

    const snap = await query.get();
    let stores = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));

    if (search) {
      const s = search.toLowerCase();
      stores = stores.filter((st: Record<string, unknown>) =>
        (st.name as string)?.toLowerCase().includes(s) ||
        (st.address as string)?.toLowerCase().includes(s)
      );
    }

    stores.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      ((b.totalOrders as number) || 0) - ((a.totalOrders as number) || 0)
    );

    return NextResponse.json({ stores, total: stores.length });
  } catch (error) {
    console.error("GET /api/admin/stores error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, phone, zoneId, ownerId, status = "active" } = body;

    if (!name || !address) {
      return NextResponse.json({ error: "name and address required" }, { status: 400 });
    }

    const storeRef = await adminDb.collection("stores").add({
      name, address, phone, zoneId, ownerId, status,
      totalOrders: 0, totalRevenue: 0, rating: 5.0,
      isOpen: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, storeId: storeRef.id });
  } catch (error) {
    console.error("POST /api/admin/stores error:", error);
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}
