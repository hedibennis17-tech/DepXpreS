export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const snap = await adminDb.collection("categories").orderBy("sortOrder", "asc").get();
    const categories = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
