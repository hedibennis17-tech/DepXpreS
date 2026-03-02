import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerType = searchParams.get('ownerType');
    
    let query: FirebaseFirestore.Query = adminDb.collection('wallets');
    if (ownerType) query = query.where('ownerType', '==', ownerType);
    query = query.orderBy('balance', 'desc');
    
    const snap = await query.get();
    const wallets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const totalBalance = wallets.reduce((sum: number, w: any) => sum + (w.balance || 0), 0);
    
    return NextResponse.json({ wallets, total: wallets.length, totalBalance: Math.round(totalBalance * 100) / 100 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
