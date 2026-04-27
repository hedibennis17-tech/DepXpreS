export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const SID   = process.env.TWILIO_SID;
const TOKEN = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN;
const FROM  = process.env.TWILIO_FROM;
const SGKEY = process.env.SENDGRID_API_KEY;
const FROMEMAIL = process.env.FROM_EMAIL || "noreply@fastdep.ca";

async function sendSMS(to: string, msg: string) {
  if (!SID || !TOKEN || !FROM || !to) return;
  const phone = to.replace(/[\s\-\(\)\.]/g,"");
  const formatted = phone.startsWith("+") ? phone : `+1${phone}`;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,{
    method:"POST",
    headers:{"Authorization":"Basic "+Buffer.from(`${SID}:${TOKEN}`).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({From:FROM,To:formatted,Body:msg}),
  });
  return await r.json();
}

async function sendEmail(to:string,name:string,subject:string,html:string){
  if(!SGKEY||!to) return {ok:false,reason:"no_config"};
  try {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send",{
      method:"POST",
      headers:{"Authorization":`Bearer ${SGKEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({personalizations:[{to:[{email:to,name}]}],from:{email:FROMEMAIL,name:"FastDép"},subject,content:[{type:"text/html",value:html}]}),
    });
    if(r.status!==202){const err=await r.text();console.error("SendGrid error:",err);}
    return {ok:r.status===202};
  } catch(e){console.error("SendGrid exception:",e);return {ok:false};}
}

const wrap=(inner:string)=>`<div style="font-family:sans-serif;max-width:520px;margin:0 auto"><div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0"><h2 style="color:#fff;margin:0">⚡ FastDép</h2></div><div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">${inner}<p style="color:#9ca3af;font-size:12px;margin-top:20px">Équipe FastDép</p></div></div>`;

export async function POST(req:NextRequest){
  try{
    const body = await req.json();
    console.log("order-action called:", JSON.stringify(body));
    const {orderId,driverId,action,reason,note,photoUrl,rating,comment}=body;
    if(!orderId||!driverId||!action) return NextResponse.json({error:"Params manquants",received:body},{status:400});

    const orderDoc=await adminDb.collection("orders").doc(orderId).get();
    if(!orderDoc.exists) return NextResponse.json({error:"Commande introuvable"},{status:404});
    const o=orderDoc.data()!;

    const notif=async(userId:string,userType:string,type:string,title:string,body:string)=>
      adminDb.collection("notifications").add({userId,userType,type,title,body,orderId,read:false,createdAt:FieldValue.serverTimestamp()});

    if(action==="accept"){
      await adminDb.collection("orders").doc(orderId).update({status:"navigating_pickup",acceptedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      await notif(o.storeId,"store","driver_accepted","🚗 Chauffeur en route",`Le chauffeur arrive pour récupérer la commande #${o.orderNumber}. Préparez-la!`);
      await notif(o.clientId,"client","driver_accepted","🚗 Chauffeur assigné",`Votre commande #${o.orderNumber} est prise en charge!`);
      if(o.storePhone) await sendSMS(o.storePhone,`FastDép 🚗 Chauffeur en route pour commande #${o.orderNumber}. Préparez la commande!`);
      if(o.clientPhone) await sendSMS(o.clientPhone,`FastDép ✅ Votre commande #${o.orderNumber} est prise en charge! Un chauffeur arrive.`);
    }
    else if(action==="refuse"){
      await adminDb.collection("orders").doc(orderId).update({status:"refused",refusedAt:FieldValue.serverTimestamp(),refuseReason:reason||"",refuseNote:note||"",refusedBy:driverId,driverId:null,updatedAt:FieldValue.serverTimestamp()});
      await notif("admin","admin","order_refused",`❌ Commande #${o.orderNumber} refusée`,`Raison: ${reason}${note?` — ${note}`:""}`);
    }
    else if(action==="arrived_store"){
      await adminDb.collection("orders").doc(orderId).update({status:"arrived_store",arrivedStoreAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      if(o.storePhone) await sendSMS(o.storePhone,`FastDép 🏪 Le chauffeur est arrivé pour récupérer la commande #${o.orderNumber}.`);
    }
    else if(action==="picked_up"){
      await adminDb.collection("orders").doc(orderId).update({status:"picked_up",pickedUpAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      await notif(o.clientId,"client","order_picked_up","📦 Commande en route!",`Votre commande #${o.orderNumber} est en route vers vous!`);
      if(o.clientPhone) await sendSMS(o.clientPhone,`FastDép 📦 Votre commande #${o.orderNumber} est en route! Le chauffeur arrive bientôt.`);
      const cd=await adminDb.collection("app_users").doc(o.clientId).get();
      const ce=cd.data()?.email;
      if(ce) await sendEmail(ce,o.clientName,`📦 Commande #${o.orderNumber} en route`,wrap(`<p>Bonjour <b>${o.clientName}</b>,</p><p>Votre commande est en route vers : <b>${o.deliveryAddress}</b></p>`));
    }
    else if(action==="arrived_client"){
      await adminDb.collection("orders").doc(orderId).update({status:"arrived_client",arrivedClientAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      await notif(o.clientId,"client","driver_arrived","🏠 Le chauffeur est là!",`Le chauffeur est devant chez vous pour la commande #${o.orderNumber}.`);
      if(o.clientPhone) await sendSMS(o.clientPhone,`FastDép 🏠 Votre chauffeur est arrivé! Commande #${o.orderNumber}.`);
    }
    else if(action==="delivered"){
      await adminDb.collection("orders").doc(orderId).update({status:"delivered",deliveredAt:FieldValue.serverTimestamp(),deliveryPhotoUrl:photoUrl||null,updatedAt:FieldValue.serverTimestamp()});
      await notif(o.clientId,"client","order_delivered","✅ Commande livrée!",`Votre commande #${o.orderNumber} a été livrée. Merci!`);
      await notif(o.storeId,"store","order_completed","✅ Commande #"+o.orderNumber+" complétée",`Livrée à ${o.clientName}.`);
      if(o.clientPhone) await sendSMS(o.clientPhone,`FastDép ✅ Commande #${o.orderNumber} livrée! Merci de choisir FastDép 🧡`);
      const cd=await adminDb.collection("app_users").doc(o.clientId).get();
      const ce=cd.data()?.email;
      if(ce) await sendEmail(ce,o.clientName,`✅ Commande #${o.orderNumber} livrée`,wrap(`<p>Bonjour <b>${o.clientName}</b>,</p><p>Commande <b>#${o.orderNumber}</b> livrée avec succès! Merci 🧡</p>`));
    }
    else if(action==="navigating_dropoff"){
      await adminDb.collection("orders").doc(orderId).update({status:"navigating_dropoff",updatedAt:FieldValue.serverTimestamp()});
    }
    else if(action==="rated"){
      await adminDb.collection("orders").doc(orderId).update({status:"rated",driverRating:rating||5,driverComment:comment||"",ratedAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      await adminDb.collection("order_ratings").add({orderId,driverId,stars:rating||5,comment:comment||"",createdAt:FieldValue.serverTimestamp()});
    }

    return NextResponse.json({ok:true,action,orderId});
  }catch(e){
    console.error("order-action:",e);
    return NextResponse.json({error:String(e)},{status:500});
  }
}
