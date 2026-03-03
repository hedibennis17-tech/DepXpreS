export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

type OrderData = {
  createdAt: string | null;
  status?: string;
  total?: number;
  deliveryFee?: number;
  tipAmount?: number;
  estimatedPrepMinutes?: number;
  estimatedDriveMinutes?: number;
  [key: string]: unknown;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const zoneId = searchParams.get("zoneId");
    const storeId = searchParams.get("storeId");

    let query: FirebaseFirestore.Query = adminDb.collection("orders");

    if (zoneId) query = query.where("zoneId", "==", zoneId);
    if (storeId) query = query.where("storeId", "==", storeId);

    const snapshot = await query.get();
    let orders: OrderData[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        ...d,
        createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
        status: d.status as string | undefined,
        total: typeof d.total === 'number' ? d.total : 0,
        deliveryFee: typeof d.deliveryFee === 'number' ? d.deliveryFee : 0,
        tipAmount: typeof d.tipAmount === 'number' ? d.tipAmount : 0,
        estimatedPrepMinutes: typeof d.estimatedPrepMinutes === 'number' ? d.estimatedPrepMinutes : 0,
        estimatedDriveMinutes: typeof d.estimatedDriveMinutes === 'number' ? d.estimatedDriveMinutes : 0,
      } as OrderData;
    });

    // Date filters
    if (dateFrom) orders = orders.filter((o) => o.createdAt && o.createdAt >= dateFrom);
    if (dateTo) orders = orders.filter((o) => o.createdAt && o.createdAt <= dateTo);

    const PENDING_STATUSES = ["pending", "confirmed", "paid", "store_confirmed"];
    const PREPARING_STATUSES = ["preparing", "ready", "ready_for_pickup"];
    const DELIVERING_STATUSES = [
      "driver_assigned",
      "driver_en_route_store",
      "at_store",
      "picked_up",
      "en_route",
      "driver_en_route_customer",
      "arrived",
    ];
    const COMPLETED_STATUSES = ["delivered", "completed"];
    const CANCELLED_STATUSES = ["cancelled", "refunded", "disputed"];

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => PENDING_STATUSES.includes(o.status || '')).length;
    const preparingOrders = orders.filter((o) => PREPARING_STATUSES.includes(o.status || '')).length;
    const deliveringOrders = orders.filter((o) => DELIVERING_STATUSES.includes(o.status || '')).length;
    const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status || '')).length;
    const cancelledOrders = orders.filter((o) => CANCELLED_STATUSES.includes(o.status || '')).length;

    const grossTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalDeliveryFees = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalTips = orders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);
    const avgPrepMinutes =
      orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.estimatedPrepMinutes || 0), 0) / orders.length
        : 0;
    const avgDriveMinutes =
      orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.estimatedDriveMinutes || 0), 0) / orders.length
        : 0;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => o.createdAt && new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveringOrders,
      completedOrders,
      cancelledOrders,
      grossTotal: Math.round(grossTotal * 100) / 100,
      totalDeliveryFees: Math.round(totalDeliveryFees * 100) / 100,
      totalTips: Math.round(totalTips * 100) / 100,
      avgPrepMinutes: Math.round(avgPrepMinutes * 100) / 100,
      avgDriveMinutes: Math.round(avgDriveMinutes * 100) / 100,
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
    });
  } catch (error) {
    console.error("GET /api/admin/orders/metrics error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
