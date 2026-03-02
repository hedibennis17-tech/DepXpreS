'use client';

import { Store, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';

interface DriverOrderSettlementInfoProps {
  settlementStatus?: string;
  storeName?: string;
  canPickup?: boolean;
}

export default function DriverOrderSettlementInfo({
  settlementStatus,
  storeName,
  canPickup,
}: DriverOrderSettlementInfoProps) {
  // Le chauffeur doit savoir si le store est prêt à préparer la commande
  if (!settlementStatus) return null;

  const isConfirmed = settlementStatus === 'confirmed';
  const isFailed = settlementStatus === 'failed';
  const isPending = !isConfirmed && !isFailed;

  if (isConfirmed) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-700">Store payé — Commande en préparation</p>
          <p className="text-xs text-green-600 mt-0.5">
            {storeName || 'Le store'} a reçu son paiement. La commande est en cours de préparation.
          </p>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">Problème de paiement store</p>
          <p className="text-xs text-red-600 mt-0.5">
            Le paiement à {storeName || 'ce store'} a échoué. Contactez le dispatcher avant de vous déplacer.
          </p>
        </div>
      </div>
    );
  }

  if (isPending && !canPickup) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700">En attente — Ne pas se déplacer</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Le paiement à {storeName || 'ce store'} est en cours. Attendez la confirmation avant de vous déplacer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-blue-700">Paiement store en cours</p>
        <p className="text-xs text-blue-600 mt-0.5">
          Le paiement à {storeName || 'ce store'} est en traitement.
        </p>
      </div>
    </div>
  );
}
