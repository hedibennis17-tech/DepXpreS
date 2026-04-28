// ─── Utilitaire centralisé SMS + Email ───────────────────────────────────────
// Utilisé par toutes les routes API qui déclenchent des notifications

const SID       = process.env.TWILIO_SID;
const TOKEN     = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN;
const FROM      = process.env.TWILIO_FROM;
const SGKEY     = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@fastdep.ca";

export async function sendSMS(to: string, msg: string): Promise<void> {
  if (!SID || !TOKEN || !FROM || !to || to === "—") return;
  try {
    const phone = to.replace(/[\s\-\(\)\.]/g, "");
    const formatted = phone.startsWith("+") ? phone : `+1${phone}`;
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${SID}:${TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: FROM, To: formatted, Body: msg }),
    });
    const result = await r.json();
    if (result.status === "failed" || result.error_code) {
      console.error("SMS failed:", result.error_message);
    }
  } catch (e) {
    console.error("SMS exception:", e);
  }
}

const emailWrap = (inner: string) => `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
  <div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0">
    <h2 style="color:#fff;margin:0">⚡ FastDép</h2>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
    ${inner}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Équipe FastDép — Ne pas répondre à cet email.</p>
  </div>
</div>`;

export async function sendEmail(to: string, name: string, subject: string, inner: string): Promise<void> {
  if (!SGKEY || !to || !to.includes("@")) return;
  try {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": `Bearer ${SGKEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to, name }] }],
        from: { email: FROM_EMAIL, name: "FastDép" },
        subject,
        content: [{ type: "text/html", value: emailWrap(inner) }],
      }),
    });
    if (r.status !== 202) {
      const err = await r.text();
      console.error("SendGrid error:", r.status, err);
    }
  } catch (e) {
    console.error("Email exception:", e);
  }
}

// ─── Templates par action ────────────────────────────────────────────────────

export interface OrderCtx {
  orderNumber: string;
  orderId: string;
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeEmail?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  driverEmail?: string;
  total?: number;
  items?: { qty: number; name: string; price: number }[];
}

