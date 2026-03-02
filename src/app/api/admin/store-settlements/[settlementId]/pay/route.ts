import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import {
  createPayoutTransaction,
  markSettlementSent,
} from '@/lib/store-settlement/settlement-engine';
import type { StoreSettlement, StorePaymentProfile, StorePayoutMethod } from '@/lib/store-settlement/types';

type PayBody = {
  method: StorePayoutMethod;
  note?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    let user; try { user = await requirePermission(req, 'store_settlements.write'); } catch(e) { return handleAuthError(e); }

    const { settlementId } = await params;
    const body = (await req.json()) as PayBody;

    if (!body.method) {
      return NextResponse.json({ ok: false, error: 'Méthode de paiement requise.' }, { status: 400 });
    }

    // Charger le settlement
    const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
    if (!settlementDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Settlement introuvable.' }, { status: 404 });
    }
    const settlement = settlementDoc.data() as StoreSettlement;

    if (!['calculated', 'pending', 'failed'].includes(settlement.status)) {
      return NextResponse.json({
        ok: false,
        error: `Impossible d'effectuer le paiement. Statut actuel : ${settlement.status}`
      }, { status: 400 });
    }

    // Charger le profil de paiement du store
    const profileQuery = await adminDb
      .collection('store_payment_profiles')
      .where('store_id', '==', settlement.store_id)
      .limit(1)
      .get();

    const profile: StorePaymentProfile | null = profileQuery.empty
      ? null
      : (profileQuery.docs[0].data() as StorePaymentProfile);

    // Créer la transaction de paiement
    const payoutTx = await createPayoutTransaction(
      settlementId,
      settlement.store_id,
      settlement.order_id,
      body.method,
      settlement.net_store_amount,
      user!.uid,
      {
        interac_recipient_name: profile?.interac_recipient_name || undefined,
        interac_email: profile?.interac_email || undefined,
        autodeposit_enabled: profile?.autodeposit_enabled || false,
        security_question_required: profile?.security_question_required || false,
        security_question_text: profile?.security_question_text || undefined,
        stripe_connected_account_id: profile?.stripe_connected_account_id || undefined,
        admin_note: body.note,
      }
    );

    const now = new Date().toISOString();

    if (body.method === 'stripe_connect') {
      // TODO: Intégrer l'appel Stripe Connect réel
      // Pour l'instant, on simule le processing
      await adminDb.collection('store_payout_transactions').doc(payoutTx.id).update({
        status: 'processing',
        submitted_at: now,
        provider_reference: 'stripe_pending_webhook',
        updated_at: now,
      });

      await markSettlementSent(settlementId, payoutTx.id, user!.uid, false);

    } else if (body.method === 'interac_transfer') {
      const requiresAcceptance = !(profile?.autodeposit_enabled || false);

      await adminDb.collection('store_payout_transactions').doc(payoutTx.id).update({
        status: requiresAcceptance ? 'awaiting_acceptance' : 'sent',
        submitted_at: now,
        sent_at: now,
        provider_reference: `interac_${Date.now()}`,
        updated_at: now,
      });

      await markSettlementSent(settlementId, payoutTx.id, user!.uid, requiresAcceptance);

    } else {
      // Virement manuel
      await adminDb.collection('store_payout_transactions').doc(payoutTx.id).update({
        status: 'submitted',
        submitted_at: now,
        provider_reference: `manual_${Date.now()}`,
        updated_at: now,
      });

      await markSettlementSent(settlementId, payoutTx.id, user!.uid, true);
    }

    return NextResponse.json({
      ok: true,
      settlementId,
      payoutTransactionId: payoutTx.id,
      method: body.method,
    });

  } catch (error: unknown) {
    console.error('pay settlement error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du paiement.' }, { status: 500 });
  }
}
