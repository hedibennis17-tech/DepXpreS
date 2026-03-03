'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Calculator,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { StoreSettlement, StorePayoutTransaction } from '@/lib/store-settlement/types';

interface StoreSettlementBlockProps {
  orderId: string;
  storeId: string;
  storeName?: string;
  adminToken: string;
  onSettlementChange?: () => void;
}

type ModalType = 'calculate' | 'pay' | 'confirm' | 'fail' | null;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock className="w-4 h-4" /> },
  calculated: { label: 'Calculé', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Calculator className="w-4 h-4" /> },
  payment_initiated: { label: 'Paiement initié', color: 'text-orange-600', bg: 'bg-orange-100', icon: <Send className="w-4 h-4" /> },
  sent: { label: 'Envoyé', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Send className="w-4 h-4" /> },
  awaiting_acceptance: { label: 'En attente d\'acceptation', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: 'Confirmé', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
  failed: { label: 'Échoué', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: 'Annulé', color: 'text-gray-500', bg: 'bg-gray-100', icon: <XCircle className="w-4 h-4" /> },
};

const METHOD_LABELS: Record<string, string> = {
  stripe_connect: 'Stripe Connect',
  interac_transfer: 'Virement Interac',
  manual_bank_transfer: 'Virement bancaire manuel',
};

