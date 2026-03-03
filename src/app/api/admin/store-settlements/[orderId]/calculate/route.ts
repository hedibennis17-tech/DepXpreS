export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { calculateStoreSettlement } from '@/lib/store-settlement/settlement-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    let user; try { user = await requirePermission(req, 'store_settlements.write'); } catch(e) { return handleAuthError(e); }

    const { orderId } = await params;
    const settlementId = await calculateStoreSettlement(orderId, user!.uid);

    return NextResponse.json({ ok: true, settlementId });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'ORDER_NOT_FOUND') {
      return NextResponse.json({ ok: false, error: 'Commande introuvable.' }, { status: 404 });
    }
    if (err.message === 'ORDER_HAS_NO_STORE') {
      return NextResponse.json({ ok: false, error: 'La commande n\'est pas associée à un store.' }, { status: 400 });
    }
    console.error('calculate settlement error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du calcul du settlement.' }, { status: 500 });
  }
}
