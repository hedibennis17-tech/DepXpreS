import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'payment' | 'payout' | 'refund'
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Récupérer payments
    let paymentsQuery: FirebaseFirestore.Query = adminDb.collection('payments');
    if (status) paymentsQuery = paymentsQuery.where('paymentStatus', '==', status);
    paymentsQuery = paymentsQuery.orderBy('createdAt', 'desc').limit(limit);
    
    // Récupérer payouts
    let payoutsQuery: FirebaseFirestore.Query = adminDb.collection('payouts');
    payoutsQuery = payoutsQuery.orderBy('createdAt', 'desc').limit(limit);
    
    const [paymentsSnap, payoutsSnap] = await Promise.all([
      type !== 'payout' ? paymentsQuery.get() : Promise.resolve({ docs: [] } as any),
      type !== 'payment' ? payoutsQuery.get() : Promise.resolve({ docs: [] } as any),
    ]);
    
    const payments = paymentsSnap.docs.map((d: any) => ({ id: d.id, ...d.data(), transactionType: 'payment' }));
    const payouts = payoutsSnap.docs.map((d: any) => ({ id: d.id, ...d.data(), transactionType: 'payout' }));
    
    const transactions = [...payments, ...payouts].sort((a: any, b: any) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    });
    
    // Métriques financières
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalRefunds = payments.filter((p: any) => p.paymentStatus === 'refunded').reduce((sum: number, p: any) => sum + (p.refundAmount || 0), 0);
    const totalPayouts = payouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const metrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalRefunds: Math.round(totalRefunds * 100) / 100,
      totalPayouts: Math.round(totalPayouts * 100) / 100,
      netRevenue: Math.round((totalRevenue - totalRefunds - totalPayouts) * 100) / 100,
      paymentsCount: payments.length,
      payoutsCount: payouts.length,
      refundsCount: payments.filter((p: any) => p.paymentStatus === 'refunded').length,
    };
    
    return NextResponse.json({ transactions, metrics, total: transactions.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
