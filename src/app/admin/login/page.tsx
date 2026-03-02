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
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Suspense } from "react"

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
      // 1. Connexion Firebase Auth côté client
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // 2. Vérifier le rôle admin via l'API avec timeout de 10 secondes
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      let res: Response
      try {
        res = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchErr: unknown) {
        clearTimeout(timeoutId)
        const fe = fetchErr as Error
        if (fe.name === "AbortError") {
          // Timeout — décoder le JWT localement comme fallback
          const parts = idToken.split(".")
          const payload = parts[1] + "=".repeat((4 - parts[1].length % 4) % 4)
          const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
          const role = decoded.role || ""
          const adminRoles = ["super_admin", "admin", "dispatcher", "agent"]
          
          if (adminRoles.includes(role)) {
            // Stocker dans sessionStorage comme fallback
            sessionStorage.setItem("admin_uid", decoded.user_id || decoded.sub || "")
            sessionStorage.setItem("admin_role", role)
            sessionStorage.setItem("admin_email", decoded.email || "")
            sessionStorage.setItem("admin_name", decoded.name || "")
            router.push(redirect)
            return
          } else {
            setError("Accès refusé. Ce compte n'a pas les droits d'administration.")
            return
          }
        }
        throw fetchErr
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Accès refusé.")
        return
      }

      // 3. Rediriger vers le dashboard admin
      router.push(redirect)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password" ||
        e.code === "auth/invalid-credential"
      ) {
        setError("Email ou mot de passe incorrect.")
      } else if (e.code === "auth/too-many-requests") {
        setError("Trop de tentatives. Veuillez réessayer dans quelques minutes.")
      } else if (e.code === "auth/network-request-failed") {
        setError("Erreur réseau. Vérifiez votre connexion internet.")
      } else {
        setError("Erreur de connexion. Veuillez réessayer.")
      }
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
          Accès réservé à l'équipe DepXpreS (super admin, admin, dispatcher, agent)
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
