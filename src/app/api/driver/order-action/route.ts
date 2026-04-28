export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { notifyAll, type OrderCtx } from "@/lib/notifications";

// Récupère les infos du chauffeur depuis Firestore
async function getDriverInfo(driverId: string) {
  try {
    const [profileDoc, userDoc] = await Promise.all([
      adminDb.collection("driver_profiles").doc(driverId).get(),
      adminDb.collection("app_users").doc(driverId).get(),
    ]);
    const p = profileDoc.data() || {};
    const u = userDoc.data() || {};
    return {
      phone: p.phone || p.phoneNumber || u.phone || "",
      email: u.email || p.email || "",
      name:  p.full_name || u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Chauffeur",
    };
  } catch { return { phone: "", email: "", name: "Chauffeur" }; }
}

// Récupère les infos du store depuis Firestore
async function getStoreInfo(storeId: string) {
  try {
    const doc = await adminDb.collection("stores").doc(storeId).get();
    const d = doc.data() || {};
    return {
      phone: d.phone || d.ownerPhone || "",
      email: d.email || d.ownerEmail || d.contactEmail || "",
      name:  d.name || "Store",
    };
  } catch { return { phone: "", email: "", name: "Store" }; }
}

// Récupère l'email client depuis app_users
async function getClientEmail(clientId: string): Promise<string> {
  try {
    const doc = await adminDb.collection("app_users").doc(clientId).get();
    return doc.data()?.email || "";
  } catch { return ""; }
}

async function addNotif(userId: string, userType: string, type: string, title: string, body: string, orderId: string) {
  return adminDb.collection("notifications").add({
    userId, userType, type, title, body, orderId,
    read: false, createdAt: FieldValue.serverTimestamp(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, driverId, action, reason, note, photoUrl, rating, comment } = body;

    if (!orderId || !driverId || !action)
      return NextResponse.json({ error: "Params manquants", received: body }, { status: 400 });

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    const o = orderDoc.data()!;

    // Récupérer les infos enrichies en parallèle
    const [driver, store, clientEmail] = await Promise.all([
      getDriverInfo(driverId),
      getStoreInfo(o.storeId),
      getClientEmail(o.clientId),
    ]);

    const ctx: OrderCtx = {
      orderNumber:     o.orderNumber || orderId.slice(-6),
      orderId,
      storeName:       o.storeName   || store.name,
      storeAddress:    o.storeAddress || "",
      storePhone:      o.storePhone  || store.phone,
      storeEmail:      store.email,
      clientName:      o.clientName  || "Client",
      clientPhone:     o.clientPhone || "",
      clientEmail,
      deliveryAddress: o.deliveryAddress || "",
      driverName:      driver.name,
      driverPhone:     driver.phone,
      driverEmail:     driver.email,
      total:           o.total,
      items:           o.items,
    };

    // ── Actions ──────────────────────────────────────────────────────────────

    if (action === "accept") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "navigating_pickup",
        acceptedAt: FieldValue.serverTimestamp(),
        updatedAt:  FieldValue.serverTimestamp(),
      });
      await Promise.all([
        addNotif(o.storeId,  "store",  "driver_accepted", "🚗 Chauffeur en route",  `Le chauffeur arrive pour #${ctx.orderNumber}. Préparez!`, orderId),
        addNotif(o.clientId, "client", "driver_accepted", "🚗 Chauffeur assigné",    `Votre commande #${ctx.orderNumber} est prise en charge!`, orderId),
        notifyAll("accept", ctx),
      ]);
    }

    else if (action === "refuse") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "refused", refusedAt: FieldValue.serverTimestamp(),
        refuseReason: reason || "", refuseNote: note || "",
        refusedBy: driverId, driverId: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      await addNotif("admin", "admin", "order_refused",
        `❌ Commande #${ctx.orderNumber} refusée`, `Raison: ${reason}${note ? ` — ${note}` : ""}`, orderId);
    }

    else if (action === "arrived_store") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "arrived_store",
        arrivedStoreAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await Promise.all([
        addNotif(o.storeId, "store", "driver_arrived_store", "🏪 Chauffeur arrivé", `Le chauffeur est là pour #${ctx.orderNumber}`, orderId),
        notifyAll("arrived_store", ctx),
      ]);
    }

    else if (action === "picked_up") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "picked_up",
        pickedUpAt: FieldValue.serverTimestamp(),
        updatedAt:  FieldValue.serverTimestamp(),
      });
      await Promise.all([
        addNotif(o.clientId, "client", "order_picked_up", "📦 Commande en route!", `#${ctx.orderNumber} est en route vers vous!`, orderId),
        notifyAll("picked_up", ctx),
      ]);
    }

    else if (action === "arrived_client") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "arrived_client",
        arrivedClientAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await Promise.all([
        addNotif(o.clientId, "client", "driver_arrived", "🏠 Le chauffeur est là!", `Le chauffeur est devant chez vous #${ctx.orderNumber}`, orderId),
        notifyAll("arrived_client", ctx),
      ]);
    }

    else if (action === "delivered") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "delivered",
        deliveredAt: FieldValue.serverTimestamp(),
        deliveryPhotoUrl: photoUrl || null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      await Promise.all([
        addNotif(o.clientId, "client", "order_delivered", "✅ Commande livrée!", `#${ctx.orderNumber} livrée. Merci!`, orderId),
        addNotif(o.storeId,  "store",  "order_completed", "✅ Commande complétée", `#${ctx.orderNumber} livrée à ${ctx.clientName}`, orderId),
        addNotif("admin",    "admin",  "order_delivered", "✅ Livraison complétée", `#${ctx.orderNumber} → ${ctx.clientName}`, orderId),
        notifyAll("delivered", ctx),
      ]);
    }

    else if (action === "navigating_dropoff") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "navigating_dropoff",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    else if (action === "rated") {
      await adminDb.collection("orders").doc(orderId).update({
        status: "rated", driverRating: rating || 5,
        driverComment: comment || "", ratedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      await adminDb.collection("order_ratings").add({
        orderId, driverId, stars: rating || 5,
        comment: comment || "", createdAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ ok: true, action, orderId });

  } catch (e) {
    console.error("order-action:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
