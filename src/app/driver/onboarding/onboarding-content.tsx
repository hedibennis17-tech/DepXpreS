"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import {
  User, Car, FileText, CheckCircle2, ChevronRight,
  ChevronLeft, Upload, Loader2, AlertCircle,
  Phone, MapPin, Camera, Shield, Hash, Zap, X
} from "lucide-react";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";

const STEPS = [
  { id: 1, label: "Profil",    icon: User,        desc: "Photo & coordonnées" },
  { id: 2, label: "Véhicule",  icon: Car,         desc: "Votre véhicule" },
  { id: 3, label: "Documents", icon: FileText,    desc: "Permis & assurance" },
  { id: 4, label: "Terminé",   icon: CheckCircle2,desc: "Soumission" },
];

const CY = new Date().getFullYear();
const MIN_YEAR = CY - 10;
const VTYPES = [
  { id:"car",label:"🚗 Voiture" },{ id:"suv",label:"🚙 SUV / VUS" },
  { id:"truck",label:"🛻 Camionnette" },{ id:"motorcycle",label:"🏍️ Moto" },
  { id:"bicycle",label:"🚲 Vélo" },{ id:"ebike",label:"⚡ Vélo élec." },
];
const COLORS = ["Blanc","Noir","Gris","Argent","Rouge","Bleu","Vert","Jaune","Orange","Brun","Beige","Autre"];

interface DocFile { file: File; preview: string; url: string; uploading: boolean; }
const emptyDoc = (): DocFile => ({ file: null as any, preview: "", url: "", uploading: false });

