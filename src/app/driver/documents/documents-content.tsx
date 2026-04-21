"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  Shield, FileText, Hash, Upload, CheckCircle2,
  AlertCircle, Clock, X, Loader2, RefreshCw, Bell
} from "lucide-react";

interface DocInfo {
  label: string;
  key: string;
  urlKey: string;
  expiryKey: string;
  numberKey?: string;
  numberLabel?: string;
  policyKey?: string;
  policyLabel?: string;
  providerKey?: string;
  providerLabel?: string;
  icon: string;
  description: string;
}

const DOCS: DocInfo[] = [
  {
    label: "Permis de conduire",
    icon: "🪪",
    key: "license",
    urlKey: "license_doc_url",
    expiryKey: "license_expiry",
    numberKey: "license_number",
    numberLabel: "Numéro de permis",
    description: "Permis valide, classe appropriée pour la livraison",
  },
  {
    label: "Assurance automobile",
    icon: "🛡️",
    key: "insurance",
    urlKey: "insurance_doc_url",
    expiryKey: "insurance_expiry",
    providerKey: "insurance_provider",
    providerLabel: "Assureur",
    policyKey: "insurance_policy",
    policyLabel: "Numéro de police",
    description: "Preuve d'assurance valide pour votre véhicule",
  },
  {
    label: "Immatriculation",
    icon: "📋",
    key: "registration",
    urlKey: "registration_doc_url",
    expiryKey: "registration_expiry",
    description: "Certificat d'immatriculation du véhicule",
  },
];

function getDocStatus(expiry: string): "valid" | "expiring" | "expired" | "missing" {
  if (!expiry) return "missing";
  const d = new Date(expiry);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "expired";
  if (diff < 30) return "expiring";
  return "valid";
}

