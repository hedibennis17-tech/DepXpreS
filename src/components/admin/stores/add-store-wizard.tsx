"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Store, Clock, MapPin, Phone, Mail, User, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, AlertCircle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Zone { id: string; name: string; }

interface StoreHour {
  day: number;
  label: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface WizardData {
  // Étape 1 — Informations
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  zoneId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: string;
  // Étape 2 — Horaires
  hours: StoreHour[];
  // Étape 3 — Paramètres
  minOrderAmount: string;
  deliveryFee: string;
  preparationTime: string;
  maxDeliveryRadius: string;
  acceptsOnlinePayment: boolean;
  acceptsCash: boolean;
}

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const DEFAULT_HOURS: StoreHour[] = DAY_LABELS.map((label, day) => ({
  day,
  label,
  open: "08:00",
  close: "23:00",
  isClosed: day === 0, // Dimanche fermé par défaut
}));

const STEPS = [
  { id: 1, label: "Informations", icon: Store },
  { id: 2, label: "Horaires", icon: Clock },
  { id: 3, label: "Paramètres", icon: MapPin },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
];

// ─── Composant principal ──────────────────────────────────────────────────────

interface AddStoreWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (storeId: string) => void;
}

export function AddStoreWizard({ open, onClose, onSuccess }: AddStoreWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [zones, setZones] = useState<Zone[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<WizardData>({
    name: "",
    address: "",
    city: "Montréal",
    postalCode: "",
    phone: "",
    email: "",
    zoneId: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    status: "active",
    hours: DEFAULT_HOURS,
    minOrderAmount: "10",
    deliveryFee: "3.99",
    preparationTime: "15",
    maxDeliveryRadius: "5",
    acceptsOnlinePayment: true,
    acceptsCash: true,
  });

  // Charger les zones
  useEffect(() => {
    if (!open) return;
    getDocs(query(collection(db, "zones"), orderBy("nameFr"))).then(snap => {
      setZones(snap.docs.map(d => ({
        id: d.id,
        name: d.data().nameFr || d.data().nameEn || d.data().name || d.id,
      })));
    }).catch(() => {
      // Fallback silencieux
    });
  }, [open]);

  const set = (field: keyof WizardData, value: unknown) =>
    setData(prev => ({ ...prev, [field]: value }));

  const updateHour = (day: number, field: keyof StoreHour, value: unknown) => {
    setData(prev => ({
      ...prev,
      hours: prev.hours.map(h => h.day === day ? { ...h, [field]: value } : h),
    }));
  };

  // Validation par étape
  const canProceed = () => {
    if (step === 1) return data.name.trim().length >= 2 && data.address.trim().length >= 5 && data.phone.trim().length >= 10;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step < 4) setStep(s => s + 1);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          address: `${data.address.trim()}, ${data.city.trim()} ${data.postalCode.trim()}`.trim(),
          phone: data.phone.trim(),
          email: data.email.trim() || undefined,
          zoneId: data.zoneId || undefined,
          ownerName: data.ownerName.trim() || undefined,
          ownerEmail: data.ownerEmail.trim() || undefined,
          ownerPhone: data.ownerPhone.trim() || undefined,
          status: data.status,
          hours: data.hours,
          minOrderAmount: parseFloat(data.minOrderAmount) || 10,
          deliveryFee: parseFloat(data.deliveryFee) || 3.99,
          preparationTime: parseInt(data.preparationTime) || 15,
          maxDeliveryRadius: parseFloat(data.maxDeliveryRadius) || 5,
          acceptsOnlinePayment: data.acceptsOnlinePayment,
          acceptsCash: data.acceptsCash,
          isOpen: true,
          rating: 5.0,
          totalOrders: 0,
          totalRevenue: 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      onSuccess(json.storeId);
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setError("");
    setData({
      name: "", address: "", city: "Montréal", postalCode: "", phone: "", email: "",
      zoneId: "", ownerName: "", ownerEmail: "", ownerPhone: "", status: "active",
      hours: DEFAULT_HOURS, minOrderAmount: "10", deliveryFee: "3.99",
      preparationTime: "15", maxDeliveryRadius: "5",
      acceptsOnlinePayment: true, acceptsCash: true,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ajouter un dépanneur partenaire</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                    isDone ? "bg-green-500 border-green-500 text-white" :
                    isActive ? "bg-orange-500 border-orange-500 text-white" :
                    "bg-gray-100 border-gray-200 text-gray-400"
                  )}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn("text-xs font-medium", isActive ? "text-orange-600" : isDone ? "text-green-600" : "text-gray-400")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 flex-1 mx-1 mb-4 transition-all", isDone ? "bg-green-400" : "bg-gray-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Contenu par étape */}
        <div className="space-y-4 min-h-[320px]">
          {step === 1 && <Step1 data={data} set={set} zones={zones} />}
          {step === 2 && <Step2 data={data} updateHour={updateHour} />}
          {step === 3 && <Step3 data={data} set={set} />}
          {step === 4 && <Step4 data={data} zones={zones} />}
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || saving}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-orange-500 hover:bg-orange-600 text-white">
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white min-w-32">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création...</> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Créer le dépanneur</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Étape 1 : Informations ───────────────────────────────────────────────────

