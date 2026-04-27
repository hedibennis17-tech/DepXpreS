'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  DollarSign, Send, CheckCircle, XCircle, Clock,
  RefreshCw, AlertTriangle, CreditCard, TrendingUp
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  method: string;
  note?: string;
  status: string;
  created_at: any;
  reference?: string;
}

const METHOD_LABELS: Record<string, string> = {
  interac_transfer: 'Virement Interac',
  stripe_connect: 'Stripe Connect',
  manual_bank_transfer: 'Virement bancaire manuel',
  e_transfer: 'E-Transfer',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: <Clock className="w-3.5 h-3.5" /> },
  sent: { label: 'Envoyé', color: 'text-blue-700', bg: 'bg-blue-100', icon: <Send className="w-3.5 h-3.5" /> },
  confirmed: { label: 'Confirmé', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  failed: { label: 'Échoué', color: 'text-red-700', bg: 'bg-red-100', icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function StorePaymentTab({ storeId, storeName }: { storeId: string; storeName?: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('interac_transfer');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'store_payments'),
        where('store_id', '==', storeId),
        orderBy('created_at', 'desc')
      );
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
    } catch {
      // collection vide ou pas encore créée
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, [storeId]);

  const totalPaid = payments.filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => ['pending', 'sent'].includes(p.status)).reduce((s, p) => s + p.amount, 0);

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError('Entrez un montant valide.'); return; }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await addDoc(collection(db, 'store_payments'), {
        store_id: storeId,
        store_name: storeName || storeId,
        amount: parseFloat(amount),
        method,
        note: note || null,
        reference: reference || null,
        status: 'sent',
        created_at: serverTimestamp(),
      });
      setSuccess(`Paiement de ${parseFloat(amount).toFixed(2)} $ enregistré avec succès.`);
      setAmount('');
      setNote('');
      setReference('');
      await loadPayments();
    } catch (e: any) {
      setError('Erreur lors de l\'enregistrement. Réessayez.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-700">Total payé</p>
          </div>
          <p className="text-2xl font-bold text-green-800">{totalPaid.toFixed(2)} $</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-yellow-700">En attente</p>
          </div>
          <p className="text-2xl font-bold text-yellow-800">{totalPending.toFixed(2)} $</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
            <Send className="w-4 h-4 text-orange-600" />
          </div>
          <p className="font-semibold text-gray-900">Envoyer un paiement au store</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {success}
          </div>
        )}

        {/* Montant */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Montant ($) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); setSuccess(''); }}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        {/* Méthode */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Méthode de paiement</label>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-orange-400 transition-colors bg-white"
          >
            <option value="interac_transfer">Virement Interac</option>
            <option value="e_transfer">E-Transfer</option>
            <option value="stripe_connect">Stripe Connect</option>
            <option value="manual_bank_transfer">Virement bancaire manuel</option>
          </select>
        </div>

        {/* Référence */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Référence (optionnel)</label>
          <input
            type="text"
            placeholder="Ex: INTERAC-123456"
            value={reference}
            onChange={e => setReference(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Note / Référence</label>
          <textarea
            rows={2}
            placeholder="Ex: Paiement semaine du 14 avril"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !amount}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer le paiement</>}
        </button>
      </div>

      {/* Historique */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900 text-sm">Historique des paiements</p>
          <button onClick={loadPayments} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map(p => {
              const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              return (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{p.amount.toFixed(2)} $</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                        {st.icon}{st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {METHOD_LABELS[p.method] || p.method}
                      {p.note && ` · ${p.note}`}
                    </p>
                    {p.created_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.created_at.toDate?.()?.toLocaleDateString('fr-CA') || ''}
                      </p>
                    )}
                  </div>
                  {p.reference && (
                    <span className="text-xs text-gray-400 font-mono shrink-0">{p.reference}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
