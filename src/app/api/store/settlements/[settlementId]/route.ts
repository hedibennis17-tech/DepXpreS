import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import type { StoreSettlement } from '@/lib/store-settlement/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ ok: false, error: 'Token invalide.' }, { status: 401 });
    }

    const userDoc = await adminDb.collection('app_users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Utilisateur introuvable.' }, { status: 404 });
    }
    const user = userDoc.data()!;

    const { settlementId } = await params;

    const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
    if (!settlementDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Settlement introuvable.' }, { status: 404 });
    }
    const settlement = settlementDoc.data() as StoreSettlement;

    // Vérifier que le store owner accède à son propre settlement
    if (['store_owner', 'store_manager'].includes(user.role)) {
      if (settlement.store_id !== user.store_id) {
        return NextResponse.json({ ok: false, error: 'Accès refusé.' }, { status: 403 });
      }
    }

    // Charger les transactions de paiement (sans données sensibles pour le store)
    const txQuery = await adminDb
      .collection('store_payout_transactions')
      .where('settlement_id', '==', settlementId)
      .orderBy('created_at', 'desc')
      .get();

    const payoutTransactions = txQuery.docs.map(d => {
      const data = d.data();
      // Masquer les données sensibles pour le store
      return {
        id: data.id,
        method: data.method,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        created_at: data.created_at,
        sent_at: data.sent_at,
        confirmed_at: data.confirmed_at,
        failure_reason: data.failure_reason,
        transaction_receipt_url: data.transaction_receipt_url,
      };
    });

    return NextResponse.json({
      ok: true,
      settlement,
      payoutTransactions,
    });

  } catch (error: unknown) {
    console.error('store settlement detail error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du chargement.' }, { status: 500 });
  }
}
