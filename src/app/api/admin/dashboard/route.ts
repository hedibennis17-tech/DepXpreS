export const runtime = "nodejs";
export const maxDuration = 30; // 30s Vercel timeout

import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/firestore-rest";

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const ACTIVE_STATUSES = ["pending","confirmed","preparing","ready","driver_assigned","driver_en_route_store","at_store","en_route","delivering"];
    const COMPLETED_STATUSES = ["delivered","completed"];

    // Fetch avec LIMITES pour eviter timeout Vercel (avant: sans limite = timeout!)
    const [orders, drivers, clients, stores] = await Promise.all([
      getCollection("orders", { orderBy: "createdAt", orderDirection: "DESCENDING", limit: 300 }),
      getCollection("driver_profiles", { limit: 200 }),
      getCollection("client_profiles", { limit: 500 }),
      getCollection("stores", { limit: 100 }),
    ]);

    const processedOrders = orders.map(o => ({
      id: o.id,
      status: (o.status as string) || "pending",
      total: Number(o.total) || 0,
      createdAt: (o.createdAt as string) || null,
      clientName: (o.clientName as string) || "Client",
      driverName: (o.driverName as string) || null,
      storeName: (o.storeName as string) || null,
      orderNumber: (o.orderNumber as string) || null,
      paymentStatus: (o.paymentStatus as string) || null,
    }));

    const todayOrders    = processedOrders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
    const weekOrders     = processedOrders.filter(o => o.createdAt && new Date(o.createdAt) >= weekStart);
    const activeOrders   = processedOrders.filter(o => ACTIVE_STATUSES.includes(o.status));
    const completedToday = todayOrders.filter(o => COMPLETED_STATUSES.includes(o.status));
    const cancelledToday = todayOrders.filter(o => o.status === "cancelled");

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const weekRevenue  = weekOrders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = processedOrders.reduce((sum, o) => sum + o.total, 0);

    const onlineDriversList = drivers
      .filter(d => d.isOnline === true)
      .map(d => ({
        id: d.id,
        full_name: (d.displayName as string) || (d.name as string) || "Chauffeur",
      }));

    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = processedOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= day && d <= dayEnd;
      });
      weeklyChart.push({
        date:      day.toISOString().split("T")[0],
        label:     day.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric" }),
        orders:    dayOrders.length,
        revenue:   dayOrders.reduce((sum, o) => sum + o.total, 0),
        completed: dayOrders.filter(o => COMPLETED_STATUSES.includes(o.status)).length,
      });
    }

    return NextResponse.json({
      todayOrders:      todayOrders.length,
      todayRevenue,
      weekOrders:       weekOrders.length,
      weekRevenue,
      totalOrders:      processedOrders.length,
      totalRevenue,
      activeOrders:     activeOrders.length,
      completedToday:   completedToday.length,
      cancelledToday:   cancelledToday.length,
      avgDeliveryTime:  35,
      totalDrivers:     drivers.length,
      onlineDrivers:    onlineDriversList.length,
      busyDrivers:      drivers.filter(d => d.status === "busy" || d.currentOrderId).length,
      availableDrivers: drivers.filter(d => d.isOnline === true && !d.currentOrderId).length,
      onlineDriversList,
      totalClients:     clients.length,
      activeClients:    clients.filter(c => c.isActive !== false).length,
      totalStores:      stores.length,
      openStores:       stores.filter(s => s.isOpen === true).length,
      weeklyChart,
      recentOrders:     processedOrders.slice(0, 10),
      activeOrdersList: activeOrders.slice(0, 10),
      topDrivers: drivers
        .map(d => ({
          id: d.id,
          name: (d.displayName as string) || (d.name as string) || "Chauffeur",
          completedOrders: Number(d.completedOrders) || 0,
          rating: Number(d.rating) || 0,
          isOnline: d.isOnline === true,
        }))
        .sort((a, b) => b.completedOrders - a.completedOrders)
        .slice(0, 5),
    });

  } catch (error: unknown) {
    console.error("Dashboard API error:", error);
    const e = error as Error;
    return NextResponse.json(
      { error: "Erreur lors du chargement.", details: e.message },
      { status: 500 }
    );
  }
}
