"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { User, Phone, Mail, Car, MapPin, Camera, Loader2, CheckCircle2, AlertCircle, Star, Package, DollarSign } from "lucide-react";
import { ACTIVE_ZONES } from "@/lib/delivery-zones";

export default function DriverProfile() {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string}|null>(null);
  const [form, setForm] = useState({ phone:"", vehicle_type:"", vehicle_make:"", vehicle_model:"", vehicle_year:"", vehicle_color:"", vehicle_plate:"", zone_id:"" });
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [uid, setUid] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setLoading(false); return; }
      setUid(u.uid);
      try {
        const [pDoc, uDoc] = await Promise.all([
          getDoc(doc(db, "driver_profiles", u.uid)),
          getDoc(doc(db, "app_users", u.uid)),
        ]);
        const p = pDoc.exists() ? pDoc.data() : {};
        const ud = uDoc.exists() ? uDoc.data() : {};
        const merged = { ...p, ...ud, uid: u.uid, email: u.email, full_name: p.full_name || ud.display_name || u.displayName };
        setDriver(merged);
        setForm({
          phone: p.phone || ud.phone || "",
          vehicle_type: p.vehicle_type || "",
          vehicle_make: p.vehicle_make || "",
          vehicle_model: p.vehicle_model || "",
          vehicle_year: p.vehicle_year || "",
          vehicle_color: p.vehicle_color || "",
          vehicle_plate: p.vehicle_plate || "",
          zone_id: p.current_zone_id || "",
        });
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  async function saveProfile() {
    setSaving(true); setMsg(null);
    try {
      await updateDoc(doc(db, "driver_profiles", uid), { ...form, updated_at: serverTimestamp() });
      await updateDoc(doc(db, "app_users", uid), { phone: form.phone, updated_at: serverTimestamp() });
      setMsg({ type:"ok", text:"Profil mis à jour ✅" });
    } catch(e){ setMsg({ type:"err", text:"Erreur lors de la sauvegarde" }); }
    finally { setSaving(false); }
  }

  async function changePassword() {
    if (pwForm.next !== pwForm.confirm) { setMsg({ type:"err", text:"Les mots de passe ne correspondent pas" }); return; }
    setSaving(true); setMsg(null);
    try {
      const user = auth.currentUser!;
      const cred = EmailAuthProvider.credential(user.email!, pwForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwForm.next);
      setMsg({ type:"ok", text:"Mot de passe changé ✅" });
      setPwForm({ current:"", next:"", confirm:"" });
    } catch(e: any){ setMsg({ type:"err", text: e.code === "auth/wrong-password" ? "Mot de passe actuel incorrect" : "Erreur" }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${msg.type==="ok" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
          {msg.type==="ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      {/* Avatar */}
      <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 text-center">
        <div className="w-20 h-20 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl font-bold text-orange-400 mx-auto mb-3 overflow-hidden">
          {driver?.photoUrl ? <img src={driver.photoUrl} alt="" className="w-full h-full object-cover" /> : driver?.full_name?.[0]?.toUpperCase() || "?"}
        </div>
        <h2 className="text-lg font-bold text-white">{driver?.full_name}</h2>
        <p className="text-gray-400 text-sm">{driver?.email}</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <p className="text-orange-400 font-bold">{driver?.rating_average?.toFixed(1) || "—"}</p>
            <p className="text-[10px] text-gray-500">Note</p>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-bold">{driver?.total_deliveries || 0}</p>
            <p className="text-[10px] text-gray-500">Livraisons</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold capitalize">{driver?.application_status || "—"}</p>
            <p className="text-[10px] text-gray-500">Statut</p>
          </div>
        </div>
      </div>

      {/* Infos personnelles */}
      <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><User className="h-4 w-4 text-orange-400" />Informations personnelles</h3>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
          <input value={form.phone} onChange={e => set("phone", e.target.value)}
            placeholder="514-555-0000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Zone de livraison</label>
          <select value={form.zone_id} onChange={e => set("zone_id", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
            <option value="">Sélectionner une zone...</option>
            {["laval","montreal","longueuil"].map(g => (
              <optgroup key={g} label={g.charAt(0).toUpperCase()+g.slice(1)}>
                {ACTIVE_ZONES.filter(z => z.delivery_zone_group === g).map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Véhicule */}
      <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Car className="h-4 w-4 text-orange-400" />Véhicule</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key:"vehicle_make", label:"Marque", placeholder:"Toyota" },
            { key:"vehicle_model", label:"Modèle", placeholder:"Corolla" },
            { key:"vehicle_year", label:"Année", placeholder:"2020" },
            { key:"vehicle_color", label:"Couleur", placeholder:"Blanc" },
            { key:"vehicle_plate", label:"Plaque", placeholder:"ABC-1234" },
          ].map(f => (
            <div key={f.key} className={f.key === "vehicle_plate" ? "col-span-2" : ""}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={saveProfile} disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Sauvegarde...</> : <><CheckCircle2 className="h-4 w-4" />Sauvegarder le profil</>}
      </button>

      {/* Changer mot de passe */}
      <div className="bg-[#1a1a1a] rounded-3xl p-5 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white">🔒 Changer le mot de passe</h3>
        {["current","next","confirm"].map((k,i) => (
          <input key={k} type="password" value={(pwForm as any)[k]}
            onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
            placeholder={["Mot de passe actuel","Nouveau mot de passe","Confirmer"][i]}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
        ))}
        <button onClick={changePassword} disabled={saving}
          className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-2xl text-sm transition-colors">
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}
