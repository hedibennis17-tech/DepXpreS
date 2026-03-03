"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Store, Shield, Truck, Headphones, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface StoreOption {
  id: string
  name: string
  address: string
  status: string
}

const ROLE_CONFIG: Record<string, {
  label: string
  description: string
  icon: React.ReactNode
  color: string
  app: string
}> = {
  admin: {
    label: "Administrateur",
    description: "Accès complet aux opérations : commandes, clients, chauffeurs, dépanneurs, zones, support, finances.",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-blue-50 border-blue-200 text-blue-800",
    app: "Panel Admin",
  },
  dispatcher: {
    label: "Dispatcher",
    description: "Gestion des commandes, assignation des chauffeurs, suivi dispatch et tracking en temps réel.",
    icon: <Truck className="h-5 w-5" />,
    color: "bg-orange-50 border-orange-200 text-orange-800",
    app: "Panel Admin",
  },
  agent: {
    label: "Agent Support",
    description: "Support client, gestion des tickets et litiges, accès lecture aux commandes et clients.",
    icon: <Headphones className="h-5 w-5" />,
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    app: "Panel Admin",
  },
  store_owner: {
    label: "Propriétaire Dépanneur",
    description: "Accès à l'application store pour gérer son dépanneur : commandes, catalogue, horaires, paiements et notifications.",
    icon: <Store className="h-5 w-5" />,
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    app: "App Store (/store)",
  },
}

function CreateUserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || ""

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: defaultRole,
    storeId: "",
    password: "",
    confirmPassword: "",
  })
  const [stores, setStores] = useState<StoreOption[]>([])
  const [loadingStores, setLoadingStores] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Charger les dépanneurs si rôle store_owner
  useEffect(() => {
    if (form.role === "store_owner") {
      setLoadingStores(true)
      fetch("/api/admin/stores")
        .then(r => r.json())
        .then(data => {
          setStores(data.stores || data.rows || [])
        })
        .catch(() => {})
        .finally(() => setLoadingStores(false))
    }
  }, [form.role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!form.email || !form.password || !form.role) {
      setError("Email, mot de passe et rôle sont obligatoires.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (form.role === "store_owner" && !form.storeId) {
      setError("Veuillez sélectionner le dépanneur associé à ce propriétaire.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          role: form.role,
          storeId: form.role === "store_owner" ? form.storeId : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.")
        return
      }

      const roleLabel = ROLE_CONFIG[form.role]?.label || form.role
      setSuccess(`Compte ${roleLabel} créé avec succès pour ${form.email}.`)
      setTimeout(() => router.push("/admin/users"), 2500)
    } catch {
      setError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRoleConfig = ROLE_CONFIG[form.role]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground">Réservé au Super Administrateur</p>
        </div>
      </div>

      {/* Sélection du rôle — cartes visuelles */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setForm({ ...form, role: key, storeId: "" }); setError("") }}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              form.role === key
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`p-1 rounded ${cfg.color}`}>{cfg.icon}</span>
              <span className="font-semibold text-sm">{cfg.label}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{cfg.description}</p>
            <Badge variant="outline" className="mt-2 text-xs">{cfg.app}</Badge>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            {form.role === "store_owner"
              ? "Le propriétaire du dépanneur se connectera via depxpres.vercel.app/store-login"
              : "L'équipe admin se connecte via depxpres.vercel.app/admin/login"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            {/* Sélection du dépanneur (store_owner uniquement) */}
            {form.role === "store_owner" && (
              <div className="space-y-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Label htmlFor="storeId" className="text-emerald-800 font-semibold">
                  Dépanneur associé <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.storeId}
                  onValueChange={v => { setForm({ ...form, storeId: v }); setError("") }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={loadingStores ? "Chargement..." : "Sélectionner un dépanneur"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        <div className="flex items-center gap-2">
                          <span>{store.name}</span>
                          <span className="text-xs text-muted-foreground">— {store.address || store.id}</span>
                          {store.status === "active" && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Actif</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {stores.length === 0 && !loadingStores && (
                      <SelectItem value="none" disabled>
                        Aucun dépanneur disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-emerald-700">
                  Ce propriétaire aura accès uniquement à ce dépanneur dans l&apos;app store.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Tremblay"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder={form.role === "store_owner" ? "proprietaire@depanneur.com" : "admin@depxpres.com"}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(514) 123-4567"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caractères"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Répétez le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Résumé des permissions */}
            {selectedRoleConfig && (
              <div className={`p-4 rounded-lg border ${selectedRoleConfig.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  {selectedRoleConfig.icon}
                  <span className="font-semibold text-sm">{selectedRoleConfig.label}</span>
                  <Badge variant="outline" className="text-xs">{selectedRoleConfig.app}</Badge>
                </div>
                <p className="text-xs mt-1">{selectedRoleConfig.description}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading || !form.role} className="flex-1">
                {loading ? "Création en cours..." : "Créer le compte"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/users">Annuler</Link>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

export default function CreateAdminUserPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <CreateUserForm />
    </Suspense>
  )
}
