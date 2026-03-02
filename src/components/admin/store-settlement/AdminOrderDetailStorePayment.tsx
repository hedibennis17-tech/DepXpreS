"use client";

import * as React from "react";

// If you already have shadcn/ui in your project, replace the small UI primitives
// below with your real imports.

type StoreSettlementStatus =
  | "pending"
  | "calculated"
  | "payment_initiated"
  | "sent"
  | "awaiting_acceptance"
  | "confirmed"
  | "failed"
  | "cancelled";

type StorePayoutMethod =
  | "stripe_connect"
  | "interac_transfer"
  | "manual_bank_transfer";

type StoreOrderGateStatus =
  | "awaiting_store_settlement"
  | "store_settlement_sent"
  | "store_settlement_confirmed";

type StorePaymentProfile = {
  preferred_settlement_method: StorePayoutMethod;
  stripe_connected_account_id: string | null;
  stripe_payouts_enabled: boolean;
  interac_recipient_name: string | null;
  interac_email: string | null;
  autodeposit_enabled: boolean;
  security_question_required: boolean;
  security_question_text: string | null;
};

type StoreSettlementSummary = {
  id: string | null;
  status: StoreSettlementStatus | null;
  gateStatus: StoreOrderGateStatus | null;
  method: StorePayoutMethod | null;
  grossSalesAmount: number | null;
  platformFeeAmount: number | null;
  adjustmentAmount: number | null;
  netStoreAmount: number | null;
  sentAt: string | null;
  confirmedAt: string | null;
  failureReason: string | null;
  providerReference?: string | null;
};

type OrderStorePaymentCardProps = {
  orderId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  settlement: StoreSettlementSummary;
  paymentProfile?: StorePaymentProfile | null;
  strictMode?: boolean;
  onRefresh?: () => Promise<void> | void;
};

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(value ?? 0));
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ label, tone }: { label: string; tone: "gray" | "green" | "amber" | "red" | "blue" }) {
  const toneMap = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", toneMap[tone])}>
      {label}
    </span>
  );
}

function settlementTone(status: StoreSettlementStatus | null): "gray" | "green" | "amber" | "red" | "blue" {
  switch (status) {
    case "confirmed":
      return "green";
    case "sent":
      return "blue";
    case "awaiting_acceptance":
    case "calculated":
    case "payment_initiated":
      return "amber";
    case "failed":
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

function settlementLabel(status: StoreSettlementStatus | null) {
  switch (status) {
    case "pending":
      return "En attente";
    case "calculated":
      return "Calculé";
    case "payment_initiated":
      return "Paiement initié";
    case "sent":
      return "Envoyé";
    case "awaiting_acceptance":
      return "En attente d’acceptation";
    case "confirmed":
      return "Confirmé";
    case "failed":
      return "Échec";
    case "cancelled":
      return "Annulé";
    default:
      return "Non créé";
  }
}

function gateLabel(gateStatus: StoreOrderGateStatus | null, strictMode: boolean) {
  if (!gateStatus) return "Bloquée";
  if (strictMode) {
    return gateStatus === "store_settlement_confirmed" ? "Débloquée" : "Bloquée (mode strict)";
  }
  return gateStatus === "store_settlement_sent" || gateStatus === "store_settlement_confirmed"
    ? "Débloquée"
    : "Bloquée";
}

async function jsonFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "REQUEST_FAILED");
  }

  return json as T;
}

