// Store settlements API routes
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleAuthError } from '@/lib/auth/auth-guards';
import { adminDb } from '@/lib/firebase-admin';
import type { StoreSettlement } from '@/lib/store-settlement/types';

// GET /api/admin/store-settlements?status=xxx&storeId=xxx&limit=50
export async function GET(req: NextRequest) {
  try {
    try { await requirePermission(req, 'store_settlements.read'); } catch(e) { return handleAuthError(e); }

    const statusFilter = req.nextUrl.searchParams.get('status');
    const storeId = req.nextUrl.searchParams.get('storeId');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100);

    let query = adminDb.collection('store_settlements').orderBy('created_at', 'desc').limit(limit);

    if (statusFilter) {
      query = adminDb
        .collection('store_settlements')
        .where('status', '==', statusFilter)
        .orderBy('created_at', 'desc')
        .limit(limit);
    }

    if (storeId) {
      query = adminDb
        .collection('store_settlements')
        .where('store_id', '==', storeId)
        .orderBy('created_at', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();
    const settlements = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as StoreSettlement[];

    const totalPending = settlements
      .filter(s => ['pending', 'calculated', 'payment_initiated', 'sent', 'awaiting_acceptance'].includes(s.status))
      .reduce((sum, s) => sum + (s.net_store_amount || 0), 0);

    const totalConfirmed = settlements
      .filter(s => s.status === 'confirmed')
      .reduce((sum, s) => sum + (s.net_store_amount || 0), 0);

    return NextResponse.json({
      ok: true,
      settlements,
      summary: {
        total_pending: Math.round(totalPending * 100) / 100,
        total_confirmed: Math.round(totalConfirmed * 100) / 100,
        total_count: settlements.length,
      },
    });

  } catch (error: unknown) {
    console.error('admin store-settlements list error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du chargement.' }, { status: 500 });
  }
}
