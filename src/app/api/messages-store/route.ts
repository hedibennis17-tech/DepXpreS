export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function isAdmin(req: NextRequest) {
  const role = req.cookies.get("admin_role")?.value;
  return role && ["super_admin","admin","dispatcher"].includes(role);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId requis" }, { status: 400 });
  try {
    const snap = await adminDb
      .collection("store_conversations").doc(storeId)
      .collection("messages")
      .orderBy("createdAt","asc").limit(100).get();
    const messages = snap.docs.map(d => ({
      id: d.id, ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));
    return NextResponse.json({ ok:true, messages });
  } catch(e){ return NextResponse.json({error:String(e)},{status:500}); }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin(req);
    const body = await req.json();
    const { storeId, text, senderName } = body;
    if (!storeId || !text?.trim()) return NextResponse.json({error:"Paramètres manquants"},{status:400});

    const isAdminSender = admin;
    const ref = await adminDb
      .collection("store_conversations").doc(storeId)
      .collection("messages").add({
        text: text.trim(),
        senderId: isAdminSender ? "admin" : storeId,
        senderName: isAdminSender ? "FastDép Admin" : senderName || "Commerçant",
        senderRole: isAdminSender ? "admin" : "store",
        createdAt: FieldValue.serverTimestamp(),
        read: false,
      });

    await adminDb.collection("store_conversations").doc(storeId).set({
      storeId, lastMessage: text.trim().slice(0,100),
      lastMessageAt: FieldValue.serverTimestamp(),
      lastSenderRole: isAdminSender ? "admin" : "store",
      unread_store: isAdminSender ? FieldValue.increment(1) : 0,
      unread_admin: isAdminSender ? 0 : FieldValue.increment(1),
    }, { merge: true });

    // Notification in-app
    await adminDb.collection("notifications").add({
      userId: isAdminSender ? storeId : "admin",
      userType: isAdminSender ? "store" : "admin",
      type: "message",
      title: isAdminSender ? "💬 Message de FastDép Admin" : `💬 Message de ${senderName||"Commerçant"}`,
      body: text.trim().slice(0,100),
      storeId, read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok:true, messageId:ref.id });
  } catch(e){ return NextResponse.json({error:String(e)},{status:500}); }
}