export default function StoreSettlementBlock({
  orderId,
  storeId,
  storeName,
  adminToken,
  onSettlementChange,
}: StoreSettlementBlockProps) {
  const [settlement, setSettlement] = useState<StoreSettlement | null>(null);
  const [payoutTxs, setPayoutTxs] = useState<StorePayoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [payMethod, setPayMethod] = useState<string>('interac_transfer');
  const [payNote, setPayNote] = useState('');
  const [confirmRef, setConfirmRef] = useState('');
  const [failReason, setFailReason] = useState('');

  const loadSettlement = async () => {
    try {
      setLoading(true);
      // Chercher le settlement existant pour cette commande
      const res = await fetch(`/api/admin/store-settlements/by-order/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.settlement) {
          setSettlement(data.settlement);
          setPayoutTxs(data.payoutTransactions || []);
        }
      }
    } catch {
      // Pas de settlement existant
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlement();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCalculate = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/store-settlements/by-order/${orderId}/calculate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess('Settlement calculé avec succès.');
      setActiveModal(null);
      await loadSettlement();
      onSettlementChange?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    if (!settlement) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/store-settlements/${settlement.id}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method: payMethod, note: payNote }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess('Paiement initié avec succès.');
      setActiveModal(null);
      await loadSettlement();
      onSettlementChange?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!settlement) return;
    const latestTx = payoutTxs[0];
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/store-settlements/${settlement.id}/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payoutTransactionId: latestTx?.id || '',
          providerReference: confirmRef,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess('Paiement confirmé. La commande peut maintenant être préparée.');
      setActiveModal(null);
      await loadSettlement();
      onSettlementChange?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFail = async () => {
    if (!settlement || !failReason) return;
    const latestTx = payoutTxs[0];
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/store-settlements/${settlement.id}/fail`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payoutTransactionId: latestTx?.id || '',
          reason: failReason,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess('Paiement marqué comme échoué.');
      setActiveModal(null);
      await loadSettlement();
      onSettlementChange?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = settlement ? (STATUS_CONFIG[settlement.status] || STATUS_CONFIG.pending) : null;

  const canCalculate = !settlement || ['pending', 'failed'].includes(settlement.status);
  const canPay = settlement && ['calculated', 'failed'].includes(settlement.status);
  const canConfirm = settlement && ['sent', 'awaiting_acceptance', 'payment_initiated'].includes(settlement.status);
  const canFail = settlement && ['sent', 'awaiting_acceptance', 'payment_initiated'].includes(settlement.status);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Paiement Store</p>
            <p className="text-xs text-gray-500">{storeName || storeId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {settlement && statusConfig && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          )}
          {!settlement && !loading && (
            <span className="text-xs text-gray-400">Non calculé</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Messages */}
              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Détails du settlement */}
              {settlement && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Ventes brutes</p>
                      <p className="font-semibold text-gray-900">{settlement.gross_sales_amount.toFixed(2)} $</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Commission plateforme</p>
                      <p className="font-semibold text-red-600">- {settlement.platform_fee_amount.toFixed(2)} $</p>
                    </div>
                    {settlement.promo_store_share_amount > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Part promo store</p>
                        <p className="font-semibold text-orange-600">- {settlement.promo_store_share_amount.toFixed(2)} $</p>
                      </div>
                    )}
                    {settlement.adjustment_amount !== 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Ajustement</p>
                        <p className={`font-semibold ${settlement.adjustment_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {settlement.adjustment_amount >= 0 ? '+' : ''}{settlement.adjustment_amount.toFixed(2)} $
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Net store */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-800">Net à payer au store</p>
                    <p className="text-xl font-bold text-emerald-700">{settlement.net_store_amount.toFixed(2)} $</p>
                  </div>

                  {/* Méthode et dates */}
                  {settlement.method && (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Méthode :</span>
                      <span className="font-medium text-gray-700">{METHOD_LABELS[settlement.method] || settlement.method}</span>
                    </div>
                  )}
                  {settlement.confirmed_at && (
                    <div className="text-xs text-gray-500">
                      Confirmé le : {new Date(settlement.confirmed_at).toLocaleString('fr-CA')}
                    </div>
                  )}
                </div>
              )}

              {/* Transactions de paiement */}
              {payoutTxs.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Transactions de paiement</p>
                  <div className="space-y-2">
                    {payoutTxs.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-600">{METHOD_LABELS[tx.method] || tx.method}</span>
                        <span className="font-medium">{tx.amount.toFixed(2)} $</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {canCalculate && (
                  <button
                    onClick={() => setActiveModal('calculate')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    {settlement ? 'Recalculer' : 'Calculer'}
                  </button>
                )}
                {canPay && (
                  <button
                    onClick={() => setActiveModal('pay')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Payer le store
                  </button>
                )}
                {canConfirm && (
                  <button
                    onClick={() => setActiveModal('confirm')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirmer réception
                  </button>
                )}
                {canFail && (
                  <button
                    onClick={() => setActiveModal('fail')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Marquer échoué
                  </button>
                )}
                <button
                  onClick={loadSettlement}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Modal Calculate */}
      {activeModal === 'calculate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Calculer le settlement</h3>
            <p className="text-sm text-gray-600 mb-6">
              Le système va calculer automatiquement le montant net à payer au store en déduisant la commission plateforme (10%).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCalculate}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Calcul...' : 'Calculer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pay */}
      {activeModal === 'pay' && settlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payer le store</h3>
            <div className="bg-emerald-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-emerald-700">Montant à payer</p>
              <p className="text-2xl font-bold text-emerald-800">{settlement.net_store_amount.toFixed(2)} $</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="interac_transfer">Virement Interac</option>
                  <option value="stripe_connect">Stripe Connect</option>
                  <option value="manual_bank_transfer">Virement bancaire manuel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
                <textarea
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Note interne..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePay}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Envoi...' : 'Envoyer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm */}
      {activeModal === 'confirm' && settlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la réception</h3>
            <p className="text-sm text-gray-600 mb-4">
              Confirmez que le store a bien reçu le paiement de <strong>{settlement.net_store_amount.toFixed(2)} $</strong>.
              Cela débloquera la préparation de la commande.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence de confirmation (optionnel)</label>
              <input
                type="text"
                value={confirmRef}
                onChange={(e) => setConfirmRef(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: INTERAC-123456"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Confirmation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fail */}
      {activeModal === 'fail' && settlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Marquer comme échoué</h3>
            <p className="text-sm text-gray-600 mb-4">
              Indiquez la raison de l&apos;échec du paiement. La commande restera bloquée.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison de l&apos;échec *</label>
              <textarea
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Compte Interac invalide, fonds insuffisants..."
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleFail}
                disabled={actionLoading || !failReason.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Enregistrement...' : 'Confirmer l\'échec'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
