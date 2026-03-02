'use client';

import { DollarSign, Clock, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';

interface SettlementStatusBadgeProps {
  status: string;
  netAmount?: number;
  compact?: boolean;
}

const STATUS_MAP: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  description: string;
}> = {
  pending: {
    label: 'Paiement en attente',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: <Clock className="w-3.5 h-3.5" />,
    description: 'Le paiement au store n\'a pas encore été calculé.',
  },
  calculated: {
    label: 'Prêt à payer',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <DollarSign className="w-3.5 h-3.5" />,
    description: 'Le montant est calculé. En attente d\'envoi.',
  },
  payment_initiated: {
    label: 'Paiement initié',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: <Send className="w-3.5 h-3.5" />,
    description: 'Le paiement est en cours de traitement.',
  },
  sent: {
    label: 'Paiement envoyé',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: <Send className="w-3.5 h-3.5" />,
    description: 'Le paiement a été envoyé au store.',
  },
  awaiting_acceptance: {
    label: 'En attente d\'acceptation',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <Clock className="w-3.5 h-3.5" />,
    description: 'Le store doit accepter le paiement.',
  },
  confirmed: {
    label: 'Paiement confirmé',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    description: 'Le store a confirmé la réception du paiement.',
  },
  failed: {
    label: 'Paiement échoué',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
    description: 'Le paiement a échoué. Action requise.',
  },
  cancelled: {
    label: 'Annulé',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
    description: 'Le settlement a été annulé.',
  },
};

export default function SettlementStatusBadge({ status, netAmount, compact = false }: SettlementStatusBadgeProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
        {config.icon}
        {config.label}
      </span>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border}`}>
      <div className={`mt-0.5 ${config.color}`}>
        {status === 'failed' ? <AlertTriangle className="w-4 h-4" /> : config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          {netAmount !== undefined && (
            <span className={`text-sm font-bold ${config.color}`}>{netAmount.toFixed(2)} $</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
      </div>
    </div>
  );
}