export default function OnboardingContent() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [driverName, setDriverName] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);
  const registrationRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ phone:"", address:"", city:"Laval", postalCode:"", zone_id:"", photoUrl:"", photoPreview:"" });
  const [vehicle, setVehicle] = useState({ type:"car", make:"", model:"", year:String(CY-2), color:"", plate:"" });
  const [docs, setDocs] = useState({
    licenseNumber:"", licenseExpiry:"",
    insuranceProvider:"", insurancePolicy:"", insuranceExpiry:"",
    registrationExpiry:"",
  });
  const [docFiles, setDocFiles] = useState({
    license: emptyDoc(),
    insurance: emptyDoc(),
    registration: emptyDoc(),
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push("/driver/login"); return; }
      setUid(u.uid);
      setDriverName(u.displayName || "");
    });
    return () => unsub();
  }, [router]);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) return {};
    try {
      const token = await getIdToken(user);
      return { "Authorization": `Bearer ${token}` };
    } catch { return {}; }
  }

  async function uploadFile(file: File, key: keyof typeof docFiles): Promise<string> {
    setDocFiles(prev => ({ ...prev, [key]: { ...prev[key], uploading: true } }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/driver/upload", { method: "POST", headers, body: fd });
      const data = await res.json();
      if (data.ok) {
        setDocFiles(prev => ({ ...prev, [key]: { ...prev[key], url: data.imageUrl, uploading: false } }));
        return data.imageUrl;
      }
      console.error("Upload error:", data.error);
      throw new Error(data.error || "Upload failed");
    } catch(e) {
      console.error("Upload exception:", e);
      setDocFiles(prev => ({ ...prev, [key]: { ...prev[key], uploading: false } }));
      return "";
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfile(p => ({ ...p, photoPreview: preview }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/driver/upload", { method:"POST", headers, body: fd });
      const data = await res.json();
      if (data.ok) {
        setProfile(p => ({ ...p, photoUrl: data.imageUrl }));
      } else {
        console.error("Photo upload error:", data.error);
      }
    } catch(e) { console.error("Photo upload exception:", e); }
  }

  async function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof docFiles) {
    const file = e.target.files?.[0]; if (!file) return;
    const preview = URL.createObjectURL(file);
    setDocFiles(prev => ({ ...prev, [key]: { file, preview, url: "", uploading: true } }));
    const url = await uploadFile(file, key);
    setDocFiles(prev => ({ ...prev, [key]: { file, preview, url, uploading: false } }));
  }

  function validate(): string {
    if (step === 1) {
      if (!profile.phone.trim()) return "Téléphone requis.";
      if (!profile.zone_id) return "Veuillez sélectionner votre zone de livraison.";
    }
    if (step === 2) {
      if (!vehicle.make.trim()) return "Marque du véhicule requise.";
      if (!vehicle.model.trim()) return "Modèle requis.";
      if (!vehicle.plate.trim()) return "Plaque requise.";
      if (!vehicle.color) return "Couleur requise.";
      const y = parseInt(vehicle.year);
      if (isNaN(y) || y < MIN_YEAR || y > CY+1) return `Année: ${MIN_YEAR}–${CY+1} (max 10 ans).`;
    }
    if (step === 3) {
      if (!docs.licenseNumber.trim()) return "Numéro de permis requis.";
      if (!docs.licenseExpiry) return "Date expiration permis requise.";
      if (!docs.insuranceProvider.trim()) return "Assureur requis.";
      if (!docs.insuranceExpiry) return "Date expiration assurance requise.";
      if (!docs.registrationExpiry) return "Date expiration immatriculation requise.";
    }
    return "";
  }

  function next() {
    const err = validate(); if (err) { setError(err); return; }
    setError(""); setStep(s => s + 1);
  }

  async function submit() {
    const err = validate(); if (err) { setError(err); return; }
    setSaving(true); setError("");
    try {
      const zone = ACTIVE_ZONES.find(z => z.id === profile.zone_id);
      const body = {
        uid,
        full_name: driverName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postalCode: profile.postalCode,
        current_zone_id: profile.zone_id,
        zone_name: zone?.name || "",
        zones_available: [profile.zone_id], // Peut en avoir plusieurs
        photoUrl: profile.photoUrl,
        vehicle_type: vehicle.type,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_year: parseInt(vehicle.year),
        vehicle_color: vehicle.color,
        vehicle_plate: vehicle.plate.toUpperCase(),
        license_number: docs.licenseNumber,
        license_expiry: docs.licenseExpiry,
        license_doc_url: docFiles.license.url,
        insurance_provider: docs.insuranceProvider,
        insurance_policy: docs.insurancePolicy,
        insurance_expiry: docs.insuranceExpiry,
        insurance_doc_url: docFiles.insurance.url,
        registration_expiry: docs.registrationExpiry,
        registration_doc_url: docFiles.registration.url,
        onboarding_completed: true,
        wizard_completed: true,
        application_status: "pending",
        driver_status: "offline",
      };
      const res = await fetch("/api/driver/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setStep(4);
    } catch(e) {
      setError("Erreur lors de la soumission. Réessayez.");
    } finally { setSaving(false); }
  }

  const zone = ACTIVE_ZONES.find(z => z.id === profile.zone_id);
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  // ── ÉCRAN SUCCÈS ──────────────────────────────────────────────────────────
  if (step === 4) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Profil soumis ! 🎉</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Notre équipe va vérifier vos documents sous <strong className="text-white">24–48h</strong>. Vous recevrez une notification dès votre approbation.
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Zone choisie</span>
            <span className="text-white font-semibold">{zone?.name || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Véhicule</span>
            <span className="text-white font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Statut</span>
            <span className="text-yellow-400 font-semibold">En attente de vérification</span>
          </div>
        </div>
        <button onClick={() => router.push("/driver/dashboard")}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-2xl transition-colors">
          Aller au tableau de bord →
        </button>
      </div>
    </div>
  );

  // ── LAYOUT PRINCIPAL ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-white">Activation chauffeur</h1>
            <p className="text-[10px] text-gray-500">Étape {step} sur {STEPS.length - 1} — {STEPS[step-1]?.label}</p>
          </div>
        </div>
        {/* Barre de progression */}
        <div className="max-w-lg mx-auto mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Stepper icons */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {STEPS.filter(s => s.id < 4).map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                    done ? "bg-green-500 border-green-500" : active ? "bg-orange-500 border-orange-500" : "bg-white/5 border-white/10"
                  }`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-bold ${active ? "text-orange-400" : done ? "text-green-400" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${done ? "bg-green-500/50" : "bg-white/5"}`} />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* ── ÉTAPE 1 : PROFIL ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Photo */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="h-4 w-4 text-orange-400" /> Photo de profil
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {profile.photoPreview
                    ? <img src={profile.photoPreview} alt="" className="w-full h-full object-cover" />
                    : <User className="h-8 w-8 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <button onClick={() => photoRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold px-4 py-3 rounded-xl hover:bg-orange-500/20 transition-colors">
                    <Camera className="h-4 w-4" /> Choisir une photo
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center">Photo claire de votre visage</p>
                </div>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" /> Coordonnées
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Téléphone *</label>
                <input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
                  placeholder="514-555-0000"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Adresse</label>
                <input value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))}
                  placeholder="123 Rue Principale"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Ville</label>
                  <input value={profile.city} onChange={e => setProfile(p => ({...p, city: e.target.value}))}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Code postal</label>
                  <input value={profile.postalCode} onChange={e => setProfile(p => ({...p, postalCode: e.target.value.toUpperCase()}))}
                    placeholder="H7W 1A1"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                </div>
              </div>
            </div>

            {/* Zone */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" /> Zone de livraison principale *
              </h2>
              <p className="text-xs text-gray-500">Vous pourrez changer de zone à chaque connexion.</p>
              <select value={profile.zone_id} onChange={e => setProfile(p => ({...p, zone_id: e.target.value}))}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors">
                <option value="">Sélectionner votre zone...</option>
                {["laval","montreal","longueuil"].map(g => (
                  <optgroup key={g} label={g === "laval" ? "🏙️ Laval" : g === "montreal" ? "🗺️ Montréal" : "🌉 Longueuil"}>
                    {ACTIVE_ZONES.filter(z => z.delivery_zone_group === g).map(z => (
                      <option key={z.id} value={z.id}>{z.name} · {z.delivery_fee}$</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {zone && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl text-xs text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {zone.name} · {zone.estimated_time_min}-{zone.estimated_time_max} min
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : VÉHICULE ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-orange-400" /> Type de véhicule
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {VTYPES.map(vt => (
                  <button key={vt.id} onClick={() => setVehicle(v => ({...v, type: vt.id}))}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold text-center transition-all border-2 ${
                      vehicle.type === vt.id ? "bg-orange-500/20 border-orange-500 text-orange-300" : "bg-[#111] border-white/10 text-gray-400"
                    }`}>
                    {vt.label}
                  </button>
                ))}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                ℹ️ Véhicule max <strong>10 ans</strong> ({MIN_YEAR}–{CY+1}). Aucune inspection mécanique requise.
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white">Informations du véhicule</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key:"make", label:"Marque *", placeholder:"Toyota, Honda..." },
                  { key:"model", label:"Modèle *", placeholder:"Corolla, Civic..." },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                    <input value={(vehicle as any)[f.key]} onChange={e => setVehicle(v => ({...v, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Année * ({MIN_YEAR}–{CY+1})</label>
                  <input type="number" value={vehicle.year} onChange={e => setVehicle(v => ({...v, year: e.target.value}))}
                    min={MIN_YEAR} max={CY+1}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Couleur *</label>
                  <select value={vehicle.color} onChange={e => setVehicle(v => ({...v, color: e.target.value}))}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors">
                    <option value="">Choisir...</option>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Plaque d&apos;immatriculation * (Québec)</label>
                <input value={vehicle.plate} onChange={e => setVehicle(v => ({...v, plate: e.target.value.toUpperCase()}))}
                  placeholder="ABC-1234" maxLength={8}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono tracking-widest outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : DOCUMENTS ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Permis */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" /> Permis de conduire
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Numéro de permis *</label>
                <input value={docs.licenseNumber} onChange={e => setDocs(d => ({...d, licenseNumber: e.target.value.toUpperCase()}))}
                  placeholder="A12345678901234"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Date d&apos;expiration *</label>
                <input type="date" value={docs.licenseExpiry} onChange={e => setDocs(d => ({...d, licenseExpiry: e.target.value}))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors" />
              </div>
              {/* Upload photo permis */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Photo du permis (recto)</label>
                <input ref={licenseRef} type="file" accept="image/*,application/pdf" onChange={e => handleDocSelect(e, "license")} className="hidden" />
                {docFiles.license.preview ? (
                  <div className="relative">
                    <img src={docFiles.license.preview} alt="" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                    <button onClick={() => setDocFiles(prev => ({...prev, license: emptyDoc()}))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </button>
                    {docFiles.license.uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                    {docFiles.license.url && <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-0.5"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                  </div>
                ) : (
                  <button onClick={() => licenseRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/15 rounded-xl py-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-orange-500/40 hover:text-orange-400 transition-colors">
                    <Upload className="h-4 w-4" /> Téléverser une photo
                  </button>
                )}
              </div>
            </div>

            {/* Assurance */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-400" /> Assurance automobile
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Nom de l&apos;assureur *</label>
                <input value={docs.insuranceProvider} onChange={e => setDocs(d => ({...d, insuranceProvider: e.target.value}))}
                  placeholder="Intact, Belairdirect, Desjardins..."
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Numéro de police</label>
                <input value={docs.insurancePolicy} onChange={e => setDocs(d => ({...d, insurancePolicy: e.target.value}))}
                  placeholder="ABC-123456"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Date d&apos;expiration *</label>
                <input type="date" value={docs.insuranceExpiry} onChange={e => setDocs(d => ({...d, insuranceExpiry: e.target.value}))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Photo de la preuve d&apos;assurance</label>
                <input ref={insuranceRef} type="file" accept="image/*,application/pdf" onChange={e => handleDocSelect(e, "insurance")} className="hidden" />
                {docFiles.insurance.preview ? (
                  <div className="relative">
                    <img src={docFiles.insurance.preview} alt="" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                    <button onClick={() => setDocFiles(prev => ({...prev, insurance: emptyDoc()}))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </button>
                    {docFiles.insurance.uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                    {docFiles.insurance.url && <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-0.5"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                  </div>
                ) : (
                  <button onClick={() => insuranceRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/15 rounded-xl py-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-orange-500/40 hover:text-orange-400 transition-colors">
                    <Upload className="h-4 w-4" /> Téléverser une photo
                  </button>
                )}
              </div>
            </div>

            {/* Immatriculation */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-orange-400" /> Immatriculation du véhicule
              </h2>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Expiration du certificat *</label>
                <input type="date" value={docs.registrationExpiry} onChange={e => setDocs(d => ({...d, registrationExpiry: e.target.value}))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Photo du certificat d&apos;immatriculation</label>
                <input ref={registrationRef} type="file" accept="image/*,application/pdf" onChange={e => handleDocSelect(e, "registration")} className="hidden" />
                {docFiles.registration.preview ? (
                  <div className="relative">
                    <img src={docFiles.registration.preview} alt="" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                    <button onClick={() => setDocFiles(prev => ({...prev, registration: emptyDoc()}))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </button>
                    {docFiles.registration.uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                    {docFiles.registration.url && <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-0.5"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                  </div>
                ) : (
                  <button onClick={() => registrationRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/15 rounded-xl py-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-orange-500/40 hover:text-orange-400 transition-colors">
                    <Upload className="h-4 w-4" /> Téléverser une photo
                  </button>
                )}
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
                ⚠️ Aucune inspection mécanique requise. Vous n&apos;êtes pas chauffeur de taxi.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOUTONS NAVIGATION FIXES ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={() => { setStep(s => s-1); setError(""); }}
              className="flex items-center gap-2 border-2 border-white/15 text-gray-300 font-bold px-5 py-3.5 rounded-2xl hover:bg-white/5 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
          )}
          {step < 3 ? (
            <button onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/30 text-base">
              Suivant <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={submit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 text-base">
              {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Envoi...</> : <><CheckCircle2 className="h-5 w-5" />Soumettre mon profil</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
