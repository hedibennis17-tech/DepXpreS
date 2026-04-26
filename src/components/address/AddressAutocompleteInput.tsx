"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressItem {
  addressId: string;
  label: string;
  line1: string;
  city: string;
  provinceCode: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  supplier?: string;
  matchScore?: number;
}

export interface AddressValue {
  addressId?: string;
  line1: string;
  city: string;
  provinceCode: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  fullLabel?: string;
}

interface AddressAutocompleteInputProps {
  value?: AddressValue;
  onChange?: (address: AddressValue | null) => void;
  placeholder?: string;
  province?: string;
  city?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showCurrentLocationButton?: boolean;
  error?: string;
  name?: string;
}

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function AddressAutocompleteInput({
  value,
  onChange,
  placeholder = "Entrez votre adresse...",
  province = "QC",
  city,
  label,
  required = false,
  disabled = false,
  className,
  showCurrentLocationButton = true,
  error,
  name,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value?.fullLabel || value?.line1 || "");
  const [suggestions, setSuggestions] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync avec la valeur externe
  useEffect(() => {
    if (value?.fullLabel) {
      setInputValue(value.fullLabel);
    } else if (value?.line1) {
      setInputValue(value.line1);
    }
  }, [value]);

  // Fermer sur clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q, province, limit: "8", grand_montreal: "true" });
        if (city) params.set("city", city);

        const res = await fetch(`/api/address/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setSuggestions(data.items || []);
        setIsOpen((data.items || []).length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [province, city]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val) {
      onChange?.(null);
      setSuggestions([]);
      setIsOpen(false);
    } else {
      fetchSuggestions(val);
    }
  };

  const handleSelect = (item: AddressItem) => {
    const fullLabel = item.label;
    setInputValue(fullLabel);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onChange?.({
      addressId: item.addressId,
      line1: item.line1,
      city: item.city,
      provinceCode: item.provinceCode,
      postalCode: item.postalCode,
      latitude: item.latitude,
      longitude: item.longitude,
      fullLabel,
    });
  };

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    onChange?.(null);
    inputRef.current?.focus();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/address/reverse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              province,
            }),
          });
          const data = await res.json();
          if (data.item) {
            handleSelect(data.item);
          }
        } catch {
          // Fallback: utiliser les coordonnées brutes
          const fallback: AddressValue = {
            line1: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
            city: "",
            provinceCode: province,
            postalCode: "",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            fullLabel: `Ma position actuelle`,
          };
          setInputValue(fallback.fullLabel || "");
          onChange?.(fallback);
        } finally {
          setIsGeolocating(false);
        }
      },
      () => setIsGeolocating(false),
      { timeout: 8000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />

        <input
          ref={inputRef}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "w-full pl-9 pr-20 py-2.5 text-sm border rounded-lg bg-white",
            "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
            "placeholder:text-gray-400 transition-colors",
            error ? "border-red-400" : "border-gray-300",
            disabled && "bg-gray-50 cursor-not-allowed opacity-60"
          )}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          )}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {showCurrentLocationButton && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGeolocating || disabled}
              className={cn(
                "p-1 rounded text-gray-400 hover:text-orange-500 transition-colors",
                isGeolocating && "animate-pulse"
              )}
              title="Utiliser ma position actuelle"
              tabIndex={-1}
            >
              <Navigation className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Liste de suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((item, index) => (
            <button
              key={item.addressId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm hover:bg-orange-50 transition-colors",
                "border-b border-gray-100 last:border-0",
                activeIndex === index && "bg-orange-50"
              )}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.line1 || item.label}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.city}
                    {item.city && item.postalCode ? ", " : ""}
                    {item.postalCode}
                    {(item.city || item.postalCode) ? " — " : ""}
                    {item.provinceCode}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* Option saisie manuelle */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
                // Garder la valeur saisie comme adresse manuelle
                onChange?.({
                  line1: inputValue,
                  city: "",
                  provinceCode: province,
                  postalCode: "",
                  fullLabel: inputValue,
                });
              }}
              className="text-xs text-gray-500 hover:text-orange-500 transition-colors"
            >
              Utiliser « {inputValue.slice(0, 40)}{inputValue.length > 40 ? "..." : ""} » comme adresse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressAutocompleteInput;
