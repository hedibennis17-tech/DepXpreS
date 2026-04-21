export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const TWILIO_SID   = process.env.TWILIO_SID!;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN!;
const TWILIO_FROM  = process.env.TWILIO_FROM!;
const SENDGRID_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL   = process.env.FROM_EMAIL || "noreply@fastdep.ca";

export async function POST(req: NextRequest) {
  try {
    const { driverId, driverName, email, phone, subject, message } = await req.json();

    if (!driverId || !message) {
      return NextResponse.json({ error: "driverId et message requis" }, { status: 400 });
    }

    const results: Record<string, string> = {};

    // 1. SMS via Twilio
    if (phone && TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
      try {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
        const formatted = cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`;
        const resp = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: TWILIO_FROM,
              To: formatted,
              Body: `FastDép: ${message}`,
            }),
          }
        );
        const smsData = await resp.json();
        results.sms = smsData.sid ? "ok" : smsData.message || "erreur";
      } catch (e) {
        results.sms = "erreur: " + String(e);
      }
    }

    // 2. Email via SendGrid
    if (email && SENDGRID_KEY) {
      try {
        const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email, name: driverName || "Chauffeur" }] }],
            from: { email: FROM_EMAIL, name: "FastDép" },
            subject: subject || "Notification FastDép",
            content: [{
              type: "text/html",
              value: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
                  <div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0">
                    <h2 style="color:white;margin:0;font-size:18px">⚡ FastDép</h2>
                  </div>
                  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
                    <p style="color:#374151;font-size:15px;line-height:1.6">Bonjour ${driverName || ""},</p>
                    <p style="color:#374151;font-size:15px;line-height:1.6">${message}</p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
                    <p style="color:#9ca3af;font-size:12px">Équipe FastDép — Ne pas répondre à cet email.</p>
                  </div>
                </div>
              `,
            }],
          }),
        });
        results.email = resp.status === 202 ? "ok" : `erreur ${resp.status}`;
      } catch (e) {
        results.email = "erreur: " + String(e);
      }
    }

    // 3. Notification in-app Firestore
    await adminDb.collection("notifications").add({
      userId: driverId,
      type: "admin_notification",
      title: subject || "Message de FastDép",
      body: message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    results.inApp = "ok";

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
