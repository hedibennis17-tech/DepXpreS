'use client';

import { Store, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface OrderSettlementStatusProps {
  settlementStatus?: string;
  storeName?: string;
}

export default function OrderSettlementStatus({ settlementStatus, storeName }: OrderSettlementStatusProps) {
  // Côté client : on montre seulement si la commande est "bloquée" ou "en préparation"
  if (!settlementStatus || settlementStatus === 'confirmed') {
    return null; // Pas d'info à afficher si tout est OK
  }

  const isBlocked = ['pending', 'calculated', 'payment_initiated', 'sent', 'awaiting_acceptance'].includes(settlementStatus);
  const isFailed = settlementStatus === 'failed';

  if (isFailed) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">Problème de paiement</p>
          <p className="text-xs text-red-600 mt-0.5">
            Un problème est survenu avec le paiement de {storeName || 'votre store'}. Notre équipe s&apos;en occupe.
          </p>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700">Préparation en attente</p>
          <p className="text-xs text-amber-600 mt-0.5">
            {storeName || 'Le store'} commencera la préparation dès la confirmation du paiement.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// Composant pour afficher dans le suivi de commande
export function OrderPaymentStoreStep({ settlementStatus }: { settlementStatus?: string }) {
  const isConfirmed = settlementStatus === 'confirmed';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      isConfirmed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isConfirmed ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        {isConfirmed
          ? <CheckCircle className="w-4 h-4 text-green-600" />
          : <Store className="w-4 h-4 text-gray-400" />
        }
      </div>
      <div>
        <p className={`text-sm font-medium ${isConfirmed ? 'text-green-700' : 'text-gray-500'}`}>
          {isConfirmed ? 'Store payé' : 'Paiement store'}
        </p>
        <p className="text-xs text-gray-400">
          {isConfirmed ? 'Le store a reçu son paiement' : 'En attente de confirmation'}
        </p>
      </div>
    </div>
  );
}
