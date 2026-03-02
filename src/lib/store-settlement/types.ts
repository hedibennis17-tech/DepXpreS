// ============================================================
// Store Settlement Module — Types & Enums (Firebase/Firestore)
// ============================================================

export type StoreSettlementStatus =
  | 'pending'
  | 'calculated'
  | 'payment_initiated'
  | 'sent'
  | 'awaiting_acceptance'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export type StorePayoutMethod =
  | 'stripe_connect'
  | 'interac_transfer'
  | 'manual_bank_transfer';

export type StorePayoutTxStatus =
  | 'created'
  | 'submitted'
  | 'processing'
  | 'sent'
  | 'awaiting_acceptance'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export type StoreOrderGateStatus =
  | 'awaiting_store_settlement'
  | 'store_settlement_sent'
  | 'store_settlement_confirmed';

// -------------------------------------------------------
// store_payment_profiles
// -------------------------------------------------------
export interface StorePaymentProfile {
  id: string;
  store_id: string;
  preferred_settlement_method: StorePayoutMethod;

  // Stripe Connect
  stripe_connected_account_id: string | null;
  stripe_payouts_enabled: boolean;

  // Interac
  interac_recipient_name: string | null;
  interac_email: string | null;
  autodeposit_enabled: boolean;
  security_question_required: boolean;
  security_question_text: string | null;

  // Règles opérationnelles
  payout_frequency: 'per_order' | 'daily' | 'weekly' | 'manual';
  settlement_hold_hours: number;
  requires_manual_confirmation: boolean;

  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------
// store_settlements
// -------------------------------------------------------
export interface StoreSettlement {
  id: string;
  store_id: string;
  store_name?: string;
  order_id: string | null;
  settlement_batch_id: string | null;

  currency: string;

  gross_sales_amount: number;
  taxes_amount: number;
  delivery_fee_amount: number;
  tip_amount: number;

  platform_fee_amount: number;
  promo_platform_share_amount: number;
  promo_store_share_amount: number;
  adjustment_amount: number;

  net_store_amount: number;

  gate_status: StoreOrderGateStatus;
  status: StoreSettlementStatus;
  method: StorePayoutMethod | null;

  calculated_by: string | null;
  initiated_by: string | null;
  confirmed_by: string | null;

  calculated_at: string | null;
  payment_initiated_at: string | null;
  sent_at: string | null;
  confirmed_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;

  failure_reason: string | null;
  internal_notes: string | null;
  store_visible_note: string | null;

  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------
// store_payout_transactions
// -------------------------------------------------------
export interface StorePayoutTransaction {
  id: string;
  settlement_id: string;
  store_id: string;
  order_id: string | null;

  method: StorePayoutMethod;
  status: StorePayoutTxStatus;

  amount: number;
  currency: string;

  // Stripe
  stripe_connected_account_id: string | null;
  stripe_payout_id: string | null;
  stripe_transfer_id: string | null;

  // Interac
  interac_recipient_name: string | null;
  interac_email: string | null;
  autodeposit_enabled: boolean;
  security_question_required: boolean;
  security_question_text: string | null;

  // Référence / audit
  provider_reference: string | null;
  transaction_receipt_url: string | null;
  provider_raw_response: Record<string, unknown> | null;

  created_by_admin_id: string;
  sent_by_admin_id: string | null;
  confirmed_by_user_id: string | null;

  created_at: string;
  submitted_at: string | null;
  sent_at: string | null;
  confirmed_at: string | null;
  failed_at: string | null;
  updated_at: string;

  failure_reason: string | null;
  admin_note: string | null;
}

// -------------------------------------------------------
// store_settlement_events
// -------------------------------------------------------
export interface StoreSettlementEvent {
  id: string;
  settlement_id: string;
  payout_transaction_id: string | null;
  event_type: string;
  actor_user_id: string | null;
  actor_role: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

// -------------------------------------------------------
// store_notifications
// -------------------------------------------------------
export interface StoreNotification {
  id: string;
  store_id: string;
  order_id: string | null;
  settlement_id: string | null;

  channel: 'in_app' | 'email' | 'sms';
  notification_type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;

  status: 'queued' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
}

// -------------------------------------------------------
// Champs ajoutés sur orders (Firestore)
// -------------------------------------------------------
export interface OrderSettlementFields {
  store_settlement_id: string | null;
  store_settlement_status: StoreSettlementStatus | null;
  store_gate_status: StoreOrderGateStatus;
}
