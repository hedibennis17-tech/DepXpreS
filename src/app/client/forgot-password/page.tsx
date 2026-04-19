"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError("Aucun compte trouvé avec cet email.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <Link href="/client/login" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
            <p className="text-gray-500 text-sm mb-6">Vérifiez votre boîte mail pour réinitialiser votre mot de passe.</p>
            <Link href="/client/login" className="text-orange-500 font-semibold text-sm">← Retour à la connexion</Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5">
              <Mail className="h-6 w-6 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-500 text-sm mb-6">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi...</> : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
