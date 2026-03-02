import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import type { StoreSettlement, StorePaymentProfile } from '@/lib/store-settlement/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    try { await requirePermission(req, 'store_settlements.read'); } catch(e) { return handleAuthError(e); }

    const { settlementId } = await params;

    // Charger le settlement
    const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
    if (!settlementDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Settlement introuvable.' }, { status: 404 });
    }
    const settlement = settlementDoc.data() as StoreSettlement;

    // Charger les transactions de paiement
    const txQuery = await adminDb
      .collection('store_payout_transactions')
      .where('settlement_id', '==', settlementId)
      .orderBy('created_at', 'desc')
      .get();
    const payoutTransactions = txQuery.docs.map(d => d.data());

    // Charger les événements d'audit
    const eventsQuery = await adminDb
      .collection('store_settlement_events')
      .where('settlement_id', '==', settlementId)
      .orderBy('created_at', 'desc')
      .get();
    const events = eventsQuery.docs.map(d => d.data());

    // Charger le profil de paiement du store
    const profileQuery = await adminDb
      .collection('store_payment_profiles')
      .where('store_id', '==', settlement.store_id)
      .limit(1)
      .get();
    const storeProfile: StorePaymentProfile | null = profileQuery.empty
      ? null
      : (profileQuery.docs[0].data() as StorePaymentProfile);

    // Charger la commande associée
    let order = null;
    if (settlement.order_id) {
      const orderDoc = await adminDb.collection('orders').doc(settlement.order_id).get();
      if (orderDoc.exists) {
        order = { id: orderDoc.id, ...orderDoc.data() };
      }
    }

    // Charger le store
    let store = null;
    if (settlement.store_id) {
      const storeDoc = await adminDb.collection('stores').doc(settlement.store_id).get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...storeDoc.data() };
      }
    }

    return NextResponse.json({
      ok: true,
      settlement,
      payoutTransactions,
      events,
      storeProfile,
      order,
      store,
    });

  } catch (error: unknown) {
    console.error('settlement details error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du chargement des détails.' }, { status: 500 });
  }
}
