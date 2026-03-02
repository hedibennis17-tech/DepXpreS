export type UUID = string;
export type ISODateString = string;

export type StoreSettlementStatus =
  | "pending"
  | "calculated"
  | "payment_initiated"
  | "sent"
  | "awaiting_acceptance"
  | "confirmed"
  | "failed"
  | "cancelled";

export type StorePayoutMethod =
  | "stripe_connect"
  | "interac_transfer"
  | "manual_bank_transfer";

export type StorePayoutTxStatus =
  | "created"
  | "submitted"
  | "processing"
  | "sent"
  | "awaiting_acceptance"
  | "confirmed"
  | "failed"
  | "cancelled";

export type StoreOrderGateStatus =
  | "awaiting_store_settlement"
  | "store_settlement_sent"
  | "store_settlement_confirmed";

export type StorePaymentProfile = {
  id: UUID;
  store_id: UUID;
  preferred_settlement_method: StorePayoutMethod;
  stripe_connected_account_id: string | null;
  stripe_payouts_enabled: boolean;
  interac_recipient_name: string | null;
  interac_email: string | null;
  autodeposit_enabled: boolean;
  security_question_required: boolean;
  security_question_text: string | null;
  payout_frequency: "per_order" | "daily" | "weekly" | "manual";
  settlement_hold_hours: number;
  requires_manual_confirmation: boolean;
  status: "active" | "inactive" | "suspended";
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type StoreSettlement = {
  id: UUID;
  store_id: UUID;
  store_name?: string;
  order_id: UUID | null;
  settlement_batch_id: UUID | null;
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
  calculated_by: UUID | null;
  initiated_by: UUID | null;
  confirmed_by: UUID | null;
  calculated_at: ISODateString | null;
  payment_initiated_at: ISODateString | null;
  sent_at: ISODateString | null;
  confirmed_at: ISODateString | null;
  failed_at: ISODateString | null;
  cancelled_at: ISODateString | null;
  failure_reason: string | null;
  internal_notes: string | null;
  store_visible_note: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type StorePayoutTransaction = {
  id: UUID;
  settlement_id: UUID;
  store_id: UUID;
  order_id: UUID | null;
  method: StorePayoutMethod;
  status: StorePayoutTxStatus;
  amount: number;
  currency: string;
  stripe_connected_account_id: string | null;
  stripe_payout_id: string | null;
  stripe_transfer_id: string | null;
  interac_recipient_name: string | null;
  interac_email: string | null;
  autodeposit_enabled: boolean;
  security_question_required: boolean;
  security_question_text: string | null;
  provider_reference: string | null;
  transaction_receipt_url: string | null;
  provider_raw_response: Record<string, unknown> | null;
  created_by_admin_id: UUID;
  sent_by_admin_id: UUID | null;
  confirmed_by_user_id: UUID | null;
  created_at: ISODateString;
  submitted_at: ISODateString | null;
  sent_at: ISODateString | null;
  confirmed_at: ISODateString | null;
  failed_at: ISODateString | null;
  updated_at: ISODateString;
  failure_reason: string | null;
  admin_note: string | null;
};

export type StoreSettlementEvent = {
  id: UUID;
  settlement_id: UUID;
  payout_transaction_id: UUID | null;
  event_type: string;
  actor_user_id: UUID | null;
  actor_role: string | null;
  payload: Record<string, unknown> | null;
  created_at: ISODateString;
};

export type StoreNotification = {
  id: UUID;
  store_id: UUID;
  order_id: UUID | null;
  settlement_id: UUID | null;
  channel: "in_app" | "email" | "sms";
  notification_type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  status: "queued" | "sent" | "failed";
  sent_at: ISODateString | null;
  created_at: ISODateString;
};

export type AdminOrderStoreSettlementView = {
  order_id: UUID;
  order_number: string;
  store_id: UUID;
  store_name: string;
  store_settlement_id: UUID | null;
  store_settlement_status: StoreSettlementStatus | null;
  store_gate_status: StoreOrderGateStatus | null;
  settlement_status: StoreSettlementStatus | null;
  settlement_method: StorePayoutMethod | null;
  gross_sales_amount: number | null;
  platform_fee_amount: number | null;
  adjustment_amount: number | null;
  net_store_amount: number | null;
  sent_at: ISODateString | null;
  confirmed_at: ISODateString | null;
  failure_reason: string | null;
};

export type CalculateStoreSettlementResponse = {
  ok: boolean;
  settlementId?: UUID;
  error?: string;
};

export type PayStoreSettlementRequest = {
  method: StorePayoutMethod;
  note?: string;
};

export type PayStoreSettlementResponse = {
  ok: boolean;
  settlementId?: UUID;
  payoutTransactionId?: UUID;
  method?: StorePayoutMethod;
  error?: string;
};

export type ConfirmStoreSettlementRequest = {
  payoutTransactionId?: UUID;
  providerReference?: string;
  note?: string;
};

export type FailStoreSettlementRequest = {
  payoutTransactionId?: UUID;
  reason: string;
};

export type StoreSettlementDetailsResponse = {
  ok: boolean;
  settlement?: StoreSettlement;
  payoutTransactions?: StorePayoutTransaction[];
  events?: StoreSettlementEvent[];
  error?: string;
};

// -------------------------------------------------------
// Champs ajoutés sur orders (Firestore)
// -------------------------------------------------------
export interface OrderSettlementFields {
  store_settlement_id: UUID | null;
  store_settlement_status: StoreSettlementStatus | null;
  store_gate_status: StoreOrderGateStatus;
}
