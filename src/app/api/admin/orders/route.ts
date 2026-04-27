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
      clientId, clientName, clientPhone,
      storeId, storeName, storeAddress, storePhone,
      items, deliveryAddress, deliveryLat, deliveryLng,
      deliveryType, deliveryInstructions,
      subtotal, deliveryFee, taxes, total,
      driverId, driverName,
    } = body;

    if (!storeId || !clientId || !items?.length || !deliveryAddress) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const { FieldValue } = await import("firebase-admin/firestore");
    const orderNumber = `FD-${Date.now().toString().slice(-6)}`;

    // ── 1. Créer la commande ──────────────────────────────────────────────
    const orderData: Record<string, any> = {
      orderNumber,
      clientId, clientName: clientName||"", clientPhone: clientPhone||"",
      storeId, storeName: storeName||"", storeAddress: storeAddress||"", storePhone: storePhone||"",
      items: items||[],
      deliveryAddress, deliveryLat: deliveryLat||null, deliveryLng: deliveryLng||null,
      deliveryType: deliveryType||"door",
      deliveryInstructions: deliveryInstructions||"",
      subtotal: subtotal||0, deliveryFee: deliveryFee||4.99,
      taxes: taxes||0, total: total||0,
      status: driverId ? "assigned" : "pending",
      paymentStatus: "pending",
      source: "admin_manual",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (driverId) {
      orderData.driverId = driverId;
      orderData.driverName = driverName||"";
      orderData.assignedAt = FieldValue.serverTimestamp();
    }
    const orderRef = await adminDb.collection("orders").add(orderData);
    const orderId = orderRef.id;

    // ── 2. Notifications in-app (Firestore — toujours fiable) ─────────────
    await Promise.all([
      // Store
      adminDb.collection("notifications").add({
        userId: storeId, userType: "store", type: "new_order",
        title: "🛍️ Nouvelle commande #" + orderNumber,
        body: `${items.length} article(s) — Livraison: ${deliveryAddress} — Total: ${(total||0).toFixed(2)}$`,
        orderId, read: false, createdAt: FieldValue.serverTimestamp(),
      }),
      // Client
      adminDb.collection("notifications").add({
        userId: clientId, userType: "client", type: "order_confirmed",
        title: "✅ Commande #" + orderNumber + " confirmée",
        body: `Votre commande chez ${storeName} est en cours de préparation.`,
        orderId, read: false, createdAt: FieldValue.serverTimestamp(),
      }),
      // Chauffeur si assigné
      ...(driverId ? [adminDb.collection("notifications").add({
        userId: driverId, userType: "driver", type: "new_order",
        title: "🚗 Commande #" + orderNumber + " assignée",
        body: `Récupérer chez ${storeName} → Livrer à ${deliveryAddress}`,
        orderId, read: false, createdAt: FieldValue.serverTimestamp(),
      })] : []),
    ]);

    // ── 3. SMS Twilio ─────────────────────────────────────────────────────
    const SID   = process.env.TWILIO_SID;
    const TOKEN = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN;
    const FROM  = process.env.TWILIO_FROM;

    async function sendSMS(to: string, msg: string) {
      if (!SID || !TOKEN || !FROM || !to) return;
      const phone = to.replace(/[\s\-\(\)]/g,"");
      const formatted = phone.startsWith("+") ? phone : `+1${phone}`;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
        method:"POST",
        headers:{
          "Authorization":"Basic "+Buffer.from(`${SID}:${TOKEN}`).toString("base64"),
          "Content-Type":"application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From:FROM, To:formatted, Body:msg }),
      });
    }

    // SMS store
    if (storePhone) {
      await sendSMS(storePhone,
        `FastDép 🛍️ Nouvelle commande #${orderNumber} | ${items.map((i:any)=>`${i.qty}x ${i.name}`).join(", ")} | Livraison: ${deliveryAddress} | ${(total||0).toFixed(2)}$`
      );
    }

    // SMS chauffeur
    if (driverId) {
      const driverDoc = await adminDb.collection("driver_profiles").doc(driverId).get();
      const driverPhone = driverDoc.data()?.phone || driverDoc.data()?.phoneNumber;
      if (driverPhone) {
        await sendSMS(driverPhone,
          `FastDép 🚗 Commande #${orderNumber} assignée! Récupérer: ${storeName} (${storeAddress}) → Livrer: ${deliveryAddress}`
        );
      }
    }

    // SMS client
    if (clientPhone) {
      await sendSMS(clientPhone,
        `FastDép ✅ Commande #${orderNumber} confirmée! Livraison chez ${storeName} en cours de préparation. Merci!`
      );
    }

    // ── 4. Email SendGrid ─────────────────────────────────────────────────
    const SGKEY  = process.env.SENDGRID_API_KEY;
    const FROMEMAIL = process.env.FROM_EMAIL || "noreply@fastdep.ca";

    async function sendEmail(to: string, name: string, subject: string, html: string) {
      if (!SGKEY || !to) return;
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method:"POST",
        headers:{"Authorization":`Bearer ${SGKEY}`,"Content-Type":"application/json"},
        body: JSON.stringify({
          personalizations:[{to:[{email:to, name}]}],
          from:{email:FROMEMAIL, name:"FastDép"},
          subject, content:[{type:"text/html", value:html}],
        }),
      });
    }

    const emailStyle = `font-family:sans-serif;max-width:520px;margin:0 auto`;
    const header = `<div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0"><h2 style="color:#fff;margin:0">⚡ FastDép</h2></div>`;
    const footer = `<p style="color:#9ca3af;font-size:12px;margin-top:20px">Équipe FastDép — Ne pas répondre à cet email.</p>`;
    const wrap = (inner:string) => `<div style="${emailStyle}">${header}<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">${inner}${footer}</div></div>`;
    const itemsList = items.map((i:any)=>`<li>${i.qty}× ${i.name} — ${(i.price*i.qty).toFixed(2)}$</li>`).join("");

    // Email + SMS store — récupérer tous les champs possibles
    const storeDoc = await adminDb.collection("stores").doc(storeId).get();
    const storeData = storeDoc.data() || {};
    const storeEmail = storeData.ownerEmail || storeData.email || storeData.contactEmail;
    const storePhoneFinal = storePhone || storeData.phone || storeData.ownerPhone;

    console.log("Store notif:", {storeId, storeEmail, storePhoneFinal, storeData_keys: Object.keys(storeData)});

    // SMS store
    if (storePhoneFinal) {
      const smsResult = await sendSMS(storePhoneFinal,
        `FastDép 🛍️ Nouvelle commande #${orderNumber}! Articles: ${items.map((i:any)=>`${i.qty}x ${i.name}`).join(", ")} | Livraison: ${deliveryAddress} | Total: ${(total||0).toFixed(2)}$`
      );
      console.log("SMS store result:", smsResult);
    } else {
      console.log("SMS store: pas de numéro de téléphone trouvé");
    }

    if (storeEmail) {
      await sendEmail(storeEmail, storeName,
        `🛍️ Nouvelle commande #${orderNumber}`,
        wrap(`<p>Nouvelle commande à préparer :</p><ul>${itemsList}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${(total||0).toFixed(2)}$</b></p>`)
      );
    }

    // Email client
    const clientDoc = await adminDb.collection("app_users").doc(clientId).get();
    const clientEmail = clientDoc.data()?.email;
    if (clientEmail) {
      await sendEmail(clientEmail, clientName,
        `✅ Commande #${orderNumber} confirmée`,
        wrap(`<p>Bonjour <b>${clientName}</b>,</p><p>Votre commande est confirmée !</p><ul>${itemsList}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${(total||0).toFixed(2)}$</b></p>`)
      );
    }

    return NextResponse.json({ ok:true, order:{ id:orderId, orderNumber, status:orderData.status } });

  } catch(error) {
    console.error("POST /api/admin/orders:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