function Step1({ data, set, zones }: { data: WizardData; set: (f: keyof WizardData, v: unknown) => void; zones: Zone[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <Store className="h-4 w-4 text-orange-500" /> Informations du dépanneur
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Nom du dépanneur <span className="text-red-500">*</span></Label>
            <Input id="name" placeholder="Ex: Dépanneur Centre-Ville 24h" value={data.name} onChange={e => set("name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm font-medium">Adresse <span className="text-red-500">*</span></Label>
            <Input id="address" placeholder="Ex: 789 Rue Ste-Catherine O." value={data.address} onChange={e => set("address", e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
              <Input id="city" placeholder="Montréal" value={data.city} onChange={e => set("city", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
              <Input id="postalCode" placeholder="H3B 1A1" value={data.postalCode} onChange={e => set("postalCode", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Téléphone <span className="text-red-500">*</span></Label>
              <Input id="phone" placeholder="514-555-0000" value={data.phone} onChange={e => set("phone", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Courriel</Label>
              <Input id="email" type="email" placeholder="depot@exemple.com" value={data.email} onChange={e => set("email", e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Zone de livraison</Label>
              <Select value={data.zoneId} onValueChange={v => set("zoneId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner une zone" /></SelectTrigger>
                <SelectContent>
                  {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Statut initial</Label>
              <Select value={data.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" /> Propriétaire / Contact
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="ownerName" className="text-sm font-medium">Nom du propriétaire</Label>
            <Input id="ownerName" placeholder="Jean Tremblay" value={data.ownerName} onChange={e => set("ownerName", e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ownerEmail" className="text-sm font-medium">Courriel propriétaire</Label>
              <Input id="ownerEmail" type="email" placeholder="jean@exemple.com" value={data.ownerEmail} onChange={e => set("ownerEmail", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ownerPhone" className="text-sm font-medium">Téléphone propriétaire</Label>
              <Input id="ownerPhone" placeholder="514-555-0001" value={data.ownerPhone} onChange={e => set("ownerPhone", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Étape 2 : Horaires ───────────────────────────────────────────────────────

function Step2({ data, updateHour }: { data: WizardData; updateHour: (day: number, field: keyof StoreHour, value: unknown) => void }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-500" /> Horaires d&apos;ouverture
      </h3>
      <div className="space-y-2">
        {data.hours.map(h => (
          <div key={h.day} className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
            h.isClosed ? "bg-gray-50 opacity-60" : "bg-white"
          )}>
            <div className="w-24 text-sm font-medium">{h.label}</div>
            <Switch
              checked={!h.isClosed}
              onCheckedChange={v => updateHour(h.day, "isClosed", !v)}
            />
            <span className="text-xs text-muted-foreground w-12">{h.isClosed ? "Fermé" : "Ouvert"}</span>
            {!h.isClosed && (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={h.open}
                    onChange={e => updateHour(h.day, "open", e.target.value)}
                    className="h-8 text-sm w-28"
                  />
                  <span className="text-muted-foreground text-sm">à</span>
                  <Input
                    type="time"
                    value={h.close}
                    onChange={e => updateHour(h.day, "close", e.target.value)}
                    className="h-8 text-sm w-28"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => data.hours.forEach(h => updateHour(h.day, "isClosed", false))}
          className="text-xs"
        >
          Ouvrir tous les jours
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            data.hours.forEach(h => {
              updateHour(h.day, "open", "08:00");
              updateHour(h.day, "close", "23:00");
            });
          }}
          className="text-xs"
        >
          8h–23h partout
        </Button>
      </div>
    </div>
  );
}

// ─── Étape 3 : Paramètres ─────────────────────────────────────────────────────

function Step3({ data, set }: { data: WizardData; set: (f: keyof WizardData, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-orange-500" /> Paramètres de livraison
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Commande minimum ($)</Label>
          <Input
            type="number" min="0" step="0.50"
            value={data.minOrderAmount}
            onChange={e => set("minOrderAmount", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Frais de livraison ($)</Label>
          <Input
            type="number" min="0" step="0.25"
            value={data.deliveryFee}
            onChange={e => set("deliveryFee", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Temps de préparation (min)</Label>
          <Input
            type="number" min="5" max="120"
            value={data.preparationTime}
            onChange={e => set("preparationTime", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Rayon max de livraison (km)</Label>
          <Input
            type="number" min="1" max="50"
            value={data.maxDeliveryRadius}
            onChange={e => set("maxDeliveryRadius", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-base mb-3">Modes de paiement acceptés</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Paiement en ligne</p>
              <p className="text-xs text-muted-foreground">Carte de crédit, débit, Apple Pay</p>
            </div>
            <Switch
              checked={data.acceptsOnlinePayment}
              onCheckedChange={v => set("acceptsOnlinePayment", v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Paiement comptant</p>
              <p className="text-xs text-muted-foreground">Argent comptant à la livraison</p>
            </div>
            <Switch
              checked={data.acceptsCash}
              onCheckedChange={v => set("acceptsCash", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Étape 4 : Confirmation ───────────────────────────────────────────────────

function Step4({ data, zones }: { data: WizardData; zones: Zone[] }) {
  const zone = zones.find(z => z.id === data.zoneId);
  const openDays = data.hours.filter(h => !h.isClosed);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" /> Récapitulatif — Vérifiez avant de créer
      </h3>

      <div className="rounded-xl border bg-orange-50 p-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Store className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-lg">{data.name || "—"}</span>
          <Badge className={cn("text-xs border-0 ml-auto", data.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
            {data.status === "active" ? "Actif" : data.status === "pending" ? "En attente" : "Inactif"}
          </Badge>
        </div>
        <Row label="Adresse" value={`${data.address}, ${data.city} ${data.postalCode}`} />
        <Row label="Téléphone" value={data.phone} />
        {data.email && <Row label="Courriel" value={data.email} />}
        {zone && <Row label="Zone" value={zone.name} />}
        {data.ownerName && <Row label="Propriétaire" value={data.ownerName} />}
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <p className="font-medium text-sm mb-2 flex items-center gap-1"><Clock className="h-4 w-4 text-orange-400" /> Horaires</p>
        {openDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun jour ouvert configuré</p>
        ) : (
          openDays.map(h => (
            <Row key={h.day} label={h.label} value={`${h.open} – ${h.close}`} />
          ))
        )}
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <p className="font-medium text-sm mb-2">Paramètres de livraison</p>
        <Row label="Commande minimum" value={`$${data.minOrderAmount}`} />
        <Row label="Frais de livraison" value={`$${data.deliveryFee}`} />
        <Row label="Temps de préparation" value={`${data.preparationTime} min`} />
        <Row label="Rayon de livraison" value={`${data.maxDeliveryRadius} km`} />
        <Row label="Paiement en ligne" value={data.acceptsOnlinePayment ? "Oui" : "Non"} />
        <Row label="Paiement comptant" value={data.acceptsCash ? "Oui" : "Non"} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
