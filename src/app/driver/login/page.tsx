"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Zap, Loader2, AlertCircle } from "lucide-react"

export default function DriverLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Email et mot de passe requis."); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/driver/dashboard")
    } catch (err: any) {
      if (["auth/user-not-found","auth/wrong-password","auth/invalid-credential"].includes(err.code)) {
        setError("Email ou mot de passe incorrect.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Trop de tentatives. Réessayez dans quelques minutes.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Pas de connexion réseau. Vérifiez votre internet.")
      } else {
        setError("Erreur de connexion. Réessayez.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center"
          style={{ boxShadow: "0 0 40px rgba(249,115,22,0.5)" }}
        >
          <Zap className="h-8 w-8 text-white fill-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">FastDép</p>
          <p className="text-sm text-orange-400 font-semibold">Espace Chauffeur</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 space-y-5">
        <h1 className="text-lg font-bold text-white">Connexion</h1>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="chauffeur@exemple.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              required
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Mot de passe</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              required
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</> : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Pas encore chauffeur?{" "}
          <Link href="/driver/signup" className="text-orange-400 font-semibold hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
