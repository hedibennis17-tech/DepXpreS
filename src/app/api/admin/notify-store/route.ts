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
    const { storeId, storeName, email, phone, subject, message } = await req.json();
    if (!storeId || !message) return NextResponse.json({ error: "storeId et message requis" }, { status: 400 });
    const results: Record<string,string> = {};

    // SMS
    if (phone && TWILIO_SID) {
      try {
        const formatted = phone.replace(/[\s\-\(\)]/g,"").startsWith("+") ? phone.replace(/[\s\-\(\)]/g,"") : `+1${phone.replace(/[\s\-\(\)]/g,"")}`;
        const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,{
          method:"POST",
          headers:{"Authorization":"Basic "+Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},
          body:new URLSearchParams({From:TWILIO_FROM,To:formatted,Body:`FastDép: ${message}`}),
        });
        const d=await r.json(); results.sms=d.sid?"ok":d.message||"erreur";
      } catch(e){results.sms="erreur";}
    }

    // Email
    if (email && SENDGRID_KEY) {
      try {
        const r = await fetch("https://api.sendgrid.com/v3/mail/send",{
          method:"POST",
          headers:{"Authorization":`Bearer ${SENDGRID_KEY}`,"Content-Type":"application/json"},
          body:JSON.stringify({
            personalizations:[{to:[{email,name:storeName||"Commerçant"}]}],
            from:{email:FROM_EMAIL,name:"FastDép"},
            subject:subject||"Notification FastDép",
            content:[{type:"text/html",value:`<div style="font-family:sans-serif;max-width:500px;margin:0 auto"><div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0"><h2 style="color:white;margin:0">⚡ FastDép</h2></div><div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px"><p>Bonjour ${storeName||""},</p><p style="line-height:1.6">${message}</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/><p style="color:#9ca3af;font-size:12px">Équipe FastDép</p></div></div>`}],
          }),
        });
        results.email=r.status===202?"ok":`erreur ${r.status}`;
      } catch(e){results.email="erreur";}
    }

    // In-app
    await adminDb.collection("notifications").add({
      userId:storeId, userType:"store", type:"admin_notification",
      title:subject||"Message de FastDép", body:message,
      read:false, createdAt:FieldValue.serverTimestamp(),
    });
    results.inApp="ok";

    return NextResponse.json({ok:true,results});
  } catch(e){ return NextResponse.json({error:String(e)},{status:500}); }
}
