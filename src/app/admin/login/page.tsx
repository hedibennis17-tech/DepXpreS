"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

async function cleanFirebaseIndexedDB() {
  try {
    if (!indexedDB.databases) return;
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name && db.name.includes("firebase")) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  } catch {
    // ignore
  }
}

async function robustSignIn(email: string, password: string) {
  console.log("[v0] robustSignIn started");
  
  try {
    await cleanFirebaseIndexedDB();
    console.log("[v0] IndexedDB cleaned");
  } catch (err) {
    console.log("[v0] IndexedDB cleanup error:", err);
  }

  try {
    await signOut(auth);
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("[v0] Previous signOut done");
  } catch (err) {
    console.log("[v0] SignOut error (ignored):", err);
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("[v0] Persistence set to local");
  } catch (err) {
    console.log("[v0] Local persistence failed:", err);
    try {
      await setPersistence(auth, browserSessionPersistence);
      console.log("[v0] Persistence set to session");
    } catch (err2) {
      console.log("[v0] Session persistence also failed:", err2);
    }
  }

  console.log("[v0] Calling signInWithEmailAndPassword...");
  return signInWithEmailAndPassword(auth, email, password);
}

function getUserFriendlyMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
    case "auth/network-request-failed":
      return "Erreur réseau. Vérifiez votre connexion internet.";
    case "auth/internal-error":
      return "Erreur interne Firebase. Veuillez réessayer.";
    case "auth/user-disabled":
      return "Ce compte a été désactivé.";
    default:
      return "Erreur de connexion. Veuillez réessayer.";
  }
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    setLoading(true);
    console.log("[v0] handleSubmit started");

    try {
      console.log("[v0] Calling robustSignIn...");
      const userCredential = await robustSignIn(email, password);
      console.log("[v0] robustSignIn success, getting token...");
      const idToken = await userCredential.user.getIdToken(true);
      console.log("[v0] Got idToken, calling API...");

      const loginRes = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      const loginData = await loginRes.json().catch(() => null);

      if (!loginRes.ok || !loginData?.ok) {
        await signOut(auth).catch(() => {});
        setError(loginData?.error || "Accès refusé. Ce compte n'a pas les droits d'administration.");
        return;
      }

      setPassword("");
      router.replace(redirect);
      router.refresh();
    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(getUserFriendlyMessage(e.code || ""));
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">DepXpreS Admin</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                autoComplete="current-password"
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se Connecter"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-xs text-muted-foreground">
          Accès réservé à l'équipe DepXpreS (super admin, admin, dispatcher, agent)
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Chargement...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
