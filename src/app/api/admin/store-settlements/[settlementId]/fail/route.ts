export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import { failSettlement } from '@/lib/store-settlement/settlement-engine';

type FailBody = {
  payoutTransactionId: string;
  reason: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    let user; try { user = await requirePermission(req, 'store_settlements.write'); } catch(e) { return handleAuthError(e); }

    const { settlementId } = await params;
    const body = (await req.json()) as FailBody;

    if (!body.reason) {
      return NextResponse.json({ ok: false, error: 'Raison de l\'échec requise.' }, { status: 400 });
    }

    // Mettre à jour la transaction de paiement
    if (body.payoutTransactionId) {
      const now = new Date().toISOString();
      await adminDb.collection('store_payout_transactions').doc(body.payoutTransactionId).update({
        status: 'failed',
        failed_at: now,
        failure_reason: body.reason,
        updated_at: now,
      });
    }

    await failSettlement(settlementId, body.payoutTransactionId, user!.uid, body.reason);

    return NextResponse.json({ ok: true, settlementId });

  } catch (error: unknown) {
    console.error('fail settlement error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du marquage d\'échec.' }, { status: 500 });
  }
}
