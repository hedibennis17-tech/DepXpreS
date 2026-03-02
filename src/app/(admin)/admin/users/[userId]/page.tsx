"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, UserX, UserCheck, Key, Shield, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  dispatcher: "Dispatcher",
  agent: "Agent Support",
  client: "Client",
  driver: "Chauffeur",
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.status === 401) { router.push("/admin/login"); return }
      if (res.status === 404) { setError("Utilisateur introuvable."); return }
      const data = await res.json()
      setUser(data)
    } catch {
      setError("Erreur lors du chargement.")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, extra?: Record<string, any>) => {
    setActionLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message)
        fetchUser()
        if (action === "reset_password") setResetDialogOpen(false)
      } else {
        setError(data.error || "Erreur lors de l'action.")
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Chargement...
      </div>
    )
  }

  if (!user && error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button asChild className="mt-4"><Link href="/admin/users">Retour</Link></Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {user?.firstName} {user?.lastName || "Utilisateur"}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>
      )}

      {/* Informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informations du compte</span>
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {user?.status === "active" ? "Actif" : "Bloqué"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ROLE_LABELS[user?.primary_role] || user?.primary_role}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user?.phone || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>UID: {user?.uid?.substring(0, 16)}...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Créé le {user?.created_at?._seconds
                  ? new Date(user.created_at._seconds * 1000).toLocaleDateString("fr-CA")
                  : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil lié */}
      {user?.profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profil lié</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(user.profile)
                .filter(([k]) => !["id", "userId", "createdAt", "updatedAt"].includes(k))
                .slice(0, 10)
                .map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}: </span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {user?.status !== "blocked" ? (
            <Button
              variant="destructive"
              onClick={() => handleAction("block")}
              disabled={actionLoading}
            >
              <UserX className="mr-2 h-4 w-4" />
              Bloquer le compte
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
              onClick={() => handleAction("unblock")}
              disabled={actionLoading}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Débloquer le compte
            </Button>
          )}

          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Réinitialiser le mot de passe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                <DialogDescription>
                  Définissez un nouveau mot de passe temporaire pour {user?.email}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="newPassword">Nouveau mot de passe (min 8 caractères)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Annuler</Button>
                <Button
                  onClick={() => handleAction("reset_password", { newPassword })}
                  disabled={actionLoading || newPassword.length < 8}
                >
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
