export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;

    // Get all completed orders for this driver
    const ordersSnap = await adminDb
      .collection("orders")
      .where("driverId", "==", driverId)
      .where("status", "in", ["delivered", "completed"])
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    // Calculate earnings
    const totalDeliveries = orders.length;
    const totalEarnings = orders.reduce((sum, o: Record<string, unknown>) => sum + ((o.deliveryFee as number) || 0) + ((o.tipAmount as number) || 0), 0);
    const totalTips = orders.reduce((sum, o: Record<string, unknown>) => sum + ((o.tipAmount as number) || 0), 0);
    const totalDeliveryFees = orders.reduce((sum, o: Record<string, unknown>) => sum + ((o.deliveryFee as number) || 0), 0);

    // Weekly breakdown (last 7 days)
    const now = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const dayOrders = orders.filter((o: Record<string, unknown>) =>
        o.createdAt && (o.createdAt as string).startsWith(dateStr)
      );
      return {
        date: dateStr,
        deliveries: dayOrders.length,
        earnings: dayOrders.reduce((sum, o: Record<string, unknown>) =>
          sum + ((o.deliveryFee as number) || 0) + ((o.tipAmount as number) || 0), 0),
      };
    });

    // Today
    const todayStr = now.toISOString().split("T")[0];
    const todayOrders = orders.filter((o: Record<string, unknown>) =>
      o.createdAt && (o.createdAt as string).startsWith(todayStr)
    );
    const todayEarnings = todayOrders.reduce((sum, o: Record<string, unknown>) =>
      sum + ((o.deliveryFee as number) || 0) + ((o.tipAmount as number) || 0), 0);

    return NextResponse.json({
      totalDeliveries,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalTips: Math.round(totalTips * 100) / 100,
      totalDeliveryFees: Math.round(totalDeliveryFees * 100) / 100,
      todayDeliveries: todayOrders.length,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
      weeklyData,
      recentOrders: orders.slice(0, 20),
    });
  } catch (error) {
    console.error("GET driver earnings error:", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
