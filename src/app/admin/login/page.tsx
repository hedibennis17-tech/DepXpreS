"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useRouter, useSearchParams } from "next/navigation"
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Suspense } from "react"

const ADMIN_ROLES = ["super_admin", "admin", "dispatcher", "agent"]

// Décoder le payload JWT Firebase sans vérification de signature
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4)
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// Définir un cookie côté client (lu par le middleware Next.js)
function setClientCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

// Nettoyer les bases IndexedDB Firebase corrompues
async function cleanFirebaseIndexedDB() {
  try {
    if (!indexedDB.databases) return
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name && db.name.includes("firebase")) {
        indexedDB.deleteDatabase(db.name)
      }
    }
  } catch {
    // Silencieux — certains navigateurs ne supportent pas indexedDB.databases()
  }
}

// AuthService robuste avec fallback de persistance
async function robustSignIn(email: string, password: string) {
  // Étape 1 : Nettoyer les données Firebase corrompues
  await cleanFirebaseIndexedDB()

  // Étape 2 : Déconnexion forcée pour nettoyer l'état
  try {
    await signOut(auth)
    await new Promise(r => setTimeout(r, 100))
  } catch {
    // Ignorer si pas de session active
  }

  // Étape 3 : Forcer la persistance sur localStorage (compatible tous navigateurs)
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch {
    try {
      // Fallback sur sessionStorage si localStorage bloqué
      await setPersistence(auth, browserSessionPersistence)
    } catch {
      // Continuer sans persistance explicite
    }
  }

  // Étape 4 : Connexion Firebase
  return await signInWithEmailAndPassword(auth, email, password)
}

function getUserFriendlyMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou mot de passe incorrect."
    case "auth/too-many-requests":
      return "Trop de tentatives. Veuillez réessayer dans quelques minutes."
    case "auth/network-request-failed":
      return "Erreur réseau. Vérifiez votre connexion internet."
    case "auth/internal-error":
      return "Erreur interne Firebase. Veuillez réessayer."
    case "auth/user-disabled":
      return "Ce compte a été désactivé."
    default:
      return "Erreur de connexion. Veuillez réessayer."
  }
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/admin/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email et mot de passe requis.")
      return
    }

    setLoading(true)
    try {
      // 1. Connexion Firebase Auth robuste (avec nettoyage IndexedDB + persistance forcée)
      const userCredential = await robustSignIn(email, password)

      // 2. Forcer le refresh du token pour obtenir les custom claims à jour
      const idToken = await userCredential.user.getIdToken(true)

      // 3. Décoder le JWT localement pour extraire le rôle
      const claims = decodeJWT(idToken)
      if (!claims) {
        setError("Erreur de décodage du token. Veuillez réessayer.")
        return
      }

      let role = (claims.role as string) || ""
      const uid = (claims.user_id as string) || (claims.sub as string) || ""

      // 4. Si pas de custom claim "role", vérifier via l'API (Firestore)
      if (!role || !ADMIN_ROLES.includes(role)) {
        try {
          const verifyRes = await fetch("/api/admin/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, uid, email }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.ok && verifyData.role && ADMIN_ROLES.includes(verifyData.role)) {
            role = verifyData.role
          } else {
            setError("Accès refusé. Ce compte n'a pas les droits d'administration.")
            return
          }
        } catch {
          setError("Accès refusé. Ce compte n'a pas les droits d'administration.")
          return
        }
      }

      // 5. Stocker le cookie de session (lu par le middleware Next.js)
      setClientCookie("admin_session", `${uid}:${role}`, 7)
      setClientCookie("admin_session_mw", `${uid}:${role}`, 7)
      setClientCookie("admin_token", idToken, 1)

      // 6. Appel API pour créer le cookie httpOnly côté serveur
      await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role }),
        credentials: "include",
      }).catch(() => {})

      // 7. Rediriger vers le dashboard admin
      router.push(redirect)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      setError(getUserFriendlyMessage(e.code || ""))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo className="h-16 w-16 text-primary-foreground" />
        </div>
        <Card className="bg-card text-card-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">DepXpreS Admin</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@depxpres.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError("") }}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se Connecter"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Accès réservé à l&apos;équipe DepXpreS (super admin, admin, dispatcher, agent)
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
