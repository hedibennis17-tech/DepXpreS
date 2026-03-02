import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { serializeDoc, serializeDocs } from '@/lib/firestore-serialize';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const snap = await adminDb.collection('transactions').get();
    let txs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (type) txs = txs.filter(t => t.type === type);
    if (status) txs = txs.filter(t => t.status === status);
    
    // Trier par date décroissante
    txs.sort((a, b) => {
      const da = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const db2 = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return db2.getTime() - da.getTime();
    });
    
    const allTxs = snap.docs.map(d => d.data()) as any[];
    const totalRevenue = allTxs.filter(t => t.type === 'payment' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    const totalRefunds = allTxs.filter(t => t.status === 'refunded').reduce((s, t) => s + (t.amount || 0), 0);
    const totalPayouts = allTxs.filter(t => t.type === 'payout').reduce((s, t) => s + (t.amount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds - totalPayouts;
    
    return NextResponse.json({
      transactions: txs.slice(0, limit),
      total: snap.size,
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        totalPayouts: Math.round(totalPayouts * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        paymentsCount: allTxs.filter(t => t.type === 'payment').length,
        payoutsCount: allTxs.filter(t => t.type === 'payout').length,
        refundsCount: allTxs.filter(t => t.status === 'refunded').length,
      }
    });
  } catch (e) {
    console.error('transactions API error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
