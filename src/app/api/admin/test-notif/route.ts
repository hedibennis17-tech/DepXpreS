export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};

  results.env = {
    TWILIO_SID:   process.env.TWILIO_SID ? "✅ "+process.env.TWILIO_SID.slice(0,8)+"..." : "❌ MANQUANT",
    TWILIO_TOKEN: process.env.TWILIO_TOKEN ? "✅ ok" : process.env.TWILIO_AUTH_TOKEN ? "✅ ok (AUTH_TOKEN)" : "❌ MANQUANT",
    TWILIO_FROM:  process.env.TWILIO_FROM || "❌ MANQUANT",
    SENDGRID:     process.env.SENDGRID_API_KEY ? "✅ ok" : "❌ MANQUANT",
    FROM_EMAIL:   process.env.FROM_EMAIL || "❌ MANQUANT",
  };

  const SID   = process.env.TWILIO_SID;
  const TOKEN = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN;
  const FROM  = process.env.TWILIO_FROM;

  if (SID && TOKEN && FROM) {
    // Test SMS vers le numéro admin (hedibennis17 phone)
    const testTo = "+15142450229"; // numéro admin pour test
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method:"POST",
      headers:{
        "Authorization":"Basic "+Buffer.from(`${SID}:${TOKEN}`).toString("base64"),
        "Content-Type":"application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({From:FROM, To:testTo, Body:"FastDép TEST ✅ — SMS fonctionne!"})
    });
    const d = await r.json();
    results.twilio = {status:r.status, sid:d.sid, error:d.message, code:d.code, to:testTo};
  } else {
    results.twilio = "❌ variables manquantes";
  }

  const SGKEY = process.env.SENDGRID_API_KEY;
  const EMAIL = process.env.FROM_EMAIL; // maintenant vérifié sur SendGrid
  if (SGKEY && EMAIL) {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send",{
      method:"POST",
      headers:{"Authorization":`Bearer ${SGKEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        personalizations:[{to:[{email:EMAIL}]}],
        from:{email:EMAIL,name:"FastDép Test"},
        subject:"FastDép TEST SendGrid",
        content:[{type:"text/plain",value:"Test OK"}],
      }),
    });
    const txt = r.status !== 202 ? await r.text() : "";
    results.sendgrid = {status:r.status, ok:r.status===202, error:txt||null};
  } else {
    results.sendgrid = "❌ variables manquantes";
  }

  return NextResponse.json(results);
}
