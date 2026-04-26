export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId, clientName, clientPhone, clientEmail,
      storeId, storeName, storeAddress, storePhone,
      items, deliveryAddress, deliveryLat, deliveryLng,
      deliveryType, deliveryInstructions, note,
      subtotal, deliveryFee, taxes, total,
      driverId, driverName,
    } = body;

    if (!storeId || !clientId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const { FieldValue } = await import("firebase-admin/firestore");

    // Générer numéro de commande
    const orderNumber = `FD-${Date.now().toString().slice(-6)}`;

    const orderData: Record<string, any> = {
      orderNumber,
      clientId, clientName: clientName || "", clientPhone: clientPhone || "", clientEmail: clientEmail || "",
      storeId, storeName: storeName || "", storeAddress: storeAddress || "", storePhone: storePhone || "",
      items: items || [],
      deliveryAddress, deliveryLat: deliveryLat || null, deliveryLng: deliveryLng || null,
      deliveryType: deliveryType || "door",
      deliveryInstructions: deliveryInstructions || note || "",
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 4.99,
      taxes: taxes || 0,
      total: total || 0,
      status: driverId ? "assigned" : "pending",
      paymentStatus: "pending",
      source: "admin_manual",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (driverId) {
      orderData.driverId = driverId;
      orderData.driverName = driverName || "";
      orderData.assignedAt = FieldValue.serverTimestamp();
    }

    // Créer la commande
    const orderRef = await adminDb.collection("orders").add(orderData);
    const orderId = orderRef.id;

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────

    const notifPromises: Promise<any>[] = [];

    // 1. Notification in-app + email au STORE
    notifPromises.push(
      adminDb.collection("notifications").add({
        userId: storeId, userType: "store", type: "new_order",
        title: "🛍️ Nouvelle commande reçue",
        body: `Commande #${orderNumber} — ${items.length} article(s) — ${(total||0).toFixed(2)} $`,
        orderId, read: false, createdAt: FieldValue.serverTimestamp(),
      })
    );

    // 2. Email au store via SendGrid
    if (process.env.SENDGRID_API_KEY && storePhone) {
      const storeDoc = await adminDb.collection("stores").doc(storeId).get();
      const storeEmail = storeDoc.data()?.email || storeDoc.data()?.ownerEmail;
      if (storeEmail) {
        notifPromises.push(
          fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: storeEmail, name: storeName }] }],
              from: { email: process.env.FROM_EMAIL || "noreply@fastdep.ca", name: "FastDép" },
              subject: `🛍️ Nouvelle commande #${orderNumber}`,
              content: [{
                type: "text/html",
                value: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto">
                  <div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0">
                    <h2 style="color:white;margin:0">⚡ FastDép — Nouvelle commande</h2>
                  </div>
                  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
                    <p><b>Commande #${orderNumber}</b></p>
                    <p>Articles : ${items.map((i: any) => `${i.name} ×${i.qty}`).join(", ")}</p>
                    <p>Livraison à : <b>${deliveryAddress}</b></p>
                    <p>Total : <b>${(total||0).toFixed(2)} $</b></p>
                    <p style="color:#6b7280;font-size:12px">Préparez la commande dès que possible.</p>
                  </div>
                </div>`
              }],
            }),
          }).catch(() => {})
        );
      }
    }

    // 3. SMS au store via Twilio
    if (process.env.TWILIO_SID && storePhone) {
      const cleaned = storePhone.replace(/[\s\-\(\)]/g, "");
      const formatted = cleaned.startsWith("+") ? cleaned : `+1${cleaned}`;
      notifPromises.push(
        fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_TOKEN}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: process.env.TWILIO_FROM || "",
            To: formatted,
            Body: `FastDép — Nouvelle commande #${orderNumber} | ${items.length} article(s) | Livraison: ${deliveryAddress} | Total: ${(total||0).toFixed(2)}$`,
          }),
        }).catch(() => {})
      );
    }

    // 4. Notification in-app au CHAUFFEUR si assigné
    if (driverId) {
      notifPromises.push(
        adminDb.collection("notifications").add({
          userId: driverId, userType: "driver", type: "new_order",
          title: "🚗 Nouvelle commande assignée",
          body: `Commande #${orderNumber} — Récupérer chez ${storeName} — Livrer à ${deliveryAddress}`,
          orderId, read: false, createdAt: FieldValue.serverTimestamp(),
        })
      );

      // SMS au chauffeur
      if (process.env.TWILIO_SID) {
        const driverDoc = await adminDb.collection("driver_profiles").doc(driverId).get();
        const driverPhone = driverDoc.data()?.phone;
        if (driverPhone) {
          const cleaned = driverPhone.replace(/[\s\-\(\)]/g, "");
          const formatted = cleaned.startsWith("+") ? cleaned : `+1${cleaned}`;
          notifPromises.push(
            fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
              method: "POST",
              headers: {
                "Authorization": "Basic " + Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_TOKEN}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                From: process.env.TWILIO_FROM || "",
                To: formatted,
                Body: `FastDép — Commande #${orderNumber} assignée! Récupérer chez ${storeName} (${storeAddress}) et livrer à ${deliveryAddress}.`,
              }),
            }).catch(() => {})
          );
        }
      }
    }

    // 5. Notification in-app au CLIENT
    notifPromises.push(
      adminDb.collection("notifications").add({
        userId: clientId, userType: "client", type: "order_confirmed",
        title: "✅ Commande confirmée",
        body: `Votre commande #${orderNumber} a été confirmée. Livraison en cours de préparation.`,
        orderId, read: false, createdAt: FieldValue.serverTimestamp(),
      })
    );

    // 6. Email au client
    if (process.env.SENDGRID_API_KEY && clientPhone) {
      const clientDoc = await adminDb.collection("app_users").doc(clientId).get();
      const clientEmail2 = clientDoc.data()?.email || clientEmail;
      if (clientEmail2) {
        notifPromises.push(
          fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: clientEmail2, name: clientName }] }],
              from: { email: process.env.FROM_EMAIL || "noreply@fastdep.ca", name: "FastDép" },
              subject: `✅ Commande #${orderNumber} confirmée`,
              content: [{
                type: "text/html",
                value: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto">
                  <div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0">
                    <h2 style="color:white;margin:0">⚡ FastDép</h2>
                  </div>
                  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
                    <p>Bonjour <b>${clientName}</b>,</p>
                    <p>Votre commande <b>#${orderNumber}</b> est confirmée !</p>
                    <p>Articles : ${items.map((i: any) => `${i.name} ×${i.qty}`).join(", ")}</p>
                    <p>Livraison à : <b>${deliveryAddress}</b></p>
                    <p>Total : <b>${(total||0).toFixed(2)} $</b></p>
                    <p style="color:#6b7280;font-size:12px">Merci de choisir FastDép !</p>
                  </div>
                </div>`
              }],
            }),
          }).catch(() => {})
        );
      }
    }

    // Lancer toutes les notifications en parallèle (sans bloquer)
    Promise.allSettled(notifPromises);

    return NextResponse.json({
      ok: true,
      order: { id: orderId, orderNumber, status: orderData.status },
    });

  } catch (error) {
    console.error("POST /api/admin/orders error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
