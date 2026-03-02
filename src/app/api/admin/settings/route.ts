import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const doc = await adminDb.collection('system_settings').doc('global').get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ settings: { id: doc.id, ...doc.data() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    await adminDb.collection('system_settings').doc('global').update({
      ...body,
      updatedAt: new Date(),
      updatedBy: 'admin-hedi',
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
