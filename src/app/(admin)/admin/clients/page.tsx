"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Eye, Users, ShoppingBag, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: string;
  totalOrders?: number;
  totalSpent?: number;
  isEmailVerified?: boolean;
  createdAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "Actif",    color: "bg-green-100 text-green-800" },
  inactive:  { label: "Inactif", color: "bg-gray-100 text-gray-800" },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-800" },
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [total, setTotal] = useState(0);

  const fetchClients = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const stats = {
    total,
    active: clients.filter((c) => c.status === "active").length,
    withOrders: clients.filter((c) => (c.totalOrders || 0) > 0).length,
    verified: clients.filter((c) => c.isEmailVerified).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">{total} client{total !== 1 ? "s" : ""} — Firebase temps réel</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchClients(true)} disabled={refreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-foreground", bg: "bg-gray-50 dark:bg-gray-800" },
          { label: "Actifs", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Avec commandes", value: stats.withOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Vérifiés", value: stats.verified, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={cn("border-0 shadow-sm", s.bg)}>
              <CardContent className="pt-3 pb-3 px-3">
                <div className="flex items-center gap-1 mb-1"><Icon className={cn("h-3 w-3", s.color)} /><p className="text-xs text-muted-foreground">{s.label}</p></div>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="text-base">Liste des clients</CardTitle>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nom, email, téléphone..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement depuis Firebase...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Users className="h-10 w-10 mb-2 opacity-30" /><p>Aucun client trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Total dépensé</TableHead>
                  <TableHead>Email vérifié</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const cfg = STATUS_CONFIG[client.status || "active"] ?? STATUS_CONFIG.active;
                  const initials = `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <TableRow key={client.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-sm">{client.firstName} {client.lastName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-muted-foreground truncate max-w-36">{client.email || "—"}</p>
                          <p className="text-xs text-muted-foreground">{client.phone || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={cn("border-0 text-xs", cfg.color)}>{cfg.label}</Badge></TableCell>
                      <TableCell><span className="text-sm font-medium">{client.totalOrders || 0}</span></TableCell>
                      <TableCell><span className="text-sm font-medium">${(client.totalSpent || 0).toFixed(2)}</span></TableCell>
                      <TableCell>
                        {client.isEmailVerified
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-gray-400" />}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString("fr-CA") : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); router.push(`/admin/clients/${client.id}`); }}>
                          <Eye className="h-3 w-3" /> Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
