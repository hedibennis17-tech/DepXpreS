import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET() {
  try {
    const snap = await adminDb.collection('system_settings').get();
    const settings: Record<string, any> = {};
    snap.docs.forEach(d => { settings[d.id] = { id: d.id, ...d.data() }; });
    return NextResponse.json({ settings, total: snap.size });
  } catch (e) {
    console.error('settings API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, ...data } = body;
    const docId = section || 'general';
    await adminDb.collection('system_settings').doc(docId).set(
      { ...data, updatedAt: new Date(), updatedBy: 'admin' },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
