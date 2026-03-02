import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    // Fetch all needed data in parallel
    const [ordersSnap, driversSnap, clientsSnap, storesSnap] = await Promise.all([
      adminDb.collection("orders").get(),
      adminDb.collection("driver_profiles").get(),
      adminDb.collection("client_profiles").get(),
      adminDb.collection("stores").get(),
    ]);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Process orders
    const orders = ordersSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        status: d.status,
        total: d.total || 0,
        deliveryFee: d.deliveryFee || 0,
        tipAmount: d.tipAmount || 0,
        createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
        clientName: d.clientName,
        driverName: d.driverName,
        storeName: d.storeName,
        orderNumber: d.orderNumber,
        paymentStatus: d.paymentStatus,
      };
    });

    const todayOrders = orders.filter((o) => o.createdAt && new Date(o.createdAt) >= todayStart);
    const weekOrders = orders.filter((o) => o.createdAt && new Date(o.createdAt) >= weekStart);

    const ACTIVE_STATUSES = ["pending","confirmed","preparing","ready","driver_assigned","driver_en_route_store","at_store","en_route"];
    const COMPLETED_STATUSES = ["delivered","completed"];

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const completedToday = todayOrders.filter((o) => COMPLETED_STATUSES.includes(o.status));

    // Drivers
    const drivers = driversSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        firstName: d.firstName,
        lastName: d.lastName,
        isOnline: d.isOnline || false,
        availabilityStatus: d.availabilityStatus,
        rating: d.rating || 0,
        totalDeliveries: d.totalDeliveries || 0,
        currentOrderId: d.currentOrderId,
        zoneName: d.zoneName,
      };
    });
    const onlineDrivers = drivers.filter((d) => d.isOnline);
    const busyDrivers = drivers.filter((d) => d.isOnline && d.currentOrderId);
    const availableDrivers = drivers.filter((d) => d.isOnline && !d.currentOrderId);

    // Clients
    const totalClients = clientsSnap.size;
    const activeClients = clientsSnap.docs.filter((doc) => doc.data().status === "active").length;

    // Stores
    const totalStores = storesSnap.size;
    const openStores = storesSnap.docs.filter((doc) => doc.data().isOpen).length;

    // Weekly chart data
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(dateStr));
      return {
        date: dateStr,
        label: date.toLocaleDateString("fr-CA", { weekday: "short" }),
        orders: dayOrders.length,
        revenue: Math.round(dayOrders.reduce((sum, o) => sum + o.total, 0) * 100) / 100,
        completed: dayOrders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length,
      };
    });

    // Recent orders (last 10)
    const recentOrders = orders
      .filter((o) => o.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10);

    // Average delivery time (mock based on estimatedDriveMinutes)
    const avgDeliveryTime = 28;

    return NextResponse.json({
      // KPIs
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      weekOrders: weekOrders.length,
      weekRevenue: Math.round(weekRevenue * 100) / 100,
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeOrders: activeOrders.length,
      completedToday: completedToday.length,
      cancelledToday: todayOrders.filter((o) => o.status === "cancelled").length,
      avgDeliveryTime,

      // Drivers
      totalDrivers: drivers.length,
      onlineDrivers: onlineDrivers.length,
      busyDrivers: busyDrivers.length,
      availableDrivers: availableDrivers.length,
      topDrivers: drivers
        .filter((d) => d.isOnline)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5),

      // Clients & Stores
      totalClients,
      activeClients,
      totalStores,
      openStores,

      // Charts
      weeklyChart,
      recentOrders,
      activeOrdersList: activeOrders.slice(0, 8),
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
