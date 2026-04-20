"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function DriverSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 6) { setError("Mot de passe minimum 6 caractères."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/driver/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "EMAIL_ALREADY_EXISTS") { setError("Cet email est déjà utilisé."); return; }
        throw new Error(data.error || "Erreur");
      }
      // Auto-login après signup
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      router.push("/driver/onboarding");
    } catch(e: any) {
      setError(e.message || "Erreur lors de la création du compte.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{boxShadow:"0 0 24px rgba(249,115,22,0.4)"}}>
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Devenir chauffeur FastDép</h1>
          <p className="text-gray-400 text-sm mt-1">Créez votre compte en 30 secondes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { key:"firstName", placeholder:"Prénom", label:"Prénom *" },
              { key:"lastName",  placeholder:"Nom",    label:"Nom *" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
              </div>
            ))}
          </div>

          {[
            { key:"email",   type:"email",  placeholder:"votre@email.com", label:"Email *" },
            { key:"phone",   type:"tel",    placeholder:"514-555-0000",     label:"Téléphone *" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mot de passe *</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder="Minimum 6 caractères" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Confirmer le mot de passe *</label>
            <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)}
              placeholder="Répéter le mot de passe" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 placeholder-gray-600" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            style={{boxShadow:"0 0 24px rgba(249,115,22,0.3)"}}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Création du compte...</> : <><CheckCircle2 className="h-4 w-4" />Créer mon compte</>}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Déjà un compte ?{" "}
          <Link href="/driver/login" className="text-orange-400 font-semibold hover:text-orange-300">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
