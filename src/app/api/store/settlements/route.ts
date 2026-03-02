import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';
import type { StoreSettlement } from '@/lib/store-settlement/types';

// GET /api/store/settlements?storeId=xxx&status=xxx&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification via Bearer token
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

    // Vérifier que l'utilisateur est bien un store owner
    const userDoc = await adminDb.collection('app_users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Utilisateur introuvable.' }, { status: 404 });
    }
    const user = userDoc.data()!;
    if (!['store_owner', 'store_manager'].includes(user.role)) {
      return NextResponse.json({ ok: false, error: 'Accès réservé aux stores.' }, { status: 403 });
    }

    const storeId: string = user.store_id || req.nextUrl.searchParams.get('storeId') || '';
    if (!storeId) {
      return NextResponse.json({ ok: false, error: 'Store ID manquant.' }, { status: 400 });
    }

    const statusFilter = req.nextUrl.searchParams.get('status');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50);

    // Construire la requête Firestore
    let query = adminDb
      .collection('store_settlements')
      .where('store_id', '==', storeId)
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (statusFilter) {
      query = adminDb
        .collection('store_settlements')
        .where('store_id', '==', storeId)
        .where('status', '==', statusFilter)
        .orderBy('created_at', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();
    const settlements = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as StoreSettlement[];

    // Calculer les totaux
    const totalPending = settlements.filter(s =>
      ['pending', 'calculated', 'payment_initiated', 'sent', 'awaiting_acceptance'].includes(s.status)
    ).reduce((sum, s) => sum + s.net_store_amount, 0);

    const totalConfirmed = settlements.filter(s => s.status === 'confirmed')
      .reduce((sum, s) => sum + s.net_store_amount, 0);

    return NextResponse.json({
      ok: true,
      settlements,
      pagination: {
        page,
        limit,
        total: settlements.length,
      },
      summary: {
        total_pending: Math.round(totalPending * 100) / 100,
        total_confirmed: Math.round(totalConfirmed * 100) / 100,
      },
    });

  } catch (error: unknown) {
    console.error('store settlements error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur lors du chargement.' }, { status: 500 });
  }
}
