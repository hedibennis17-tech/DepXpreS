"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Car, FileText, DollarSign, Shield,
  CheckCircle2, XCircle, Clock, Wifi, WifiOff, Phone,
  Mail, MapPin, Star, Package, Loader2, AlertCircle,
  Send, RefreshCw, Camera, Bell
} from "lucide-react";
import Link from "next/link";

interface Driver {
  id: string; uid: string; name: string; email: string; phone: string;
  status: string; isOnline: boolean; driver_status: string;
  zone: string; rating: number; totalDeliveries: number;
  vehicle: string; photoUrl: string;
  // Données complètes du profil
  phone_raw?: string; address?: string; city?: string; postalCode?: string;
  zone_id?: string; zone_name?: string;
  vehicle_type?: string; vehicle_make?: string; vehicle_model?: string;
  vehicle_year?: number; vehicle_color?: string; vehicle_plate?: string;
  license_number?: string; license_expiry?: string;
  insurance_provider?: string; insurance_policy?: string; insurance_expiry?: string;
  registration_expiry?: string;
  wallet_balance?: number; total_paid?: number;
  application_status?: string; wizard_completed?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  draft:    "bg-gray-100 text-gray-600 border-gray-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  suspended:"bg-red-100 text-red-700 border-red-200",
};

const DOC_FIELDS = [
  { key: "license_number",       label: "Numéro de permis",         type: "text" },
  { key: "license_expiry",       label: "Expiration permis",         type: "date" },
  { key: "insurance_provider",   label: "Assureur",                  type: "text" },
  { key: "insurance_policy",     label: "Numéro de police",          type: "text" },
  { key: "insurance_expiry",     label: "Expiration assurance",      type: "date" },
  { key: "registration_expiry",  label: "Expiration immatriculation",type: "date" },
];

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.driverId as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profil"|"vehicule"|"documents"|"paiement">(
    ((typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null) as any) || "profil"
  );
  const [approving, setApproving] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string}|null>(null);
  const [notifSubject, setNotifSubject] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [docApproval, setDocApproval] = useState<Record<string,string>>({});
  const [docComment, setDocComment] = useState<Record<string,string>>({});
  const [savingDoc, setSavingDoc] = useState<Record<string,boolean>>({});

  async function sendNotification() {
    if (!notifMessage.trim()) return;
    setSending(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          driverId,
          driverName: driver?.name,
          email: driver?.email,
          phone: driver?.phone,
          subject: notifSubject || "Notification FastDép",
          message: notifMessage,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type:"ok", text:`✅ Notification envoyée — SMS: ${data.results?.sms || "—"} | Email: ${data.results?.email || "—"}` });
        setNotifSubject(""); setNotifMessage("");
      } else throw new Error(data.error);
    } catch(e) {
      setMsg({ type:"err", text: e instanceof Error ? e.message : "Erreur envoi" });
    } finally { setSending(false); }
  }

  async function saveDocApproval(key: string, status: string) {
    setSavingDoc(prev => ({ ...prev, [key]: true }));
    try {
      await fetch(`/api/admin/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          [`${key}_status`]: status,
          [`${key}_comment`]: docComment[key] || "",
        }),
      });
      setDocApproval(prev => ({ ...prev, [key]: status }));
      setMsg({ type:"ok", text: `✅ ${key === "license" ? "Permis" : key === "insurance" ? "Assurance" : "Immatriculation"} ${status === "approved" ? "approuvé" : "rejeté"}` });
    } catch { setMsg({ type:"err", text:"Erreur" }); }
    finally { setSavingDoc(prev => ({ ...prev, [key]: false })); }
  }

  // Paiement
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payType, setPayType] = useState<"driver_payment"|"store_payment">("driver_payment");
  const [payStore, setPayStore] = useState("");
  const [paying, setPaying] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, { credentials: "include" });
      const data = await res.json();
      if (data.driver) {
        setDriver(data.driver);
        setDocApproval({
          license: data.driver.license_status || "pending",
          insurance: data.driver.insurance_status || "pending",
          registration: data.driver.registration_status || "pending",
        });
        setDocComment({
          license: data.driver.license_comment || "",
          insurance: data.driver.insurance_comment || "",
          registration: data.driver.registration_comment || "",
        });
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [driverId]);

  async function setStatus(status: string) {
    setApproving(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ application_status: status }),
      });
      if (res.ok) {
        setDriver(d => d ? { ...d, status, application_status: status } : null);
        setMsg({ type:"ok", text: status === "approved" ? "✅ Chauffeur approuvé !" : `Statut mis à jour : ${status}` });
      }
    } catch { setMsg({ type:"err", text:"Erreur" }); }
    finally { setApproving(false); }
  }

  async function sendPayment() {
    if (!payAmount || parseFloat(payAmount) <= 0) { setMsg({ type:"err", text:"Montant invalide" }); return; }
    setPaying(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          driverId,
          driverName: driver?.name,
          amount: parseFloat(payAmount),
          type: payType,
          note: payNote,
          storeName: payStore,
          method: "interac",
          email: driver?.email,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type:"ok", text:`✅ Paiement de $${payAmount} enregistré et envoyé par Interac à ${driver?.email}` });
        setPayAmount(""); setPayNote(""); setPayStore("");
        load();
      } else throw new Error(data.error);
    } catch(e) { setMsg({ type:"err", text: e instanceof Error ? e.message : "Erreur paiement" }); }
    finally { setPaying(false); }
  }

  function docStatus(expiry: string | undefined): "valid"|"expiring"|"expired"|"missing" {
    if (!expiry) return "missing";
    const d = new Date(expiry);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff < 30) return "expiring";
    return "valid";
  }

  const DOC_STATUS_UI = {
    valid:    { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle2, label: "Valide" },
    expiring: { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: Clock, label: "Expire bientôt" },
    expired:  { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle, label: "Expiré" },
    missing:  { color: "text-gray-400", bg: "bg-gray-50 border-gray-200", icon: AlertCircle, label: "Manquant" },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (!driver) return (
    <div className="text-center py-12">
      <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500">Chauffeur introuvable</p>
      <Link href="/admin/drivers" className="text-orange-500 text-sm mt-2 block">← Retour</Link>
    </div>
  );

  const licenseStatus = docStatus(driver.license_expiry);
  const insuranceStatus = docStatus(driver.insurance_expiry);
  const registrationStatus = docStatus(driver.registration_expiry);
  const allDocsValid = [licenseStatus, insuranceStatus, registrationStatus].every(s => s === "valid");

  const TABS = [
    { id: "profil",       label: "Profil",       icon: User },
    { id: "vehicule",     label: "Véhicule",     icon: Car },
    { id: "documents",    label: "Documents",    icon: FileText },
    { id: "notification", label: "Notifier",     icon: Bell },
    { id: "paiement",     label: "Paiement",     icon: DollarSign },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 overflow-hidden flex items-center justify-center text-xl font-bold text-orange-500">
            {driver.photoUrl ? <img src={driver.photoUrl} alt="" className="w-full h-full object-cover" /> : driver.name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{driver.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[driver.status] || STATUS_COLORS.draft}`}>
                {driver.status}
              </span>
              <span className={`flex items-center gap-1 text-xs font-semibold ${driver.isOnline ? "text-green-600" : "text-gray-400"}`}>
                {driver.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {driver.isOnline ? "En ligne" : "Hors ligne"}
              </span>
              {driver.rating > 0 && (
                <span className="flex items-center gap-1 text-xs text-yellow-600">
                  <Star className="h-3 w-3 fill-yellow-400" />{driver.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl border hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm border ${
          msg.type==="ok" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {msg.type==="ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="h-3.5 w-3.5" />{t.label}
              {t.id === "documents" && !allDocsValid && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── PROFIL ── */}
      {tab === "profil" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><User className="h-4 w-4 text-orange-500" />Infos personnelles</h3>
            {[
              { icon: Mail, label: "Email", value: driver.email },
              { icon: Phone, label: "Téléphone", value: driver.phone },
              { icon: MapPin, label: "Zone", value: driver.zone_name || driver.zone },
              { icon: Package, label: "Livraisons", value: String(driver.totalDeliveries || 0) },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <r.icon className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">{r.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{r.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions approbation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Shield className="h-4 w-4 text-orange-500" />Approbation</h3>
            <div className={`p-3 rounded-xl border text-center ${STATUS_COLORS[driver.status] || STATUS_COLORS.draft}`}>
              <p className="text-sm font-bold capitalize">{driver.status || "draft"}</p>
              {!allDocsValid && <p className="text-xs mt-1">⚠️ Documents incomplets ou expirés</p>}
              {allDocsValid && <p className="text-xs mt-1">✅ Tous les documents sont valides</p>}
            </div>

            <div className="space-y-2">
              <button onClick={() => setStatus("approved")} disabled={approving}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Approuver le chauffeur
              </button>
              <button onClick={() => setStatus("rejected")} disabled={approving}
                className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 font-semibold py-2.5 rounded-xl text-sm transition-colors hover:bg-red-100">
                <XCircle className="h-4 w-4" /> Rejeter
              </button>
              <button onClick={() => setStatus("suspended")} disabled={approving}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors hover:bg-gray-100">
                <AlertCircle className="h-4 w-4" /> Suspendre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VÉHICULE ── */}
      {tab === "vehicule" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Car className="h-4 w-4 text-orange-500" />Informations du véhicule</h3>
          {!driver.vehicle_make ? (
            <div className="text-center py-8 text-gray-400">
              <Car className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">Aucun véhicule enregistré</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Type", value: driver.vehicle_type },
                { label: "Marque", value: driver.vehicle_make },
                { label: "Modèle", value: driver.vehicle_model },
                { label: "Année", value: driver.vehicle_year ? String(driver.vehicle_year) : "—" },
                { label: "Couleur", value: driver.vehicle_color },
                { label: "Plaque", value: driver.vehicle_plate },
              ].map(r => (
                <div key={r.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-1">{r.label}</p>
                  <p className="text-sm font-bold text-gray-900">{r.value || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {tab === "documents" && (
        <div className="space-y-4">
          {/* Résumé statut */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            allDocsValid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          }`}>
            {allDocsValid
              ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              : <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />}
            <div>
              <p className={`text-sm font-bold ${allDocsValid ? "text-green-700" : "text-yellow-700"}`}>
                {allDocsValid ? "✅ Tous les documents sont valides" : "⚠️ Certains documents nécessitent attention"}
              </p>
              <p className={`text-xs ${allDocsValid ? "text-green-600" : "text-yellow-600"}`}>
                Vérifiez les photos avant d&apos;approuver le chauffeur
              </p>
            </div>
          </div>

          {/* 3 documents */}
          {[
            {
              key: "license",
              title: "🪪 Permis de conduire",
              fields: [
                { label: "Numéro", value: driver.license_number },
                { label: "Expiration", value: driver.license_expiry },
              ],
              docUrl: driver.license_doc_url,
              status: licenseStatus,
            },
            {
              key: "insurance",
              title: "🛡️ Assurance automobile",
              fields: [
                { label: "Assureur", value: driver.insurance_provider },
                { label: "Numéro police", value: driver.insurance_policy },
                { label: "Expiration", value: driver.insurance_expiry },
              ],
              docUrl: driver.insurance_doc_url,
              status: insuranceStatus,
            },
            {
              key: "registration",
              title: "📋 Immatriculation véhicule",
              fields: [
                { label: "Expiration certificat", value: driver.registration_expiry },
              ],
              docUrl: driver.registration_doc_url,
              status: registrationStatus,
            },
          ].map(doc => {
            const ui = DOC_STATUS_UI[doc.status];
            const Icon = ui.icon;
            const approval = docApproval[doc.key] || "pending";
            const isSaving = savingDoc[doc.key];
            return (
              <div key={doc.key} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                approval === "approved" ? "border-green-200" :
                approval === "rejected" ? "border-red-200" : "border-gray-100"
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h3 className="text-sm font-bold text-gray-900">{doc.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${ui.bg} ${ui.color}`}>
                      <Icon className="h-3 w-3" />{ui.label}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      approval === "approved" ? "bg-green-100 text-green-700" :
                      approval === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {approval === "approved" ? "✅ Approuvé" : approval === "rejected" ? "❌ Rejeté" : "⏳ En attente"}
                    </span>
                  </div>
                </div>

                {/* Photo */}
                <div className="px-5 pt-4">
                  {doc.docUrl ? (
                    <a href={doc.docUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
                      <img src={doc.docUrl} alt={doc.title}
                        className="w-full h-48 object-contain rounded-xl border border-gray-100 bg-gray-50 group-hover:opacity-95 transition-opacity"
                        onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">🔍 Voir en plein écran ↗</span>
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50">
                      <AlertCircle className="h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-400 font-medium">Document non téléversé</p>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="px-5 pt-3 space-y-1.5">
                  {doc.fields.map(f => (
                    <div key={f.label} className="flex justify-between text-sm">
                      <span className="text-gray-400">{f.label}</span>
                      <span className={`font-semibold ${f.value ? "text-gray-900" : "text-red-400"}`}>{f.value || "⚠️ Non renseigné"}</span>
                    </div>
                  ))}
                </div>

                {/* Commentaire admin */}
                <div className="px-5 pt-3">
                  <textarea
                    value={docComment[doc.key] || ""}
                    onChange={e => setDocComment(prev => ({ ...prev, [doc.key]: e.target.value }))}
                    placeholder="Commentaire au chauffeur (ex: photo floue, document expiré...)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none text-gray-700 placeholder-gray-300"
                  />
                </div>

                {/* Boutons approbation individuelle */}
                <div className="px-5 py-4 grid grid-cols-2 gap-2">
                  <button onClick={() => saveDocApproval(doc.key, "approved")}
                    disabled={isSaving || approval === "approved"}
                    className={`flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all ${
                      approval === "approved"
                        ? "bg-green-100 text-green-600 border border-green-200 cursor-default"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    } disabled:opacity-60`}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {approval === "approved" ? "Approuvé ✅" : "Approuver"}
                  </button>
                  <button onClick={() => saveDocApproval(doc.key, "rejected")}
                    disabled={isSaving || approval === "rejected"}
                    className={`flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all ${
                      approval === "rejected"
                        ? "bg-red-100 text-red-600 border border-red-200 cursor-default"
                        : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                    } disabled:opacity-60`}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    {approval === "rejected" ? "Rejeté ❌" : "Rejeter"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Approbation globale */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setStatus("approved")} disabled={approving}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors disabled:opacity-50">
              {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approuver le chauffeur
            </button>
            <button onClick={() => setStatus("rejected")} disabled={approving}
              className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 font-bold py-3 rounded-2xl text-sm hover:bg-red-100 disabled:opacity-50">
              <XCircle className="h-4 w-4" /> Rejeter
            </button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION ── */}
      {tab === "notification" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Envoyer une notification</p>
                <p className="text-xs text-gray-400">SMS + Email + Notification in-app</p>
              </div>
            </div>

            {/* Destinataire */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Chauffeur</span>
                <span className="font-semibold text-gray-900">{driver.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">📧 Email</span>
                <span className="font-semibold text-gray-900">{driver.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">📱 SMS</span>
                <span className="font-semibold text-gray-900">{driver.phone || "Non renseigné"}</span>
              </div>
            </div>

            {/* Messages rapides */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">Messages rapides</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "✅ Compte approuvé", msg: "Votre compte chauffeur FastDép a été approuvé ! Vous pouvez maintenant recevoir des livraisons." },
                  { label: "📄 Document requis", msg: "Un ou plusieurs de vos documents nécessitent une mise à jour. Veuillez vous connecter à l'application." },
                  { label: "❌ Document rejeté", msg: "Un de vos documents a été rejeté. Veuillez téléverser un nouveau document dans l'application." },
                  { label: "⚠️ Compte suspendu", msg: "Votre compte a été temporairement suspendu. Contactez notre support pour plus d'informations." },
                ].map(t => (
                  <button key={t.label} onClick={() => { setNotifMessage(t.msg); setNotifSubject(t.label.replace(/[✅📄❌⚠️]/g,"").trim()); }}
                    className="text-xs bg-orange-50 border border-orange-200 text-orange-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Sujet</label>
              <input value={notifSubject} onChange={e => setNotifSubject(e.target.value)}
                placeholder="Ex: Mise à jour de votre compte"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>

            {/* Message */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Message *</label>
              <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)}
                placeholder="Votre message au chauffeur..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors resize-none" />
            </div>

            {/* Bouton envoyer */}
            <button onClick={sendNotification} disabled={sending || !notifMessage.trim()}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50">
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours...</> : <><Send className="h-4 w-4" />Envoyer SMS + Email + Notification</>}
            </button>
          </div>
        </div>
      )}

      {/* ── PAIEMENT ── */}
      {tab === "paiement" && (
        <div className="space-y-4">
          {/* Wallet stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">${(driver.wallet_balance || 0).toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">Solde wallet chauffeur</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">${(driver.total_paid || 0).toFixed(2)}</p>
              <p className="text-xs text-blue-600 mt-1">Total payé à ce jour</p>
            </div>
          </div>

          {/* Formulaire paiement */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-orange-500" /> Envoyer un paiement
            </h3>

            {/* Type de paiement */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-semibold">Type de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPayType("driver_payment")}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold text-center border-2 transition-all ${
                    payType === "driver_payment" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-100 text-gray-500"
                  }`}>
                  🚗 Paiement chauffeur<br />
                  <span className="text-[10px] font-normal">Gains livraisons</span>
                </button>
                <button onClick={() => setPayType("store_payment")}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold text-center border-2 transition-all ${
                    payType === "store_payment" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-500"
                  }`}>
                  🛒 Paiement commerce<br />
                  <span className="text-[10px] font-normal">Chauffeur paie à sa place</span>
                </button>
              </div>
            </div>

            {payType === "store_payment" && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-semibold">Nom du commerce *</label>
                <input value={payStore} onChange={e => setPayStore(e.target.value)}
                  placeholder="Ex: IGA Chomedey, Walmart Laval..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-semibold">Montant ($) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" step="0.01" min="0" value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-semibold">Note / Référence</label>
              <input value={payNote} onChange={e => setPayNote(e.target.value)}
                placeholder={payType === "store_payment" ? "Ex: Commande #DEP-123456" : "Ex: Paiement semaine du 14 avril"}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>

            {/* Info Interac */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              📧 Paiement Interac envoyé à : <strong>{driver.email}</strong>
              <br />Le chauffeur reçoit une notification email automatique.
            </div>

            <button onClick={sendPayment} disabled={paying || !payAmount}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50">
              {paying ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours...</> : <><Send className="h-4 w-4" />Envoyer ${payAmount || "0.00"} par Interac</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
