export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import { confirmSettlement } from '@/lib/store-settlement/settlement-engine';

type ConfirmBody = {
  payoutTransactionId: string;
  providerReference?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    let user; try { user = await requirePermission(req, 'store_settlements.write'); } catch(e) { return handleAuthError(e); }

    const { settlementId } = await params;
    const body = (await req.json()) as ConfirmBody;

    // Mettre à jour la transaction de paiement
    if (body.payoutTransactionId) {
      const now = new Date().toISOString();
      await adminDb.collection('store_payout_transactions').doc(body.payoutTransactionId).update({
        status: 'confirmed',
        confirmed_at: now,
        confirmed_by_user_id: user!.uid,
        provider_reference: body.providerReference || null,
        updated_at: now,
      });
    }

    await confirmSettlement(settlementId, user!.uid, body.providerReference || null);

    return NextResponse.json({ ok: true, settlementId });

  } catch (error: unknown) {
    console.error('confirm settlement error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors de la confirmation.' }, { status: 500 });
  }
}
