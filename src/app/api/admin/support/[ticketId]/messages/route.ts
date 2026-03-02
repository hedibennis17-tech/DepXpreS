import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  try {
    const { ticketId } = await params;
    const body = await req.json();
    
    const doc = await adminDb.collection('support_tickets').doc(ticketId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const ticket = doc.data()!;
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: body.senderId || 'admin-hedi',
      senderName: body.senderName || 'Hedi Bennis',
      senderType: body.senderType || 'admin',
      content: body.content,
      createdAt: new Date(),
    };
    
    const messages = ticket.messages || [];
    messages.push(newMessage);
    
    await adminDb.collection('support_tickets').doc(ticketId).update({
      messages,
      updatedAt: new Date(),
      status: ticket.status === 'open' ? 'in_progress' : ticket.status,
    });
    
    return NextResponse.json({ message: newMessage });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