export async function notifyAll(action: string, ctx: OrderCtx) {
  const {
    orderNumber, storeName, storeAddress,
    storePhone, storeEmail,
    clientName, clientPhone, clientEmail,
    deliveryAddress, driverName, driverPhone, driverEmail,
    total, items,
  } = ctx;

  const itemsHtml = items?.map(i => `<li>${i.qty}× ${i.name} — ${(i.price * i.qty).toFixed(2)}$</li>`).join("") || "";
  const itemsSMS  = items?.map(i => `${i.qty}x ${i.name}`).join(", ") || "";

  switch (action) {

    // ── Nouvelle commande créée ───────────────────────────────────────────
    case "new_order":
      // Store
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🛍️ Nouvelle commande #${orderNumber}! ${itemsSMS} | Livraison: ${deliveryAddress} | ${total?.toFixed(2)}$`);
      if (storeEmail) await sendEmail(storeEmail, storeName, `🛍️ Nouvelle commande #${orderNumber}`,
        `<p>Nouvelle commande à préparer :</p><ul>${itemsHtml}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${total?.toFixed(2)}$</b></p>`);
      // Client
      if (clientPhone) await sendSMS(clientPhone,
        `FastDép ✅ Commande #${orderNumber} confirmée! Livraison chez ${storeName} en préparation.`);
      if (clientEmail) await sendEmail(clientEmail, clientName, `✅ Commande #${orderNumber} confirmée`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Commande confirmée !</p><ul>${itemsHtml}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${total?.toFixed(2)}$</b></p>`);
      break;

    // ── Chauffeur assigné (par admin) ─────────────────────────────────────
    case "assigned":
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 🚗 Commande #${orderNumber} assignée! Récupérer: ${storeName} (${storeAddress}) → Livrer: ${deliveryAddress}`);
      if (driverEmail) await sendEmail(driverEmail, driverName || "Chauffeur", `🚗 Commande #${orderNumber} assignée`,
        `<p>Bonjour <b>${driverName}</b>,</p><p>Vous avez une nouvelle commande!</p><p>🏪 Ramasser: <b>${storeName}</b> — ${storeAddress}</p><p>📦 Livrer: <b>${deliveryAddress}</b></p><p>Client: ${clientName}</p>`);
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🚗 Un chauffeur est assigné à la commande #${orderNumber}. Préparez la commande!`);
      if (storeEmail) await sendEmail(storeEmail, storeName, `🚗 Chauffeur assigné — Commande #${orderNumber}`,
        `<p>Un chauffeur (<b>${driverName}</b>) va récupérer la commande <b>#${orderNumber}</b>.</p><p>Préparez la commande pour la remise.</p>`);
      break;

    // ── Chauffeur accepte et part vers le store ───────────────────────────
    case "accept":
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🚗 Le chauffeur ${driverName || ""} est en route vers vous! Commande #${orderNumber} — Préparez-la!`);
      if (storeEmail) await sendEmail(storeEmail, storeName, `🚗 Chauffeur en route — Commande #${orderNumber}`,
        `<p>Le chauffeur <b>${driverName}</b> est en route vers votre commerce.</p><p>Commande <b>#${orderNumber}</b> — Veuillez la préparer pour la remise.</p>`);
      if (clientPhone) await sendSMS(clientPhone,
        `FastDép ✅ Votre commande #${orderNumber} est prise en charge par ${driverName || "un chauffeur"}!`);
      if (clientEmail) await sendEmail(clientEmail, clientName, `✅ Commande #${orderNumber} en cours`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Votre commande <b>#${orderNumber}</b> est prise en charge!</p><p>🚗 Chauffeur: <b>${driverName}</b></p>`);
      break;

    // ── Chauffeur arrivé au store ─────────────────────────────────────────
    case "arrived_store":
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🏪 Le chauffeur est arrivé à votre commerce! Commande #${orderNumber} — Remettez-lui la commande.`);
      if (storeEmail) await sendEmail(storeEmail, storeName, `🏪 Chauffeur arrivé — Commande #${orderNumber}`,
        `<p>Le chauffeur <b>${driverName}</b> est arrivé à votre commerce.</p><p>Veuillez lui remettre la commande <b>#${orderNumber}</b>.</p>`);
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 📍 Vous êtes arrivé chez ${storeName}. Récupérez la commande #${orderNumber}.`);
      break;

    // ── Commande récupérée → en route vers client ─────────────────────────
    case "picked_up":
      if (clientPhone) await sendSMS(clientPhone,
        `FastDép 📦 Votre commande #${orderNumber} est en route! ${driverName ? `Chauffeur: ${driverName}` : ""} — Arrivée prévue bientôt.`);
      if (clientEmail) await sendEmail(clientEmail, clientName, `📦 Commande #${orderNumber} en route!`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Votre commande est en route!</p><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>🚗 Chauffeur: <b>${driverName}</b></p>`);
      if (storePhone) await sendSMS(storePhone,
        `FastDép ✅ Commande #${orderNumber} récupérée par le chauffeur. Livraison en cours.`);
      break;

    // ── Chauffeur arrivé chez le client ───────────────────────────────────
    case "arrived_client":
      if (clientPhone) await sendSMS(clientPhone,
        `FastDép 🏠 Votre chauffeur est arrivé! Commande #${orderNumber} — Ouvrez la porte!`);
      if (clientEmail) await sendEmail(clientEmail, clientName, `🏠 Votre chauffeur est là! — #${orderNumber}`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Votre chauffeur <b>${driverName}</b> est devant chez vous!</p><p>Commande <b>#${orderNumber}</b></p>`);
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 📍 Vous êtes arrivé chez ${clientName}. Commande #${orderNumber}.`);
      break;

    // ── Livraison complétée ───────────────────────────────────────────────
    case "delivered":
      if (clientPhone) await sendSMS(clientPhone,
        `FastDép ✅ Commande #${orderNumber} livrée! Merci de choisir FastDép 🧡`);
      if (clientEmail) await sendEmail(clientEmail, clientName, `✅ Commande #${orderNumber} livrée!`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Votre commande <b>#${orderNumber}</b> a été livrée avec succès!</p><p>Merci de choisir FastDép 🧡</p>`);
      if (storePhone) await sendSMS(storePhone,
        `FastDép ✅ Commande #${orderNumber} livrée à ${clientName}. Transaction complétée.`);
      if (storeEmail) await sendEmail(storeEmail, storeName, `✅ Commande #${orderNumber} livrée`,
        `<p>La commande <b>#${orderNumber}</b> a été livrée avec succès à <b>${clientName}</b>.</p><p>Transaction complétée.</p>`);
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 🎉 Livraison #${orderNumber} complétée! Bravo.`);
      break;
  }
}
