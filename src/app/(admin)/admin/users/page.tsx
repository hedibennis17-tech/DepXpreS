"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, MoreHorizontal, UserCheck, UserX, Key, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AppUser {
  id: string
  uid: string
  email: string
  firstName: string
  lastName: string
  phone: string
  primary_role: string
  status: string
  is_email_verified: boolean
  last_login: any
  created_at: any
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur",
  dispatcher: "Dispatcher",
  agent: "Agent Support",
  store_owner: "Propriétaire Dépanneur",
  client: "Client",
  driver: "Chauffeur",
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  dispatcher: "bg-orange-100 text-orange-800",
  agent: "bg-yellow-100 text-yellow-800",
  store_owner: "bg-emerald-100 text-emerald-800",
  client: "bg-green-100 text-green-800",
  driver: "bg-cyan-100 text-cyan-800",
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800",
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const url = roleFilter && roleFilter !== "all"
        ? `/api/admin/users?role=${roleFilter}`
        : "/api/admin/users"
      const res = await fetch(url)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setError("Erreur lors du chargement des utilisateurs.")
    } finally {
      setLoading(false)
    }
  }, [roleFilter, router])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        fetchUsers()
      } else {
        setError(data.error || "Erreur lors de l'action.")
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    )
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => ["super_admin", "admin", "dispatcher", "agent"].includes(u.primary_role)).length,
    storeOwners: users.filter(u => u.primary_role === "store_owner").length,
    clients: users.filter(u => u.primary_role === "client").length,
    drivers: users.filter(u => u.primary_role === "driver").length,
    blocked: users.filter(u => u.status === "blocked").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez tous les comptes de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users/create?role=store_owner">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un dépanneur
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer un compte équipe
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Équipe Admin", value: stats.admins, color: "text-blue-600" },
          { label: "Dépanneurs", value: (stats as any).storeOwners, color: "text-emerald-600" },
          { label: "Clients", value: stats.clients, color: "text-green-600" },
          { label: "Chauffeurs", value: stats.drivers, color: "text-cyan-600" },
          { label: "Bloqués", value: stats.blocked, color: "text-red-600" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                <SelectItem value="agent">Agent Support</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="store_owner">Propriétaire Dépanneur</SelectItem>
                <SelectItem value="driver">Chauffeur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.id.substring(0, 8)}...</div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.phone || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.primary_role] || "bg-gray-100 text-gray-800"}`}>
                        {ROLE_LABELS[user.primary_role] || user.primary_role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status] || "bg-gray-100 text-gray-800"}`}>
                        {user.status === "active" ? "Actif" : user.status === "blocked" ? "Bloqué" : user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.created_at?._seconds
                        ? new Date(user.created_at._seconds * 1000).toLocaleDateString("fr-CA")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={actionLoading === user.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              <Shield className="mr-2 h-4 w-4" />
                              Voir le profil
                            </Link>
                          </DropdownMenuItem>
                          {user.status !== "blocked" ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleAction(user.id, "block")}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Bloquer
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleAction(user.id, "unblock")}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Débloquer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
