"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  User, Car, FileText, CheckCircle2, ChevronRight,
  ChevronLeft, Upload, Loader2, AlertCircle,
  Phone, MapPin, Camera, Shield, Hash, Zap
} from "lucide-react";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";

const STEPS = [
  { id: 1, label: "Profil",     icon: User,        desc: "Photo & coordonnées" },
  { id: 2, label: "Véhicule",   icon: Car,         desc: "Votre véhicule" },
  { id: 3, label: "Documents",  icon: FileText,     desc: "Permis & assurance" },
  { id: 4, label: "Terminé",    icon: CheckCircle2, desc: "Soumission" },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 10;
const VEHICLE_TYPES = [
  { id:"car",        label:"🚗 Voiture" },
  { id:"suv",        label:"🚙 SUV / VUS" },
  { id:"truck",      label:"🛻 Camionnette" },
  { id:"motorcycle", label:"🏍️ Moto" },
  { id:"bicycle",    label:"🚲 Vélo" },
  { id:"ebike",      label:"⚡ Vélo électrique" },
];
const COLORS = ["Blanc","Noir","Gris","Argent","Rouge","Bleu","Vert","Jaune","Orange","Brun","Beige","Autre"];

export default function OnboardingContent() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [driverName, setDriverName] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ phone:"", address:"", city:"Laval", postalCode:"", zone_id:"", photoUrl:"" });
  const [vehicle, setVehicle] = useState({ type:"car", make:"", model:"", year:String(CURRENT_YEAR-2), color:"", plate:"" });
  const [docs, setDocs] = useState({ licenseNumber:"", licenseExpiry:"", insuranceProvider:"", insurancePolicy:"", insuranceExpiry:"", registrationExpiry:"" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push("/driver/login"); return; }
      setUid(u.uid);
      setDriverName(u.displayName || "");
      setProfile(p => ({ ...p, phone: u.phoneNumber?.replace("+1","") || "" }));
    });
    return () => unsub();
  }, [router]);

  const sp = (k: string, v: string) => setProfile(p => ({ ...p, [k]: v }));
  const sv = (k: string, v: string) => setVehicle(p => ({ ...p, [k]: v }));
  const sd = (k: string, v: string) => setDocs(p => ({ ...p, [k]: v }));

  function validate(): string {
    if (step === 1) {
      if (!profile.phone.trim()) return "Téléphone requis.";
      if (!profile.zone_id) return "Sélectionnez votre zone de livraison.";
    }
    if (step === 2) {
      if (!vehicle.make.trim()) return "Marque du véhicule requise.";
      if (!vehicle.model.trim()) return "Modèle requis.";
      if (!vehicle.plate.trim()) return "Plaque d'immatriculation requise.";
      if (!vehicle.color) return "Couleur requise.";
      const y = parseInt(vehicle.year);
      if (isNaN(y) || y < MIN_YEAR || y > CURRENT_YEAR+1) return `Année: ${MIN_YEAR}–${CURRENT_YEAR+1} (max 10 ans).`;
    }
    if (step === 3) {
      if (!docs.licenseNumber.trim()) return "Numéro de permis requis.";
      if (!docs.licenseExpiry) return "Date d'expiration du permis requise.";
      if (!docs.insuranceProvider.trim()) return "Assureur requis.";
      if (!docs.insuranceExpiry) return "Date d'expiration de l'assurance requise.";
      if (!docs.registrationExpiry) return "Date d'expiration de l'immatriculation requise.";
    }
    return "";
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setPhotoPreview(URL.createObjectURL(file));
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/store/upload", { method:"POST", credentials:"include", body:fd });
      const data = await res.json();
      if (data.ok) sp("photoUrl", data.imageUrl);
    } catch(e){ console.error(e); }
    finally { setUploading(false); }
  }

  async function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true); setError("");
    try {
      const zone = ACTIVE_ZONES.find(z => z.id === profile.zone_id);
      const res = await fetch("/api/driver/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postalCode: profile.postalCode,
          current_zone_id: profile.zone_id,
          zone_name: zone?.name || "",
          photoUrl: profile.photoUrl,
          vehicle_type: vehicle.type,
          vehicle_make: vehicle.make,
          vehicle_model: vehicle.model,
          vehicle_year: parseInt(vehicle.year),
          vehicle_color: vehicle.color,
          vehicle_plate: vehicle.plate.toUpperCase(),
          license_number: docs.licenseNumber,
          license_expiry: docs.licenseExpiry,
          insurance_provider: docs.insuranceProvider,
          insurance_policy: docs.insurancePolicy,
          insurance_expiry: docs.insuranceExpiry,
          registration_expiry: docs.registrationExpiry,
          onboarding_completed: true,
          application_status: "pending",
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setStep(4);
    } catch(e) {
      setError("Erreur lors de la soumission. Réessayez.");
    } finally { setSaving(false); }
  }

  const zone = ACTIVE_ZONES.find(z => z.id === profile.zone_id);
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (step === 4) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Profil soumis ! 🎉</h1>
          <p className="text-gray-400 text-sm">Notre équipe va vérifier vos documents sous <strong className="text-white">24–48h</strong>. Vous recevrez une notification dès votre approbation.</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl p-4 text-left space-y-2 border border-white/5 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Véhicule</span><span className="text-white">{vehicle.year} {vehicle.make} {vehicle.model}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Plaque</span><span className="text-white font-mono">{vehicle.plate.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Zone</span><span className="text-orange-400">{zone?.name || "—"}</span></div>
        </div>
        <button onClick={() => router.push("/driver/dashboard")}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-2xl transition-colors">
          Aller au tableau de bord →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Activation chauffeur</p>
              <p className="text-[10px] text-gray-500">Étape {step} sur 3 — {STEPS[step-1]?.label}</p>
            </div>
          </div>
          {/* Barre de progression */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((step-1)/3)*100, 100)}%` }} />
          </div>
          {/* Steps */}
          <div className="flex justify-between mt-2">
            {STEPS.slice(0,3).map(s => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${done ? "bg-green-500" : active ? "bg-orange-500" : "bg-white/5"}`}>
                    <Icon className={`h-3.5 w-3.5 ${done || active ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <span className={`text-[9px] font-semibold ${active ? "text-orange-400" : done ? "text-green-400" : "text-gray-600"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-lg mx-auto px-4 pt-36 pb-32 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* ── ÉTAPE 1 : PROFIL ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Photo */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5">
              <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Camera className="h-4 w-4 text-orange-400" /> Photo de profil
              </p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {photoPreview
                    ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    : <User className="h-8 w-8 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <button onClick={() => photoRef.current?.click()} disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold px-4 py-3 rounded-xl hover:bg-orange-500/20 transition-colors">
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi...</> : <><Upload className="h-4 w-4" />Choisir une photo</>}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center">Photo claire, visage visible</p>
                </div>
                <input ref={photoRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" /> Coordonnées
              </p>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Téléphone *</label>
                <input value={profile.phone} onChange={e => sp("phone", e.target.value)}
                  placeholder="514-555-0000" type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Adresse</label>
                <input value={profile.address} onChange={e => sp("address", e.target.value)}
                  placeholder="123 Rue Principale"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ville</label>
                  <input value={profile.city} onChange={e => sp("city", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Code postal</label>
                  <input value={profile.postalCode} onChange={e => sp("postalCode", e.target.value.toUpperCase())}
                    placeholder="H7W 1A1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
                </div>
              </div>
            </div>

            {/* Zone */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" /> Zone de livraison *
              </p>
              <select value={profile.zone_id} onChange={e => sp("zone_id", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50">
                <option value="">Sélectionner votre zone...</option>
                {["laval","montreal","longueuil"].map(g => (
                  <optgroup key={g} label={g === "laval" ? "🏙️ Laval" : g === "montreal" ? "🗺️ Montréal" : "🌉 Longueuil"}>
                    {ACTIVE_ZONES.filter(z => z.delivery_zone_group === g).map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {zone && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {zone.name} · {zone.estimated_time_min}-{zone.estimated_time_max} min · {zone.delivery_fee}$/livraison
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : VÉHICULE ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-4">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-orange-400" /> Type de véhicule
              </p>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_TYPES.map(vt => (
                  <button key={vt.id} onClick={() => sv("type", vt.id)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold text-center transition-all border ${
                      vehicle.type === vt.id
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}>
                    {vt.label}
                  </button>
                ))}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                ℹ️ Véhicule max <strong>10 ans</strong> ({MIN_YEAR}–{CURRENT_YEAR+1}). Pas d'inspection mécanique requise.
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white">Informations du véhicule</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k:"make", l:"Marque *", ph:"Toyota, Honda..." },
                  { k:"model", l:"Modèle *", ph:"Corolla, Civic..." },
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.l}</label>
                    <input value={(vehicle as any)[f.k]} onChange={e => sv(f.k, e.target.value)} placeholder={f.ph}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Année * ({MIN_YEAR}–{CURRENT_YEAR+1})</label>
                  <input type="number" value={vehicle.year} onChange={e => sv("year", e.target.value)}
                    min={MIN_YEAR} max={CURRENT_YEAR+1}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Couleur *</label>
                  <select value={vehicle.color} onChange={e => sv("color", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500/50">
                    <option value="">Choisir...</option>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Plaque d&apos;immatriculation * (Québec)</label>
                <input value={vehicle.plate} onChange={e => sv("plate", e.target.value.toUpperCase())}
                  placeholder="ABC-1234" maxLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 font-mono tracking-widest placeholder-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : DOCUMENTS ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Permis */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" /> Permis de conduire
              </p>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Numéro de permis *</label>
                <input value={docs.licenseNumber} onChange={e => sd("licenseNumber", e.target.value.toUpperCase())}
                  placeholder="A12345678901234"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 font-mono placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration *</label>
                <input type="date" value={docs.licenseExpiry} onChange={e => sd("licenseExpiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
            </div>

            {/* Assurance */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-400" /> Assurance automobile
              </p>
              {[
                { k:"insuranceProvider", l:"Assureur *", ph:"Intact, Belairdirect, Desjardins..." },
                { k:"insurancePolicy",  l:"Numéro de police", ph:"ABC-123456" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs text-gray-400 mb-1 block">{f.l}</label>
                  <input value={(docs as any)[f.k]} onChange={e => sd(f.k, e.target.value)} placeholder={f.ph}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration *</label>
                <input type="date" value={docs.insuranceExpiry} onChange={e => sd("insuranceExpiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
            </div>

            {/* Immatriculation */}
            <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-orange-400" /> Immatriculation du véhicule
              </p>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration du certificat *</label>
                <input type="date" value={docs.registrationExpiry} onChange={e => sd("registrationExpiry", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
                ⚠️ Aucune inspection mécanique requise. Vous n&apos;êtes pas un chauffeur de taxi.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/5 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={() => { setStep(s => s-1); setError(""); }}
              className="flex items-center gap-2 border border-white/10 text-gray-300 font-semibold px-5 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
          )}
          {step < 3 ? (
            <button onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition-colors">
              Continuer <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi...</> : <><CheckCircle2 className="h-4 w-4" />Soumettre mon profil</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
