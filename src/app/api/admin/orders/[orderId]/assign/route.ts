export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { notifyAll } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { driverId, adminId = "admin" } = await req.json();

    if (!driverId) return NextResponse.json({ error: "driverId required" }, { status: 400 });

    // Récupérer commande + chauffeur + app_user en parallèle
    const [orderDoc, driverDoc, driverUserDoc] = await Promise.all([
      adminDb.collection("orders").doc(orderId).get(),
      adminDb.collection("driver_profiles").doc(driverId).get(),
      adminDb.collection("app_users").doc(driverId).get(),
    ]);

    if (!orderDoc.exists) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    if (!driverDoc.exists) return NextResponse.json({ error: "Chauffeur introuvable" }, { status: 404 });

    const order = orderDoc.data()!;
    const driver = driverDoc.data()!;
    const driverUser = driverUserDoc.exists ? driverUserDoc.data()! : {};

    // Vérifier que la commande n'est pas terminée
    if (["cancelled", "delivered", "completed", "refunded"].includes(order.status)) {
      return NextResponse.json({ error: `Impossible d'assigner sur une commande ${order.status}` }, { status: 400 });
    }

    // Vérifier que le chauffeur est en ligne (check flexible)
    const isOnline = driver.isOnline === true
      || driver.driver_status === "online"
      || driver.online === true
      || driver.is_online === true;

    if (!isOnline) {
      return NextResponse.json({ error: "Ce chauffeur n'est pas en ligne actuellement" }, { status: 400 });
    }

    // Nom du chauffeur (plusieurs sources)
    const driverName = driver.full_name
      || driver.fullName
      || driverUser.display_name
      || `${driverUser.first_name || ""} ${driverUser.last_name || ""}`.trim()
      || `${driver.firstName || ""} ${driver.lastName || ""}`.trim()
      || driverUser.email?.split("@")[0]
      || "Chauffeur";

    const driverPhone = driver.phone || driver.phoneNumber || driverUser.phone || "";
    const driverEmail = driverUser.email || driver.email || "";

    // Récupérer store + client pour notifications
    const [storeDoc, clientDoc] = await Promise.all([
      order.storeId ? adminDb.collection("stores").doc(order.storeId).get() : Promise.resolve(null),
      order.clientId ? adminDb.collection("app_users").doc(order.clientId).get() : Promise.resolve(null),
    ]);
    const store = storeDoc?.exists ? storeDoc.data()! : {};
    const client = clientDoc?.exists ? clientDoc.data()! : {};

    const batch = adminDb.batch();

    // 1. Mettre à jour la commande — status = "assigned" pour que le chauffeur le voit
    batch.update(adminDb.collection("orders").doc(orderId), {
      driverId,
      driverName,
      driverPhone,
      status: "assigned",
      assignedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      assignedBy: adminId,
      // Copier coords store si manquantes
      storeLat: order.storeLat || store.lat || store.latitude || null,
      storeLng: order.storeLng || store.lng || store.longitude || null,
      storePhone: order.storePhone || store.phone || "",
    });

    // 2. Notification in-app chauffeur
    const notifRef = adminDb.collection("notifications").doc();
    batch.set(notifRef, {
      userId: driverId,
      userType: "driver",
      type: "new_order",
      title: "🚗 Nouvelle commande!",
      body: `Commande ${order.orderNumber || orderId.slice(-6)} — ${order.storeName} → ${order.deliveryAddress || ""}`,
      orderId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Historique statut
    const histRef = adminDb.collection("order_status_history").doc();
    batch.set(histRef, {
      orderId,
      status: "assigned",
      note: `Chauffeur ${driverName} assigné par admin`,
      actorId: adminId,
      actorType: "admin",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Mettre à jour profil chauffeur
    batch.update(adminDb.collection("driver_profiles").doc(driverId), {
      current_order_id: orderId,
      availability_status: "reserved",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // 5. Email/SMS (async, sans bloquer)
    try {
      await notifyAll("assigned", {
        orderNumber: order.orderNumber || orderId.slice(-6),
        orderId,
        storeName: order.storeName || store.name || "",
        storeAddress: order.storeAddress || store.address || "",
        storePhone: order.storePhone || store.phone || "",
        storeEmail: store.email || "",
        clientName: order.clientName || client.display_name || "Client",
        clientPhone: order.clientPhone || client.phone || "",
        clientEmail: client.email || "",
        deliveryAddress: order.deliveryAddress || "",
        driverName,
        driverPhone,
        driverEmail,
        total: order.total,
        items: order.items,
      });
    } catch (e) {
      console.error("Notification error:", e);
    }

    return NextResponse.json({ success: true, driverId, driverName, orderId });

  } catch (error) {
    console.error("assign error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
