"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import {
  User, Car, FileText, CheckCircle2, ChevronRight,
  ChevronLeft, Camera, Upload, Loader2, AlertCircle,
  Shield, Phone, MapPin, Calendar, Hash
} from "lucide-react";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";

const STEPS = [
  { id: 1, label: "Profil",     icon: User },
  { id: 2, label: "Véhicule",   icon: Car },
  { id: 3, label: "Documents",  icon: FileText },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 10; // Max 10 ans

interface FormData {
  // Profil
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  zone_id: string;
  photoUrl: string;
  // Véhicule
  vehicle_type: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  vehicle_plate: string;
  // Documents
  license_number: string;
  license_expiry: string;
  insurance_provider: string;
  insurance_policy: string;
  insurance_expiry: string;
  registration_expiry: string;
}

const EMPTY: FormData = {
  phone: "", address: "", city: "Laval", postalCode: "", zone_id: "",
  photoUrl: "",
  vehicle_type: "car", vehicle_make: "", vehicle_model: "",
  vehicle_year: String(CURRENT_YEAR - 2), vehicle_color: "", vehicle_plate: "",
  license_number: "", license_expiry: "", insurance_provider: "",
  insurance_policy: "", insurance_expiry: "", registration_expiry: "",
};

const VEHICLE_TYPES = [
  { id: "car", label: "🚗 Voiture" },
  { id: "suv", label: "🚙 SUV / VUS" },
  { id: "truck", label: "🛻 Camionnette" },
  { id: "motorcycle", label: "🏍️ Moto / Scooter" },
  { id: "bicycle", label: "🚲 Vélo" },
  { id: "ebike", label: "⚡ Vélo électrique" },
];

const COLORS_FR = ["Blanc", "Noir", "Gris", "Argent", "Rouge", "Bleu", "Vert", "Jaune", "Orange", "Brun", "Beige", "Autre"];

export default function DriverWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [uid, setUid] = useState("");
  const [driverName, setDriverName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) { setUid(u.uid); setDriverName(u.displayName || ""); }
      else router.push("/driver/login");
    });
    return () => unsub();
  }, [router]);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  function validateStep(): string {
    if (step === 1) {
      if (!form.phone.trim()) return "Le numéro de téléphone est requis.";
      if (!form.zone_id) return "Veuillez sélectionner votre zone de livraison.";
    }
    if (step === 2) {
      if (!form.vehicle_make.trim()) return "La marque du véhicule est requise.";
      if (!form.vehicle_model.trim()) return "Le modèle est requis.";
      if (!form.vehicle_plate.trim()) return "La plaque d'immatriculation est requise.";
      const year = parseInt(form.vehicle_year);
      if (isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR + 1) {
        return `L'année doit être entre ${MIN_YEAR} et ${CURRENT_YEAR + 1} (max 10 ans).`;
      }
      if (!form.vehicle_color) return "La couleur est requise.";
    }
    if (step === 3) {
      if (!form.license_number.trim()) return "Le numéro de permis est requis.";
      if (!form.license_expiry) return "La date d'expiration du permis est requise.";
      if (!form.insurance_provider.trim()) return "L'assureur est requis.";
      if (!form.insurance_expiry) return "La date d'expiration de l'assurance est requise.";
      if (!form.registration_expiry) return "La date d'expiration de l'immatriculation est requise.";
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setPhotoPreview(URL.createObjectURL(file));
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/store/upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (data.ok) set("photoUrl", data.imageUrl);
    } catch(e){ console.error(e); }
    finally { setUploading(false); }
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setSaving(true); setError("");
    try {
      const zone = ACTIVE_ZONES.find(z => z.id === form.zone_id);
      const res = await fetch("/api/driver/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          current_zone_id: form.zone_id,
          zone_name: zone?.name || "",
          photoUrl: form.photoUrl,
          vehicle_type: form.vehicle_type,
          vehicle_make: form.vehicle_make,
          vehicle_model: form.vehicle_model,
          vehicle_year: parseInt(form.vehicle_year),
          vehicle_color: form.vehicle_color,
          vehicle_plate: form.vehicle_plate.toUpperCase(),
          license_number: form.license_number,
          license_expiry: form.license_expiry,
          insurance_provider: form.insurance_provider,
          insurance_policy: form.insurance_policy,
          insurance_expiry: form.insurance_expiry,
          registration_expiry: form.registration_expiry,
          wizard_completed: true,
          application_status: "pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.push("/driver/dashboard");
    } catch(e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally { setSaving(false); }
  }

  const zone = ACTIVE_ZONES.find(z => z.id === form.zone_id);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/5 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-white">Compléter mon profil chauffeur</h1>
          <p className="text-gray-500 text-xs mt-0.5">Étape {step} sur {STEPS.length}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-[#111] border-b border-white/5 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    done ? "bg-green-500" : active ? "bg-orange-500" : "bg-white/5"
                  }`}>
                    <Icon className={`h-4 w-4 ${done || active ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-orange-400" : done ? "text-green-400" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-3 transition-all ${done ? "bg-green-500/50" : "bg-white/5"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* ── ÉTAPE 1 : PROFIL ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="h-4 w-4 text-orange-400" /> Photo de profil
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  {photoPreview
                    ? <img src={photoPreview} alt="photo" className="w-full h-full object-cover" />
                    : <User className="h-8 w-8 text-gray-600" />}
                </div>
                <button onClick={() => photoRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-500/20 transition-colors">
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi...</> : <><Upload className="h-4 w-4" />Choisir une photo</>}
                </button>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" /> Coordonnées
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Téléphone *</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="514-555-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Adresse</label>
                <input value={form.address} onChange={e => set("address", e.target.value)}
                  placeholder="123 Rue Principale"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                  <input value={form.city} onChange={e => set("city", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Code postal</label>
                  <input value={form.postalCode} onChange={e => set("postalCode", e.target.value.toUpperCase())}
                    placeholder="H7W 1A1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" /> Zone de livraison *
              </h2>
              <select value={form.zone_id} onChange={e => set("zone_id", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50">
                <option value="">Sélectionner votre zone...</option>
                {["laval","montreal","longueuil"].map(g => (
                  <optgroup key={g} label={g === "laval" ? "🏙️ Laval" : g === "montreal" ? "🗺️ Montréal" : "🌉 Longueuil"}>
                    {ACTIVE_ZONES.filter(z => z.delivery_zone_group === g).map(z => (
                      <option key={z.id} value={z.id}>{z.name} ({z.estimated_time_min}-{z.estimated_time_max} min)</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {zone && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {zone.name} · Frais livraison {zone.delivery_fee}$ · {zone.estimated_time_min}-{zone.estimated_time_max} min
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : VÉHICULE ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-orange-400" /> Type de véhicule
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map(vt => (
                  <button key={vt.id} onClick={() => set("vehicle_type", vt.id)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                      form.vehicle_type === vt.id
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}>
                    {vt.label}
                  </button>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                ℹ️ Le véhicule doit avoir <strong>10 ans ou moins</strong> ({MIN_YEAR}-{CURRENT_YEAR + 1}). Aucune inspection mécanique requise.
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white">Informations du véhicule</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Marque *</label>
                  <input value={form.vehicle_make} onChange={e => set("vehicle_make", e.target.value)}
                    placeholder="Toyota, Honda..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Modèle *</label>
                  <input value={form.vehicle_model} onChange={e => set("vehicle_model", e.target.value)}
                    placeholder="Corolla, Civic..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Année * ({MIN_YEAR}-{CURRENT_YEAR+1})</label>
                  <input type="number" value={form.vehicle_year}
                    onChange={e => set("vehicle_year", e.target.value)}
                    min={MIN_YEAR} max={CURRENT_YEAR + 1}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Couleur *</label>
                  <select value={form.vehicle_color} onChange={e => set("vehicle_color", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50">
                    <option value="">Choisir...</option>
                    {COLORS_FR.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Plaque d&apos;immatriculation * (Québec)</label>
                <input value={form.vehicle_plate} onChange={e => set("vehicle_plate", e.target.value.toUpperCase())}
                  placeholder="ABC-1234" maxLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 font-mono tracking-widest" />
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : DOCUMENTS ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Permis de conduire */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" /> Permis de conduire
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Numéro de permis *</label>
                <input value={form.license_number} onChange={e => set("license_number", e.target.value.toUpperCase())}
                  placeholder="A12345678901234"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration *</label>
                <input type="date" value={form.license_expiry} onChange={e => set("license_expiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
            </div>

            {/* Assurance */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-400" /> Assurance automobile
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nom de l&apos;assureur *</label>
                <input value={form.insurance_provider} onChange={e => set("insurance_provider", e.target.value)}
                  placeholder="Intact, Belairdirect, Desjardins..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Numéro de police</label>
                <input value={form.insurance_policy} onChange={e => set("insurance_policy", e.target.value)}
                  placeholder="ABC-123456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 font-mono" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration *</label>
                <input type="date" value={form.insurance_expiry} onChange={e => set("insurance_expiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
            </div>

            {/* Immatriculation */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-orange-400" /> Immatriculation du véhicule
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration du certificat *</label>
                <input type="date" value={form.registration_expiry} onChange={e => set("registration_expiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
                ⚠️ Aucune inspection mécanique requise. Vous n&apos;êtes pas chauffeur de taxi — juste un livreur partenaire FastDép.
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 4 : CONFIRMATION ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 overflow-hidden flex items-center justify-center">
                  {photoPreview
                    ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    : <User className="h-7 w-7 text-orange-400" />}
                </div>
                <div>
                  <p className="font-bold text-white">{driverName || "Chauffeur"}</p>
                  <p className="text-xs text-gray-400">{form.phone}</p>
                  <p className="text-xs text-orange-400">{ACTIVE_ZONES.find(z => z.id === form.zone_id)?.name || ""}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { label: "Véhicule", value: `${form.vehicle_year} ${form.vehicle_make} ${form.vehicle_model} — ${form.vehicle_color}` },
                  { label: "Plaque", value: form.vehicle_plate },
                  { label: "Permis", value: `${form.license_number} · exp. ${form.license_expiry}` },
                  { label: "Assurance", value: `${form.insurance_provider} · exp. ${form.insurance_expiry}` },
                  { label: "Immatriculation", value: `exp. ${form.registration_expiry}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                    <span className="text-gray-400 shrink-0">{row.label}</span>
                    <span className="text-white text-right text-xs">{row.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-xs text-green-400">
              ✅ Votre profil sera soumis pour approbation. Notre équipe vérifiera vos documents sous 24-48h.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => { setStep(s => s - 1); setError(""); }}
              className="flex items-center gap-2 border border-white/10 text-gray-300 font-semibold px-5 py-3 rounded-2xl hover:bg-white/5 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
          )}
          {step < 4 ? (
            <button onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-2xl transition-colors">
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-2xl transition-colors disabled:opacity-50">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi...</> : <><CheckCircle2 className="h-4 w-4" />Soumettre mon profil</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
