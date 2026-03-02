import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Get order to find driver
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    const order = orderDoc.data();

    // Simulated tracking points around Montreal/Laval
    const basePoints = [
      { lat: 45.5586, lng: -73.7553 },
      { lat: 45.5600, lng: -73.7520 },
      { lat: 45.5620, lng: -73.7490 },
      { lat: 45.5640, lng: -73.7460 },
      { lat: 45.5660, lng: -73.7430 },
    ];

    const trackingPoints = basePoints.map((p, i) => ({
      lat: p.lat + (Math.random() - 0.5) * 0.002,
      lng: p.lng + (Math.random() - 0.5) * 0.002,
      heading: 45 + i * 15,
      speedKmh: 30 + Math.random() * 20,
      capturedAt: new Date(Date.now() - (4 - i) * 5 * 60 * 1000).toISOString(),
    }));

    const driverLocation = order?.driverId
      ? {
          driverId: order.driverId,
          lat: 45.5660 + (Math.random() - 0.5) * 0.005,
          lng: -73.7430 + (Math.random() - 0.5) * 0.005,
          heading: 90,
          speedKmh: 35,
          capturedAt: new Date().toISOString(),
        }
      : null;

    return NextResponse.json({
      trackingPoints,
      driverLocation,
      sessionStatus: order?.status === "completed" ? "completed" : "active",
    });
  } catch (error) {
    console.error("GET tracking error:", error);
    return NextResponse.json({ error: "Failed to fetch tracking" }, { status: 500 });
  }
}
