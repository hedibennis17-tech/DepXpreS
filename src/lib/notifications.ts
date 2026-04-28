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

    // ── NOUVELLE COMMANDE : 1 SMS chauffeur + 1 SMS store (une seule fois) ──
    case "new_order":
      // SMS chauffeur — alerte pour ouvrir l'app
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 🚗 Nouvelle commande #${orderNumber} assignée! Ouvrez l'app pour accepter.`);
      // Email chauffeur
      if (driverEmail) await sendEmail(driverEmail, driverName || "Chauffeur",
        `🚗 Commande #${orderNumber} assignée`,
        `<p>Bonjour <b>${driverName}</b>,</p><p>Une nouvelle commande vous a été assignée.</p><p>🏪 Récupérer: <b>${storeName}</b> — ${storeAddress}</p><p>📦 Livrer à: <b>${deliveryAddress}</b></p><p>Ouvrez l'app FastDép pour accepter.</p>`);
      // SMS store — alerte pour préparer
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🛍️ Nouvelle commande #${orderNumber}! Un chauffeur est en route. Préparez: ${itemsSMS}`);
      // Email store
      if (storeEmail) await sendEmail(storeEmail, storeName,
        `🛍️ Nouvelle commande #${orderNumber}`,
        `<p>Nouvelle commande à préparer :</p><ul>${itemsHtml}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${total?.toFixed(2)}$</b></p><p>Un chauffeur va récupérer la commande sous peu.</p>`);
      // Email client seulement (pas de SMS client = pas de frais)
      if (clientEmail) await sendEmail(clientEmail, clientName,
        `✅ Commande #${orderNumber} confirmée`,
        `<p>Bonjour <b>${clientName}</b>,</p><p>Votre commande est confirmée !</p><ul>${itemsHtml}</ul><p>📍 Livraison: <b>${deliveryAddress}</b></p><p>💰 Total: <b>${total?.toFixed(2)}$</b></p>`);
      break;

    // ── ASSIGNATION MANUELLE (même logique que new_order) ─────────────────
    case "assigned":
      if (driverPhone) await sendSMS(driverPhone,
        `FastDép 🚗 Commande #${orderNumber} assignée! Ouvrez l'app pour accepter.`);
      if (driverEmail) await sendEmail(driverEmail, driverName || "Chauffeur",
        `🚗 Commande #${orderNumber} assignée`,
        `<p>Bonjour <b>${driverName}</b>,</p><p>Une commande vous a été assignée.</p><p>🏪 Récupérer: <b>${storeName}</b> — ${storeAddress}</p><p>📦 Livrer: <b>${deliveryAddress}</b></p>`);
      if (storePhone) await sendSMS(storePhone,
        `FastDép 🛍️ Commande #${orderNumber}! Un chauffeur arrive bientôt. Préparez: ${itemsSMS}`);
      if (storeEmail) await sendEmail(storeEmail, storeName,
        `🛍️ Commande #${orderNumber} — Chauffeur assigné`,
        `<p>Un chauffeur (<b>${driverName}</b>) va récupérer la commande <b>#${orderNumber}</b>.</p><ul>${itemsHtml}</ul><p>Préparez la commande pour la remise.</p>`);
      break;

    // ── TOUTES LES AUTRES ÉTAPES : in-app seulement, pas de SMS ──────────
    // (accept, arrived_store, picked_up, arrived_client, delivered)
    // → Géré via Firestore notifications — 0 frais Twilio
    default:
      break;
  }
}
