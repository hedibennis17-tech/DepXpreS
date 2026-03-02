import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import type { StoreSettlement } from '@/lib/store-settlement/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    try { await requirePermission(req, 'store_settlements.read'); } catch(e) { return handleAuthError(e); }

    const { orderId } = await params;

    // Chercher le settlement par order_id
    const query = await adminDb
      .collection('store_settlements')
      .where('order_id', '==', orderId)
      .limit(1)
      .get();

    if (query.empty) {
      return NextResponse.json({ ok: true, settlement: null, payoutTransactions: [] });
    }

    const settlement = query.docs[0].data() as StoreSettlement;
    const settlementId = query.docs[0].id;

    // Charger les transactions de paiement
    const txQuery = await adminDb
      .collection('store_payout_transactions')
      .where('settlement_id', '==', settlementId)
      .orderBy('created_at', 'desc')
      .get();

    const payoutTransactions = txQuery.docs.map(d => d.data());

    return NextResponse.json({
      ok: true,
      settlement,
      payoutTransactions,
    });

  } catch (error: unknown) {
    console.error('by-order settlement error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du chargement.' }, { status: 500 });
  }
}
