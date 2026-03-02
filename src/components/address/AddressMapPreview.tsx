"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AddressValue } from "./AddressAutocompleteInput";

interface AddressMapPreviewProps {
  address: AddressValue | null;
  className?: string;
  height?: string;
}

/**
 * Affiche une prévisualisation de l'adresse sélectionnée
 * Utilise Google Maps Static API si les coordonnées sont disponibles
 */
export function AddressMapPreview({
  address,
  className,
  height = "h-40",
}: AddressMapPreviewProps) {
  if (!address) return null;

  const hasCoords = address.latitude && address.longitude;
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const staticMapUrl = hasCoords && googleMapsKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${address.latitude},${address.longitude}&zoom=15&size=600x200&scale=2&markers=color:orange%7C${address.latitude},${address.longitude}&key=${googleMapsKey}`
    : null;

  return (
    <div className={cn("rounded-lg overflow-hidden border border-gray-200", className)}>
      {staticMapUrl ? (
        <div className={cn("relative", height)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={staticMapUrl}
            alt={`Carte: ${address.fullLabel || address.line1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-xs font-medium truncate">
              <MapPin className="h-3 w-3 inline mr-1" />
              {address.fullLabel || address.line1}
            </p>
          </div>
        </div>
      ) : (
        <div className={cn("flex items-center gap-3 p-3 bg-orange-50", height)}>
          <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {address.line1 || address.fullLabel}
            </p>
            <p className="text-xs text-gray-500">
              {[address.city, address.provinceCode, address.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            {hasCoords && (
              <p className="text-xs font-mono text-gray-400 mt-0.5">
                {address.latitude?.toFixed(5)}, {address.longitude?.toFixed(5)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressMapPreview;