export default function AdminOrderDetailStorePayment({
  orderId,
  orderNumber,
  storeName,
  settlement,
  paymentProfile,
  strictMode = true,
  onRefresh,
}: OrderStorePaymentCardProps) {
  const [busy, setBusy] = React.useState<null | "calculate" | "pay" | "confirm" | "fail">(null);
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<StorePayoutMethod>(
    paymentProfile?.preferred_settlement_method ?? "interac_transfer"
  );
  const [note, setNote] = React.useState("");
  const [failReason, setFailReason] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const canCalculate = !settlement.id || settlement.status === "pending" || settlement.status === "failed";
  const canPay = !!settlement.id && ["calculated", "failed"].includes(String(settlement.status));
  const canConfirm = !!settlement.id && ["sent", "awaiting_acceptance", "payment_initiated"].includes(String(settlement.status));
  const canFail = !!settlement.id && ["sent", "awaiting_acceptance", "payment_initiated", "processing"].includes(String(settlement.status));

  async function refresh() {
    if (onRefresh) await onRefresh();
  }

  async function handleCalculate() {
    try {
      setBusy("calculate");
      setError(null);
      setMessage(null);

      await jsonFetch<{ ok: boolean; settlementId: string }>(`/api/admin/store-settlements/${orderId}/calculate`, {
        method: "POST",
        body: JSON.stringify({ mode: strictMode ? "strict" : "soft" }),
      });

      setMessage("Le règlement store a été calculé.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de calculer le règlement store.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePay() {
    if (!settlement.id) return;

    try {
      setBusy("pay");
      setError(null);
      setMessage(null);

      await jsonFetch(`/api/admin/store-settlements/${settlement.id}/pay`, {
        method: "POST",
        body: JSON.stringify({ method: selectedMethod, note }),
      });

      setMessage("Le paiement store a été initié.");
      setPayModalOpen(false);
      setNote("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d’initier le paiement store.");
    } finally {
      setBusy(null);
    }
  }

  async function handleConfirm() {
    if (!settlement.id) return;

    try {
      setBusy("confirm");
      setError(null);
      setMessage(null);

      await jsonFetch(`/api/admin/store-settlements/${settlement.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ note: "Confirmation manuelle du règlement" }),
      });

      setMessage("Le règlement store a été confirmé.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de confirmer le règlement store.");
    } finally {
      setBusy(null);
    }
  }

  async function handleFail() {
    if (!settlement.id || !failReason.trim()) return;

    try {
      setBusy("fail");
      setError(null);
      setMessage(null);

      await jsonFetch(`/api/admin/store-settlements/${settlement.id}/fail`, {
        method: "POST",
        body: JSON.stringify({ reason: failReason.trim() }),
      });

      setMessage("Le règlement store a été marqué en échec.");
      setFailReason("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de marquer le règlement store en échec.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Paiement Store</h2>
          <p className="mt-1 text-sm text-slate-500">
            Commande <span className="font-medium text-slate-700">{orderNumber}</span> · {storeName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={settlementLabel(settlement.status)} tone={settlementTone(settlement.status)} />
          <StatusBadge
            label={gateLabel(settlement.gateStatus, strictMode)}
            tone={strictMode ? (settlement.gateStatus === "store_settlement_confirmed" ? "green" : "amber") : settlement.gateStatus ? "blue" : "gray"}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Montant brut" value={formatCurrency(settlement.grossSalesAmount)} />
        <StatCard label="Commission plateforme" value={formatCurrency(settlement.platformFeeAmount)} />
        <StatCard label="Ajustements" value={formatCurrency(settlement.adjustmentAmount)} />
        <StatCard label="Net à payer" value={formatCurrency(settlement.netStoreAmount)} highlight />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Méthode préférée" value={paymentProfile?.preferred_settlement_method ?? settlement.method ?? "—"} />
        <DetailItem label="Envoyé le" value={formatDate(settlement.sentAt)} />
        <DetailItem label="Confirmé le" value={formatDate(settlement.confirmedAt)} />
        <DetailItem label="Référence" value={settlement.providerReference ?? "—"} />
      </div>

      {paymentProfile ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-900">Profil de règlement store</div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div>
              <span className="text-slate-500">Interac :</span>{" "}
              {paymentProfile.interac_email ?? "—"}
            </div>
            <div>
              <span className="text-slate-500">Autodeposit :</span>{" "}
              {paymentProfile.autodeposit_enabled ? "Oui" : "Non"}
            </div>
            <div>
              <span className="text-slate-500">Stripe Connect :</span>{" "}
              {paymentProfile.stripe_connected_account_id ?? "Non configuré"}
            </div>
            <div>
              <span className="text-slate-500">Question sécurité :</span>{" "}
              {paymentProfile.security_question_required ? paymentProfile.security_question_text || "Requise" : "Non"}
            </div>
          </div>
        </div>
      ) : null}

      {settlement.failureReason ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span className="font-medium">Raison de l’échec :</span> {settlement.failureReason}
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!canCalculate || busy !== null}
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "calculate" ? "Calcul..." : "Calculer le paiement"}
        </button>

        <button
          type="button"
          onClick={() => setPayModalOpen(true)}
          disabled={!canPay || busy !== null}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Effectuer le paiement au store
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm || busy !== null}
          className="rounded-2xl border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "confirm" ? "Confirmation..." : "Confirmer le paiement"}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Marquer en échec
          </label>
          <input
            value={failReason}
            onChange={(e) => setFailReason(e.target.value)}
            placeholder="Ex: Interac rejeté, compte store invalide..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={handleFail}
          disabled={!canFail || !failReason.trim() || busy !== null}
          className="rounded-2xl border border-rose-300 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "fail" ? "Traitement..." : "Marquer en échec"}
        </button>
      </div>

      {payModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Effectuer le paiement au store</h3>
                <p className="mt-1 text-sm text-slate-500">Choisis la méthode de règlement et confirme l’envoi.</p>
              </div>
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Fermer
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-900">Montant à payer</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(settlement.netStoreAmount)}</div>
                <div className="mt-3 text-xs text-slate-500">Commande {orderNumber}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-900">Méthode</div>
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="settlementMethod"
                      checked={selectedMethod === "stripe_connect"}
                      onChange={() => setSelectedMethod("stripe_connect")}
                    />
                    Stripe Connect
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="settlementMethod"
                      checked={selectedMethod === "interac_transfer"}
                      onChange={() => setSelectedMethod("interac_transfer")}
                    />
                    Interac e-Transfer
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="settlementMethod"
                      checked={selectedMethod === "manual_bank_transfer"}
                      onChange={() => setSelectedMethod("manual_bank_transfer")}
                    />
                    Virement manuel
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {selectedMethod === "stripe_connect" ? (
                <>
                  <div className="font-medium text-slate-900">Détails Stripe Connect</div>
                  <div className="mt-2">Compte connecté : {paymentProfile?.stripe_connected_account_id ?? "Non configuré"}</div>
                  <div>Payouts activés : {paymentProfile?.stripe_payouts_enabled ? "Oui" : "Non"}</div>
                </>
              ) : selectedMethod === "interac_transfer" ? (
                <>
                  <div className="font-medium text-slate-900">Détails Interac</div>
                  <div className="mt-2">Bénéficiaire : {paymentProfile?.interac_recipient_name ?? "—"}</div>
                  <div>Email Interac : {paymentProfile?.interac_email ?? "—"}</div>
                  <div>Autodeposit : {paymentProfile?.autodeposit_enabled ? "Oui" : "Non"}</div>
                  <div>
                    Question sécurité : {paymentProfile?.security_question_required ? paymentProfile.security_question_text || "Requise" : "Non"}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium text-slate-900">Virement manuel</div>
                  <div className="mt-2">Utiliser ce mode si le store n’a ni Stripe Connect ni Interac disponible.</div>
                </>
              )}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Note admin
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Ex: Paiement initié depuis le dashboard admin..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={busy !== null}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {busy === "pay" ? "Envoi..." : "Envoyer le paiement"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", highlight ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50") }>
      <div className={cn("text-xs font-medium uppercase tracking-wide", highlight ? "text-slate-300" : "text-slate-500")}>{label}</div>
      <div className={cn("mt-2 text-xl font-semibold", highlight ? "text-white" : "text-slate-900")}>{value}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
