// ============================================================
// Store Settlement Engine — Logique métier Firebase/Firestore
// Équivalent des fonctions SQL PostgreSQL
// ============================================================

import { adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import type {
  StoreSettlement,
  StorePayoutTransaction,
  StoreSettlementEvent,
  StoreNotification,
  StoreOrderGateStatus,
  StorePayoutMethod,
} from './types';

const PLATFORM_COMMISSION_RATE = 0.10; // 10% commission plateforme

// -------------------------------------------------------
// Utilitaire : créer un événement d'audit
// -------------------------------------------------------
async function logSettlementEvent(
  settlementId: string,
  eventType: string,
  actorUserId: string | null,
  actorRole: string | null,
  payload: Record<string, unknown> | null = null,
  payoutTransactionId: string | null = null
): Promise<void> {
  const event: StoreSettlementEvent = {
    id: uuidv4(),
    settlement_id: settlementId,
    payout_transaction_id: payoutTransactionId,
    event_type: eventType,
    actor_user_id: actorUserId,
    actor_role: actorRole,
    payload,
    created_at: new Date().toISOString(),
  };
  await adminDb.collection('store_settlement_events').doc(event.id).set(event);
}

// -------------------------------------------------------
// Utilitaire : créer une notification store
// -------------------------------------------------------
async function createStoreNotification(
  storeId: string,
  orderId: string | null,
  settlementId: string | null,
  notificationType: string,
  title: string,
  body: string,
  payload: Record<string, unknown> | null = null
): Promise<void> {
  const notif: StoreNotification = {
    id: uuidv4(),
    store_id: storeId,
    order_id: orderId,
    settlement_id: settlementId,
    channel: 'in_app',
    notification_type: notificationType,
    title,
    body,
    payload,
    status: 'queued',
    sent_at: null,
    created_at: new Date().toISOString(),
  };
  await adminDb.collection('store_notifications').doc(notif.id).set(notif);
}

// -------------------------------------------------------
// 1) calculateStoreSettlement
// Équivalent : calculate_store_settlement_for_order()
// -------------------------------------------------------
export async function calculateStoreSettlement(
  orderId: string,
  actorUserId: string
): Promise<string> {
  // Charger la commande
  const orderDoc = await adminDb.collection('orders').doc(orderId).get();
  if (!orderDoc.exists) throw new Error('ORDER_NOT_FOUND');

  const order = orderDoc.data()!;
  const storeId: string = order.storeId || order.store_id;
  if (!storeId) throw new Error('ORDER_HAS_NO_STORE');

  // Vérifier si un settlement existe déjà pour cette commande
  const existingQuery = await adminDb
    .collection('store_settlements')
    .where('order_id', '==', orderId)
    .limit(1)
    .get();

  const subtotal = Number(order.subtotal || order.total || 0);
  const taxesAmount = Number(order.qst_amount || 0) + Number(order.gst_amount || 0);
  const deliveryFee = Number(order.delivery_fee || order.deliveryFee || 0);
  const tipAmount = Number(order.tip_amount || order.tip || 0);
  const platformFee = Math.round(subtotal * PLATFORM_COMMISSION_RATE * 100) / 100;
  const promoStorShare = 0;
  const promoPlatformShare = 0;
  const adjustment = 0;
  const netStoreAmount = Math.round((subtotal - platformFee - promoStorShare + adjustment) * 100) / 100;

  const now = new Date().toISOString();

  let settlementId: string;

  if (!existingQuery.empty) {
    // Mettre à jour le settlement existant
    settlementId = existingQuery.docs[0].id;
    await adminDb.collection('store_settlements').doc(settlementId).update({
      gross_sales_amount: subtotal,
      taxes_amount: taxesAmount,
      delivery_fee_amount: deliveryFee,
      tip_amount: tipAmount,
      platform_fee_amount: platformFee,
      promo_platform_share_amount: promoPlatformShare,
      promo_store_share_amount: promoStorShare,
      adjustment_amount: adjustment,
      net_store_amount: netStoreAmount,
      status: 'calculated',
      calculated_by: actorUserId,
      calculated_at: now,
      updated_at: now,
    });
  } else {
    // Créer un nouveau settlement
    settlementId = uuidv4();
    const settlement: StoreSettlement = {
      id: settlementId,
      store_id: storeId,
      order_id: orderId,
      settlement_batch_id: null,
      currency: 'CAD',
      gross_sales_amount: subtotal,
      taxes_amount: taxesAmount,
      delivery_fee_amount: deliveryFee,
      tip_amount: tipAmount,
      platform_fee_amount: platformFee,
      promo_platform_share_amount: promoPlatformShare,
      promo_store_share_amount: promoStorShare,
      adjustment_amount: adjustment,
      net_store_amount: netStoreAmount,
      gate_status: 'awaiting_store_settlement',
      status: 'calculated',
      method: null,
      calculated_by: actorUserId,
      initiated_by: null,
      confirmed_by: null,
      calculated_at: now,
      payment_initiated_at: null,
      sent_at: null,
      confirmed_at: null,
      failed_at: null,
      cancelled_at: null,
      failure_reason: null,
      internal_notes: null,
      store_visible_note: null,
      created_at: now,
      updated_at: now,
    };
    await adminDb.collection('store_settlements').doc(settlementId).set(settlement);
  }

  // Mettre à jour la commande
  await adminDb.collection('orders').doc(orderId).update({
    store_settlement_id: settlementId,
    store_settlement_status: 'calculated',
    store_gate_status: 'awaiting_store_settlement',
    updatedAt: now,
  });

  // Log événement
  await logSettlementEvent(settlementId, 'settlement_calculated', actorUserId, null, {
    net_store_amount: netStoreAmount,
    platform_fee: platformFee,
  });

  return settlementId;
}

// -------------------------------------------------------
// 2) markSettlementSent
// Équivalent : mark_store_settlement_sent()
// -------------------------------------------------------
export async function markSettlementSent(
  settlementId: string,
  payoutTransactionId: string,
  actorUserId: string,
  requiresAcceptance: boolean
): Promise<void> {
  const now = new Date().toISOString();
  const newStatus = requiresAcceptance ? 'awaiting_acceptance' : 'sent';
  const newGateStatus: StoreOrderGateStatus = 'store_settlement_sent';

  const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
  if (!settlementDoc.exists) throw new Error('SETTLEMENT_NOT_FOUND');
  const settlement = settlementDoc.data() as StoreSettlement;

  await adminDb.collection('store_settlements').doc(settlementId).update({
    status: newStatus,
    gate_status: newGateStatus,
    initiated_by: actorUserId,
    payment_initiated_at: now,
    sent_at: now,
    updated_at: now,
  });

  // Mettre à jour la commande
  if (settlement.order_id) {
    await adminDb.collection('orders').doc(settlement.order_id).update({
      store_settlement_status: newStatus,
      store_gate_status: newGateStatus,
      updatedAt: now,
    });
  }

  // Log événement
  await logSettlementEvent(
    settlementId,
    requiresAcceptance ? 'settlement_awaiting_acceptance' : 'settlement_sent',
    actorUserId,
    null,
    { requires_acceptance: requiresAcceptance },
    payoutTransactionId
  );

  // Notification store
  await createStoreNotification(
    settlement.store_id,
    settlement.order_id,
    settlementId,
    'store_payment_sent',
    requiresAcceptance ? 'Paiement en attente d\'acceptation' : 'Paiement envoyé',
    requiresAcceptance
      ? `Le transfert Interac a été envoyé pour la commande. Veuillez l'accepter.`
      : `Le paiement de ${settlement.net_store_amount} CAD a été envoyé.`
  );
}

// -------------------------------------------------------
// 3) confirmSettlement
// Équivalent : confirm_store_settlement()
// -------------------------------------------------------
export async function confirmSettlement(
  settlementId: string,
  actorUserId: string,
  providerReference: string | null = null
): Promise<void> {
  const now = new Date().toISOString();
  const newGateStatus: StoreOrderGateStatus = 'store_settlement_confirmed';

  const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
  if (!settlementDoc.exists) throw new Error('SETTLEMENT_NOT_FOUND');
  const settlement = settlementDoc.data() as StoreSettlement;

  await adminDb.collection('store_settlements').doc(settlementId).update({
    status: 'confirmed',
    gate_status: newGateStatus,
    confirmed_by: actorUserId,
    confirmed_at: now,
    updated_at: now,
  });

  // Mettre à jour la commande — débloquer pour store_preparing
  if (settlement.order_id) {
    await adminDb.collection('orders').doc(settlement.order_id).update({
      store_settlement_status: 'confirmed',
      store_gate_status: newGateStatus,
      updatedAt: now,
    });
  }

  // Log événement
  await logSettlementEvent(settlementId, 'settlement_confirmed', actorUserId, null, {
    provider_reference: providerReference,
  });

  // Notification store
  await createStoreNotification(
    settlement.store_id,
    settlement.order_id,
    settlementId,
    'store_payment_confirmed',
    'Paiement confirmé',
    `Le paiement de ${settlement.net_store_amount} CAD a été confirmé. Vous pouvez préparer la commande.`
  );
}

// -------------------------------------------------------
// 4) failSettlement
// -------------------------------------------------------
export async function failSettlement(
  settlementId: string,
  payoutTransactionId: string,
  actorUserId: string,
  reason: string
): Promise<void> {
  const now = new Date().toISOString();

  const settlementDoc = await adminDb.collection('store_settlements').doc(settlementId).get();
  if (!settlementDoc.exists) throw new Error('SETTLEMENT_NOT_FOUND');
  const settlement = settlementDoc.data() as StoreSettlement;

  await adminDb.collection('store_settlements').doc(settlementId).update({
    status: 'failed',
    failure_reason: reason,
    failed_at: now,
    updated_at: now,
  });

  // La commande reste bloquée
  if (settlement.order_id) {
    await adminDb.collection('orders').doc(settlement.order_id).update({
      store_settlement_status: 'failed',
      updatedAt: now,
    });
  }

  // Log événement
  await logSettlementEvent(settlementId, 'settlement_failed', actorUserId, null, {
    reason,
  }, payoutTransactionId);

  // Notification store
  await createStoreNotification(
    settlement.store_id,
    settlement.order_id,
    settlementId,
    'store_payment_failed',
    'Échec du paiement',
    `Le paiement a échoué : ${reason}. Contactez l'administrateur.`
  );
}

// -------------------------------------------------------
// 5) canOrderMoveToStorePreparing
// Équivalent : can_order_move_to_store_preparing()
// -------------------------------------------------------
export async function canOrderMoveToStorePreparing(orderId: string): Promise<boolean> {
  const orderDoc = await adminDb.collection('orders').doc(orderId).get();
  if (!orderDoc.exists) return false;

  const order = orderDoc.data()!;
  const gateStatus: StoreOrderGateStatus = order.store_gate_status || 'awaiting_store_settlement';

  // Mode strict : seulement après confirmation
  return gateStatus === 'store_settlement_confirmed';
}

// -------------------------------------------------------
// 6) createPayoutTransaction
// -------------------------------------------------------
export async function createPayoutTransaction(
  settlementId: string,
  storeId: string,
  orderId: string | null,
  method: StorePayoutMethod,
  amount: number,
  actorUserId: string,
  options: {
    interac_recipient_name?: string;
    interac_email?: string;
    autodeposit_enabled?: boolean;
    security_question_required?: boolean;
    security_question_text?: string;
    stripe_connected_account_id?: string;
    admin_note?: string;
  } = {}
): Promise<StorePayoutTransaction> {
  const now = new Date().toISOString();
  const txId = uuidv4();

  const tx: StorePayoutTransaction = {
    id: txId,
    settlement_id: settlementId,
    store_id: storeId,
    order_id: orderId,
    method,
    status: 'created',
    amount,
    currency: 'CAD',
    stripe_connected_account_id: options.stripe_connected_account_id || null,
    stripe_payout_id: null,
    stripe_transfer_id: null,
    interac_recipient_name: options.interac_recipient_name || null,
    interac_email: options.interac_email || null,
    autodeposit_enabled: options.autodeposit_enabled || false,
    security_question_required: options.security_question_required || false,
    security_question_text: options.security_question_text || null,
    provider_reference: null,
    transaction_receipt_url: null,
    provider_raw_response: null,
    created_by_admin_id: actorUserId,
    sent_by_admin_id: null,
    confirmed_by_user_id: null,
    created_at: now,
    submitted_at: null,
    sent_at: null,
    confirmed_at: null,
    failed_at: null,
    updated_at: now,
    failure_reason: null,
    admin_note: options.admin_note || null,
  };

  await adminDb.collection('store_payout_transactions').doc(txId).set(tx);
  return tx;
}