const STATUS_UI = {
  valid:    { label: "Valide",           color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  icon: CheckCircle2 },
  expiring: { label: "Expire bientôt",  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  expired:  { label: "Expiré !",        color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       icon: AlertCircle },
  missing:  { label: "Manquant",        color: "text-gray-400",   bg: "bg-white/5 border-white/10",            icon: AlertCircle },
};

export default function DriverDocuments() {
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editDoc, setEditDoc] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setLoading(false); return; }
      setUid(u.uid);
      try {
        const d = await getDoc(doc(db, "driver_profiles", u.uid));
        if (d.exists()) setProfile(d.data() as Record<string, string>);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  async function getToken(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) return {};
    try { return { "Authorization": `Bearer ${await getIdToken(user)}` }; }
    catch { return {}; }
  }

  async function uploadDoc(file: File, docKey: string, urlKey: string) {
    setUploading(prev => ({ ...prev, [docKey]: true }));
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const headers = await getToken();
      const res = await fetch("/api/driver/upload", { method: "POST", headers, body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Erreur upload");

      // Sauvegarder l'URL dans Firestore
      await updateDoc(doc(db, "driver_profiles", uid), {
        [urlKey]: data.imageUrl,
        updated_at: serverTimestamp(),
      });

      setProfile(prev => ({ ...prev, [urlKey]: data.imageUrl }));
      setMsg({ type: "ok", text: `✅ Document téléversé avec succès !` });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Erreur upload" });
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  }

  async function saveDocInfo(docInfo: DocInfo) {
    setSaving(prev => ({ ...prev, [docInfo.key]: true }));
    setMsg(null);
    try {
      const updates: Record<string, string> = { updated_at: serverTimestamp() as any };
      if (docInfo.expiryKey && editValues[docInfo.expiryKey] !== undefined)
        updates[docInfo.expiryKey] = editValues[docInfo.expiryKey];
      if (docInfo.numberKey && editValues[docInfo.numberKey] !== undefined)
        updates[docInfo.numberKey] = editValues[docInfo.numberKey];
      if (docInfo.providerKey && editValues[docInfo.providerKey] !== undefined)
        updates[docInfo.providerKey] = editValues[docInfo.providerKey];
      if (docInfo.policyKey && editValues[docInfo.policyKey] !== undefined)
        updates[docInfo.policyKey] = editValues[docInfo.policyKey];

      await updateDoc(doc(db, "driver_profiles", uid), updates);
      setProfile(prev => ({ ...prev, ...updates }));
      setEditDoc(null);
      setMsg({ type: "ok", text: "✅ Informations mises à jour" });
    } catch (e) {
      setMsg({ type: "err", text: "Erreur sauvegarde" });
    } finally {
      setSaving(prev => ({ ...prev, [docInfo.key]: false }));
    }
  }

  function startEdit(docInfo: DocInfo) {
    const vals: Record<string, string> = {};
    if (docInfo.expiryKey) vals[docInfo.expiryKey] = profile[docInfo.expiryKey] || "";
    if (docInfo.numberKey) vals[docInfo.numberKey] = profile[docInfo.numberKey] || "";
    if (docInfo.providerKey) vals[docInfo.providerKey] = profile[docInfo.providerKey] || "";
    if (docInfo.policyKey) vals[docInfo.policyKey] = profile[docInfo.policyKey] || "";
    setEditValues(vals);
    setEditDoc(docInfo.key);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  const expiringDocs = DOCS.filter(d => {
    const s = getDocStatus(profile[d.expiryKey]);
    return s === "expiring" || s === "expired";
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold text-white">📄 Mes documents</h1>

      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm border ${
          msg.type === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Alerte documents expirants */}
      {expiringDocs.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">
              {expiringDocs.length} document{expiringDocs.length > 1 ? "s" : ""} nécessite{expiringDocs.length > 1 ? "nt" : ""} votre attention
            </span>
          </div>
          {expiringDocs.map(d => (
            <p key={d.key} className="text-xs text-red-300 ml-6">
              • {d.icon} {d.label} — expire le {profile[d.expiryKey]}
            </p>
          ))}
        </div>
      )}

      {/* Carte par document */}
      {DOCS.map(docInfo => {
        const status = getDocStatus(profile[docInfo.expiryKey]);
        const ui = STATUS_UI[status];
        const Icon = ui.icon;
        const hasPhoto = !!profile[docInfo.urlKey];
        const isEditing = editDoc === docInfo.key;
        const isUploading = uploading[docInfo.key];
        const isSaving = saving[docInfo.key];

        return (
          <div key={docInfo.key} className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{docInfo.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{docInfo.label}</p>
                  <p className="text-[10px] text-gray-500">{docInfo.description}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${ui.bg} ${ui.color}`}>
                <Icon className="h-3 w-3" /> {ui.label}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Photo du document */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-semibold">📸 Photo du document</p>
                {hasPhoto ? (
                  <div className="relative">
                    <img
                      src={profile[docInfo.urlKey]}
                      alt={docInfo.label}
                      className="w-full h-36 object-cover rounded-2xl border border-white/10"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => fileRefs.current[docInfo.key]?.click()}
                        className="bg-black/60 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-black/80 transition-colors">
                        <RefreshCw className="h-3 w-3" /> Changer
                      </button>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto" />
                          <p className="text-xs text-white mt-2">Téléversement...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileRefs.current[docInfo.key]?.click()}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-white/15 rounded-2xl py-8 flex flex-col items-center gap-3 text-gray-500 hover:border-orange-500/50 hover:text-orange-400 transition-colors">
                    {isUploading ? (
                      <><Loader2 className="h-8 w-8 animate-spin text-orange-400" /><span className="text-sm">Téléversement...</span></>
                    ) : (
                      <><Upload className="h-8 w-8" /><span className="text-sm font-semibold">Téléverser le document</span><span className="text-xs">JPG, PNG ou PDF — Max 10 Mo</span></>
                    )}
                  </button>
                )}
                <input
                  ref={el => { fileRefs.current[docInfo.key] = el; }}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadDoc(file, docInfo.key, docInfo.urlKey);
                  }}
                />
              </div>

              {/* Infos du document */}
              {!isEditing ? (
                <div className="space-y-2">
                  {docInfo.numberKey && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{docInfo.numberLabel}</span>
                      <span className={`font-mono font-semibold ${profile[docInfo.numberKey] ? "text-white" : "text-gray-600"}`}>
                        {profile[docInfo.numberKey] || "Non renseigné"}
                      </span>
                    </div>
                  )}
                  {docInfo.providerKey && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{docInfo.providerLabel}</span>
                      <span className={`font-semibold ${profile[docInfo.providerKey] ? "text-white" : "text-gray-600"}`}>
                        {profile[docInfo.providerKey] || "Non renseigné"}
                      </span>
                    </div>
                  )}
                  {docInfo.policyKey && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{docInfo.policyLabel}</span>
                      <span className={`font-mono font-semibold ${profile[docInfo.policyKey] ? "text-white" : "text-gray-600"}`}>
                        {profile[docInfo.policyKey] || "Non renseigné"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Expiration</span>
                    <span className={`font-semibold ${
                      status === "expired" ? "text-red-400" :
                      status === "expiring" ? "text-yellow-400" :
                      status === "valid" ? "text-green-400" : "text-gray-600"
                    }`}>
                      {profile[docInfo.expiryKey] || "Non renseigné"}
                    </span>
                  </div>
                  <button
                    onClick={() => startEdit(docInfo)}
                    className="w-full mt-2 text-xs font-semibold text-orange-400 border border-orange-500/20 bg-orange-500/5 py-2 rounded-xl hover:bg-orange-500/10 transition-colors">
                    ✏️ Modifier les informations
                  </button>
                </div>
              ) : (
                /* Formulaire édition */
                <div className="space-y-3">
                  {docInfo.numberKey && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">{docInfo.numberLabel}</label>
                      <input
                        value={editValues[docInfo.numberKey] || ""}
                        onChange={e => setEditValues(prev => ({ ...prev, [docInfo.numberKey!]: e.target.value.toUpperCase() }))}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  )}
                  {docInfo.providerKey && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">{docInfo.providerLabel}</label>
                      <input
                        value={editValues[docInfo.providerKey] || ""}
                        onChange={e => setEditValues(prev => ({ ...prev, [docInfo.providerKey!]: e.target.value }))}
                        placeholder="Intact, Belairdirect..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
                      />
                    </div>
                  )}
                  {docInfo.policyKey && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">{docInfo.policyLabel}</label>
                      <input
                        value={editValues[docInfo.policyKey] || ""}
                        onChange={e => setEditValues(prev => ({ ...prev, [docInfo.policyKey!]: e.target.value }))}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Date d&apos;expiration</label>
                    <input
                      type="date"
                      value={editValues[docInfo.expiryKey] || ""}
                      onChange={e => setEditValues(prev => ({ ...prev, [docInfo.expiryKey]: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditDoc(null)}
                      className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">
                      Annuler
                    </button>
                    <button onClick={() => saveDocInfo(docInfo)} disabled={isSaving}
                      className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
