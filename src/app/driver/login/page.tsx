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
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function DriverLoginPage() {
  const router = useRouter()
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
      // Auth Firebase directement — pas d'appel API intermédiaire (plus rapide)
      await signInWithEmailAndPassword(auth, email, password)
      // Le layout /driver va vérifier le rôle et rediriger si besoin
      router.push("/driver/dashboard")
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email ou mot de passe incorrect.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Trop de tentatives. Veuillez réessayer dans quelques minutes.")
      } else {
        setError("Erreur de connexion. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Connexion Chauffeur</CardTitle>
        <CardDescription>
          Connectez-vous à votre espace chauffeur DepXpreS.
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
              placeholder="chauffeur@exemple.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
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
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Connexion en cours..." : "Se Connecter"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Pas encore chauffeur?{" "}
            <Link href="/driver/signup" className="font-medium text-primary hover:underline">
              Inscrivez-vous
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
