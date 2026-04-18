"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";


import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StoreLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign in Firebase
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // 2. Appeler l'API server-side qui set le cookie httpOnly
      const res = await fetch("/api/auth/store/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        await signOut(auth).catch(() => {});
        setError(`[${res.status}] ${data?.error || 'Erreur inconnue'}`);
        return;
      }

      // 3. Stocker dans localStorage pour l'app store
      localStorage.setItem("storeId", data.storeId || cred.user.uid);
      localStorage.setItem("storeUserRole", data.role || "store_owner");
      localStorage.setItem("storeUserName", data.storeName || email);

      // 4. Rediriger selon statut
      if (data.storeStatus === "pending") {
        router.push("/store/pending");
      } else {
        router.push("/store/dashboard");
      }
      router.refresh();

    } catch (err: unknown) {
      const e = err as { code?: string };
      const code = e.code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("Email ou mot de passe incorrect.");
      } else if (code.includes("too-many-requests")) {
        setError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setError(`[${code}] ${(err as {message?:string}).message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-4 shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Commercants Partenaires</h1>
          <p className="text-gray-500 mt-1 text-sm">Connectez-vous pour gérer votre dépanneur</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse courriel
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connexion...</>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {registered && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
              ✅ Compte créé avec succès ! Connectez-vous ci-dessous.
            </div>
          )}
          <div className="mt-6 pt-5 border-t text-center space-y-2">
            <p className="text-sm text-gray-500">
              Pas encore partenaire ?{" "}
              <Link href="/store-signup" className="text-orange-500 hover:underline font-medium">
                Créer votre espace
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              Problème de connexion ?{" "}
              <a href="mailto:support@fastdep.ca" className="text-orange-500 hover:underline">
                Contacter le support
              </a>
            </p>
          </div>
        </div>

        {/* Lien admin */}
        <p className="text-center mt-4 text-xs text-gray-400">
          Vous êtes administrateur ?{" "}
          <a href="/admin" className="text-orange-500 hover:underline">
            Panel Admin →
          </a>
        </p>
      </div>
    </div>
  );
}

export default function StoreLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
      <StoreLoginForm />
    </Suspense>
  );
}
