import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(_: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await params;
    const doc = await adminDb.collection('driver_applications').doc(appId).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ application: { id: doc.id, ...doc.data() } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = { ...body, updatedAt: new Date(), reviewedBy: 'admin-hedi' };
    await adminDb.collection('driver_applications').doc(appId).update(update);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
