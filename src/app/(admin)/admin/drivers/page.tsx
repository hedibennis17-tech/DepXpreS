"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, RefreshCw, Eye, Truck, CheckCircle2, Clock,
  Star, Users, Wifi, WifiOff, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  applicationStatus?: string;
  isOnline?: boolean;
  rating?: number;
  totalDeliveries?: number;
  currentOrderId?: string;
  zoneName?: string;
  vehicleMake?: string;
  vehicleModel?: string;
}

const APP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "En attente",  color: "bg-yellow-100 text-yellow-800" },
  approved:   { label: "Approuvé",   color: "bg-green-100 text-green-800" },
  rejected:   { label: "Rejeté",     color: "bg-red-100 text-red-800" },
  suspended:  { label: "Suspendu",   color: "bg-orange-100 text-orange-800" },
  incomplete: { label: "Incomplet",  color: "bg-gray-100 text-gray-800" },
};

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState("all");
  const [total, setTotal] = useState(0);

  const fetchDrivers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("applicationStatus", statusFilter);
      if (onlineFilter !== "all") params.set("isOnline", onlineFilter);
      const res = await fetch(`/api/admin/drivers?${params}`);
      const data = await res.json();
      setDrivers(data.drivers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, onlineFilter]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);
  useEffect(() => {
    const interval = setInterval(() => fetchDrivers(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  const stats = {
    total,
    online: drivers.filter((d) => d.isOnline).length,
    available: drivers.filter((d) => d.isOnline && !d.currentOrderId).length,
    busy: drivers.filter((d) => d.isOnline && d.currentOrderId).length,
    approved: drivers.filter((d) => d.applicationStatus === "approved").length,
    pending: drivers.filter((d) => d.applicationStatus === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chauffeurs</h1>
          <p className="text-muted-foreground">{total} chauffeur{total !== 1 ? "s" : ""} — Firebase temps réel</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchDrivers(true)} disabled={refreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", icon: Users, bg: "bg-gray-50 dark:bg-gray-800" },
          { label: "En ligne", value: stats.online, color: "text-green-600", icon: Wifi, bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Disponibles", value: stats.available, color: "text-blue-600", icon: CheckCircle2, bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "En livraison", value: stats.busy, color: "text-purple-600", icon: Truck, bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Approuvés", value: stats.approved, color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "En attente", value: stats.pending, color: "text-yellow-600", icon: Clock, bg: "bg-yellow-50 dark:bg-yellow-900/20" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={cn("border-0 shadow-sm", s.bg)}>
              <CardContent className="pt-3 pb-3 px-3">
                <div className="flex items-center gap-1 mb-1">
                  <Icon className={cn("h-3 w-3", s.color)} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="text-base">Liste des chauffeurs</CardTitle>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nom, email, téléphone..." className="pl-9 h-9" value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={onlineFilter} onValueChange={setOnlineFilter}>
                <SelectTrigger className="w-36 h-9"><SelectValue placeholder="En ligne" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">En ligne</SelectItem>
                  <SelectItem value="false">Hors ligne</SelectItem>
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
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Truck className="h-10 w-10 mb-2 opacity-30" />
              <p>Aucun chauffeur trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Chauffeur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>En ligne</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Livraisons</TableHead>
                  <TableHead>Commande active</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => {
                  const appCfg = APP_STATUS_CONFIG[driver.applicationStatus || "pending"] ?? APP_STATUS_CONFIG.pending;
                  const initials = `${driver.firstName?.[0] || ""}${driver.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <TableRow key={driver.id} className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/admin/drivers/${driver.id}`)}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{driver.firstName} {driver.lastName}</p>
                            {driver.vehicleMake && (
                              <p className="text-xs text-muted-foreground">{driver.vehicleMake} {driver.vehicleModel}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-muted-foreground truncate max-w-36">{driver.email || "—"}</p>
                          <p className="text-xs text-muted-foreground">{driver.phone || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0 text-xs", appCfg.color)}>{appCfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {driver.isOnline ? (
                            <><Wifi className="h-3.5 w-3.5 text-green-500" /><span className="text-xs text-green-600 font-medium">En ligne</span></>
                          ) : (
                            <><WifiOff className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-muted-foreground">Hors ligne</span></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{driver.zoneName || "—"}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-sm font-medium">{(driver.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-medium">{driver.totalDeliveries || 0}</span></TableCell>
                      <TableCell>
                        {driver.currentOrderId ? (
                          <Badge className="text-xs bg-purple-100 text-purple-700 border-0 gap-1">
                            <Package className="h-3 w-3" />En livraison
                          </Badge>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/drivers/${driver.id}`); }}>
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
