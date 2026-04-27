export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};

  // 1. Créer une vraie commande test
  try {
    const orderRef = await adminDb.collection("orders").add({
      orderNumber: "FD-TEST-001",
      clientId: "test_client",
      clientName: "Client Test",
      clientPhone: "+15142450229",
      storeId: "test_store",
      storeName: "Depanneur Test",
      storeAddress: "3300 Boul Chomedy, Laval",
      storePhone: "+15145555555",
      items: [{ name: "Chips Lay's", qty: 1, price: 3.99 }],
      deliveryAddress: "4229 9e Rue, Laval, QC",
      deliveryType: "door",
      subtotal: 3.99,
      deliveryFee: 4.99,
      taxes: 0.60,
      total: 9.58,
      status: "pending",
      source: "test",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    results.order_created = { ok: true, orderId: orderRef.id };

    // 2. Tester order-action accept avec cet orderId
    // D'abord trouver un vrai driverId
    const driversSnap = await adminDb.collection("driver_profiles")
      .where("driver_status", "in", ["online", "available", "offline"])
      .limit(1).get();

    if (!driversSnap.empty) {
      const driverId = driversSnap.docs[0].id;
      const driverData = driversSnap.docs[0].data();
      results.driver_found = { driverId, name: driverData.full_name, phone: driverData.phone };

      // Assigner la commande au chauffeur
      await adminDb.collection("orders").doc(orderRef.id).update({
        driverId,
        driverName: driverData.full_name,
        status: "assigned",
        assignedAt: FieldValue.serverTimestamp(),
      });
      results.order_assigned = { ok: true, driverId };

      // 3. Tester l'API order-action directement
      const actionRes = await fetch(`${req.nextUrl.origin}/api/driver/order-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderRef.id,
          driverId,
          action: "accept"
        }),
      });
      const actionData = await actionRes.json();
      results.order_action_test = { status: actionRes.status, data: actionData };

    } else {
      results.driver_found = "❌ Aucun chauffeur trouvé";
    }

  } catch(e) {
    results.error = String(e);
  }

  // 4. Vérifier les commandes existantes avec status=assigned
  try {
    const assignedSnap = await adminDb.collection("orders")
      .where("status", "==", "assigned").limit(5).get();
    results.assigned_orders = assignedSnap.docs.map(d => ({
      id: d.id,
      orderNumber: d.data().orderNumber,
      driverId: d.data().driverId,
      storeId: d.data().storeId,
      status: d.data().status,
    }));
  } catch(e) {
    results.assigned_orders_error = String(e);
  }

  // 5. Vérifier les notifications créées
  try {
    const notifsSnap = await adminDb.collection("notifications")
      .orderBy("createdAt", "desc").limit(5).get();
    results.recent_notifications = notifsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString(),
    }));
  } catch(e) {
    results.notifications_error = String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
