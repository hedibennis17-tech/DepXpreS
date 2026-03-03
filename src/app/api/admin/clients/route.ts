export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");

    let query: FirebaseFirestore.Query = adminDb.collection("client_profiles");

    if (status) query = query.where("status", "==", status);

    const snap = await query.get();
    let clients = snap.docs.map((doc) => ({ id: doc.id, ...serializeDoc(doc.data()) }));

    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter((c: Record<string, unknown>) =>
        (c.firstName as string)?.toLowerCase().includes(s) ||
        (c.lastName as string)?.toLowerCase().includes(s) ||
        (c.email as string)?.toLowerCase().includes(s) ||
        (c.phone as string)?.toLowerCase().includes(s)
      );
    }

    clients.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const aDate = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return bDate - aDate;
    });

    const total = clients.length;
    const offset = (page - 1) * pageSize;
    const paginatedClients = clients.slice(offset, offset + pageSize);

    return NextResponse.json({
      clients: paginatedClients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/admin/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
