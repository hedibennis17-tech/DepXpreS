import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const orderStatus = searchParams.get("orderStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const storeId = searchParams.get("storeId") || "";
    const driverId = searchParams.get("driverId") || "";
    const zoneId = searchParams.get("zoneId") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");

    // Récupérer toutes les commandes sans orderBy pour éviter les index composites
    const snapshot = await adminDb.collection("orders").get();
    
    let rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : null),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        estimatedDeliveryAt: data.estimatedDeliveryAt?.toDate?.()?.toISOString() || null,
        deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || null,
      };
    }) as any[];

    // Filtres côté serveur (après récupération)
    if (orderStatus) {
      const statuses = orderStatus.split(",");
      rows = rows.filter(r => statuses.includes(r.status));
    }
    if (paymentStatus) rows = rows.filter(r => r.paymentStatus === paymentStatus);
    if (storeId) rows = rows.filter(r => r.storeId === storeId);
    if (driverId) rows = rows.filter(r => r.driverId === driverId);
    if (zoneId) rows = rows.filter(r => r.zoneId === zoneId);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        r.id?.toLowerCase().includes(s) ||
        r.orderNumber?.toLowerCase().includes(s) ||
        r.clientName?.toLowerCase().includes(s) ||
        r.driverName?.toLowerCase().includes(s) ||
        r.storeName?.toLowerCase().includes(s)
      );
    }
    if (dateFrom) rows = rows.filter(r => r.createdAt && r.createdAt >= dateFrom);
    if (dateTo) rows = rows.filter(r => r.createdAt && r.createdAt <= dateTo);

    // Trier par date décroissante
    rows.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    const paginatedRows = rows.slice(offset, offset + pageSize);

    return NextResponse.json({
      rows: paginatedRows,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
