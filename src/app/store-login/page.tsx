"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function StoreLoginPage() {
  const router = useRouter();
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
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Vérifier le rôle dans app_users
      const userDoc = await getDoc(doc(db, "app_users", uid));
      if (!userDoc.exists()) {
        throw new Error("Compte introuvable. Contactez l'administrateur.");
      }

      const userData = userDoc.data();
      const role = userData.role || "";

      // Accepter store_owner, store_manager, ou super_admin
      if (!["store_owner", "store_manager", "super_admin"].includes(role)) {
        throw new Error("Accès refusé. Ce portail est réservé aux propriétaires de dépanneurs.");
      }

      // Stocker les infos du store dans localStorage pour l'app
      if (userData.storeId || userData.store_id) {
        localStorage.setItem("storeId", userData.storeId || userData.store_id);
      }
      localStorage.setItem("storeUserRole", role);
      localStorage.setItem("storeUserName", userData.displayName || userData.name || email);

      router.push("/store/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        setError("Email ou mot de passe incorrect.");
      } else if (msg.includes("auth/too-many-requests")) {
        setError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setError(msg);
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
          <h1 className="text-2xl font-bold text-gray-900">Espace Dépanneur</h1>
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

          <div className="mt-6 pt-5 border-t text-center">
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
