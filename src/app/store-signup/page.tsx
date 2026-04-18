"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMERCE_TYPES, COMMERCE_TYPE_GROUPS } from "@/lib/commerce-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/logo";
import { CheckCircle2, Store, User, MapPin, Loader2, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Votre commerce",   icon: Store },
  { id: 2, label: "Localisation",     icon: MapPin },
  { id: 3, label: "Responsable",      icon: User },
  { id: 4, label: "Confirmation",     icon: CheckCircle2 },
];

const ZONES = [
  "Laval — Chomedey",
  "Laval — Sainte-Dorothée",
  "Laval — Vimont",
  "Laval — Auteuil",
  "Laval — Fabreville",
  "Montréal — Centre-Ville",
  "Montréal — Rosemont",
  "Montréal — Plateau",
  "Montréal — Ahuntsic",
  "Montréal — Saint-Laurent",
  "Longueuil — Centre",
  "Longueuil — Saint-Hubert",
  "Laval Ouest",
];

const EMPTY = {
  // Étape 1 — Commerce
  commerceName: "",
  commerceTypeId: "",
  commerceTypeName: "",
  phone: "",
  // Étape 2 — Localisation
  address: "",
  city: "Laval",
  postalCode: "",
  zone: "",
  // Étape 3 — Responsable
  managerName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function StoreSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...EMPTY });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof EMPTY, value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  // ── Validation par étape ────────────────────────────────────────────
  function validateStep(): string {
    if (step === 1) {
      if (!data.commerceName.trim()) return "Le nom du commerce est requis.";
      if (!data.commerceTypeId) return "Veuillez sélectionner le type de commerce.";
      if (!data.phone.trim()) return "Le numéro de téléphone est requis.";
    }
    if (step === 2) {
      if (!data.address.trim()) return "L'adresse est requise.";
      if (!data.city.trim()) return "La ville est requise.";
      if (!data.postalCode.trim()) return "Le code postal est requis.";
      if (!data.zone) return "Veuillez sélectionner une zone de livraison.";
    }
    if (step === 3) {
      if (!data.managerName.trim()) return "Le nom du gérant est requis.";
      if (!data.email.trim() || !data.email.includes("@")) return "Courriel invalide.";
      if (data.password.length < 8) return "Mot de passe minimum 8 caractères.";
      if (data.password !== data.confirmPassword) return "Les mots de passe ne correspondent pas.";
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  function back() {
    setError("");
    setStep(s => s - 1);
  }

  // ── Soumission finale ───────────────────────────────────────────────
  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/store/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commerceName: data.commerceName,
          commerceTypeId: data.commerceTypeId,
          commerceTypeName: data.commerceTypeName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          zone: data.zone,
          managerName: data.managerName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        setError(result?.error || "Erreur lors de la création du compte.");
        return;
      }

      // Succès — rediriger vers login
      router.push("/store-login?registered=1");

    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // ── Rendu ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo className="h-12 w-12" /></div>
          <h1 className="text-2xl font-bold text-gray-900">Devenir commercant partenaire</h1>
          <p className="text-gray-500 text-sm mt-1">Créez votre espace en quelques étapes</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    done ? "bg-green-500 text-white" :
                    active ? "bg-orange-500 text-white" :
                    "bg-gray-200 text-gray-400"
                  }`}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-orange-600" : done ? "text-green-600" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">

          {/* Erreur */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ── ÉTAPE 1 : Votre commerce ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-500" /> Votre commerce
                </h2>
                <p className="text-gray-500 text-sm mt-1">Informations de base sur votre établissement</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Nom du commerce <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="ex: Dépanneur Express, Fleuriste Chez Marie..."
                  value={data.commerceName}
                  onChange={e => set("commerceName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Type de commerce <span className="text-red-500">*</span></Label>
                <Select
                  value={data.commerceTypeId}
                  onValueChange={v => {
                    const ct = COMMERCE_TYPES.find(c => c.id === v);
                    set("commerceTypeId", v);
                    set("commerceTypeName", ct?.name || "");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner le type de votre commerce..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COMMERCE_TYPE_GROUPS.map(group => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/60 border-b sticky top-0">
                          {group}
                        </div>
                        {COMMERCE_TYPES.filter(c => c.group === group).map(ct => (
                          <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Téléphone <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="514-555-0000"
                  value={data.phone}
                  onChange={e => set("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Localisation ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" /> Localisation
                </h2>
                <p className="text-gray-500 text-sm mt-1">Où se trouve votre commerce ?</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Adresse complète <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="ex: 1234 Boul. de la Concorde O."
                  value={data.address}
                  onChange={e => set("address", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ville <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Laval"
                    value={data.city}
                    onChange={e => set("city", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Code postal <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="H7W 1A1"
                    value={data.postalCode}
                    onChange={e => set("postalCode", e.target.value.toUpperCase())}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Zone de livraison <span className="text-red-500">*</span></Label>
                <Select value={data.zone} onValueChange={v => set("zone", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner votre zone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Responsable ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" /> Responsable du commerce
                </h2>
                <p className="text-gray-500 text-sm mt-1">Informations du gérant / propriétaire</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Nom complet du gérant <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="ex: Jean Tremblay"
                  value={data.managerName}
                  onChange={e => set("managerName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Adresse courriel <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={data.email}
                  onChange={e => set("email", e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Ce courriel sera votre identifiant de connexion</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Mot de passe <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Min. 8 caractères"
                    value={data.password}
                    onChange={e => set("password", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Confirmer <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Répéter le mot de passe"
                    value={data.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Confirmation ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Vérifiez vos informations</h2>
                <p className="text-gray-500 text-sm mt-1">Confirmez avant de créer votre compte</p>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-xl p-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Commerce</span>
                  <span className="font-semibold">{data.commerceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="font-semibold">{data.commerceTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Téléphone</span>
                  <span className="font-semibold">{data.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Adresse</span>
                  <span className="font-semibold text-right">{data.address}, {data.city} {data.postalCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Zone</span>
                  <span className="font-semibold">{data.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Gérant</span>
                  <span className="font-semibold">{data.managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Courriel</span>
                  <span className="font-semibold">{data.email}</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                ⏳ Votre compte sera en attente de validation par notre équipe avant d'être activé.
              </div>
            </div>
          )}

          {/* Boutons navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={back} disabled={loading} className="flex-1 gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={next}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Création du compte...</>
                  : <><CheckCircle2 className="h-4 w-4" />Créer mon compte</>}
              </Button>
            )}
          </div>
        </div>

        {/* Lien login */}
        <p className="text-center mt-5 text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/store-login" className="text-orange-500 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
