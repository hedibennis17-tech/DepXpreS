import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query: FirebaseFirestore.Query = adminDb.collection('driver_applications');
    if (status) query = query.where('applicationStatus', '==', status);
    query = query.orderBy('submittedAt', 'desc');
    
    const snap = await query.get();
    const applications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const allSnap = await adminDb.collection('driver_applications').get();
    const all = allSnap.docs.map(d => d.data());
    const metrics = {
      total: all.length,
      pending: all.filter(a => a.applicationStatus === 'pending').length,
      underReview: all.filter(a => a.applicationStatus === 'under_review').length,
      approved: all.filter(a => a.applicationStatus === 'approved').length,
      rejected: all.filter(a => a.applicationStatus === 'rejected').length,
    };
    
    return NextResponse.json({ applications, metrics, total: applications.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
