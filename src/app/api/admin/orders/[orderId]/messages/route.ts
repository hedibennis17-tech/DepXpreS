import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Find thread for this order
    const threadSnap = await adminDb
      .collection("chat_threads")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();

    if (threadSnap.empty) {
      return NextResponse.json({ thread: null, messages: [] });
    }

    const threadDoc = threadSnap.docs[0];
    const thread = { id: threadDoc.id, ...serializeDoc(threadDoc.data()) };

    // Get messages
    const messagesSnap = await adminDb
      .collection("chat_threads")
      .doc(threadDoc.id)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...serializeDoc(doc.data()),
    }));

    return NextResponse.json({ thread, messages });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { messageBody, senderRole = "admin" } = body;

    if (!messageBody) {
      return NextResponse.json({ error: "Message body required" }, { status: 400 });
    }

    // Find or create thread
    let threadId: string;
    const threadSnap = await adminDb
      .collection("chat_threads")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();

    if (threadSnap.empty) {
      const newThread = await adminDb.collection("chat_threads").add({
        orderId,
        threadType: "order_support",
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      threadId = newThread.id;
    } else {
      threadId = threadSnap.docs[0].id;
    }

    // Add message
    const msgRef = await adminDb
      .collection("chat_threads")
      .doc(threadId)
      .collection("messages")
      .add({
        threadId,
        senderUserId: "admin-hedi",
        senderRole,
        messageType: "text",
        body: messageBody,
        readByUserIds: ["admin-hedi"],
        createdAt: FieldValue.serverTimestamp(),
      });

    // Update thread
    await adminDb.collection("chat_threads").doc(threadId).update({
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, messageId: msgRef.id });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
