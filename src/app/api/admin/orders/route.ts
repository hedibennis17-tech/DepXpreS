import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    // Apply filters
    if (orderStatus) {
      const statuses = orderStatus.split(",");
      if (statuses.length === 1) {
        query = query.where("status", "==", statuses[0]);
      }
    }
    if (paymentStatus) {
      query = query.where("paymentStatus", "==", paymentStatus);
    }
    if (storeId) {
      query = query.where("storeId", "==", storeId);
    }
    if (driverId) {
      query = query.where("driverId", "==", driverId);
    }
    if (zoneId) {
      query = query.where("zoneId", "==", zoneId);
    }

    query = query.orderBy("createdAt", "desc");

    const snapshot = await query.get();
    let rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        estimatedDeliveryAt: data.estimatedDeliveryAt?.toDate?.()?.toISOString() || null,
        deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
        cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Client-side search filter
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.id?.toLowerCase().includes(s) ||
          r.orderNumber?.toLowerCase().includes(s) ||
          r.clientName?.toLowerCase().includes(s) ||
          r.driverName?.toLowerCase().includes(s) ||
          r.storeName?.toLowerCase().includes(s)
      );
    }

    // Multiple status filter
    if (orderStatus && orderStatus.includes(",")) {
      const statuses = orderStatus.split(",");
      rows = rows.filter((r) => statuses.includes(r.status));
    }

    // Date filters
    if (dateFrom) {
      rows = rows.filter((r) => r.createdAt && r.createdAt >= dateFrom);
    }
    if (dateTo) {
      rows = rows.filter((r) => r.createdAt && r.createdAt <= dateTo);
    }

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
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
