"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Eye, Store, CheckCircle2, Star, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  status?: string;
  isOpen?: boolean;
  rating?: number;
  totalOrders?: number;
  totalRevenue?: number;
  zoneName?: string;
  createdAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:   { label: "Actif",    color: "bg-green-100 text-green-800" },
  inactive: { label: "Inactif", color: "bg-gray-100 text-gray-800" },
  pending:  { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  suspended:{ label: "Suspendu", color: "bg-red-100 text-red-800" },
};

export default function StoresPage() {
  const router = useRouter();
  const [allStores, setAllStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchStores = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      // Charger directement via Firebase Client SDK
      const snap = await getDocs(query(collection(db, "stores"), orderBy("name")));
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          name: raw.name || raw.storeName || "Dépanneur",
          address: raw.address || raw.fullAddress || "",
          phone: raw.phone || raw.phoneNumber || "",
          status: raw.status || "active",
          isOpen: raw.isOpen === true,
          rating: Number(raw.rating) || 0,
          totalOrders: Number(raw.totalOrders) || 0,
          totalRevenue: Number(raw.totalRevenue) || 0,
          zoneName: raw.zoneName || raw.zone || "",
          createdAt: raw.createdAt ? (typeof raw.createdAt === 'object' && 'toDate' in raw.createdAt ? (raw.createdAt as { toDate: () => Date }).toDate().toISOString() : String(raw.createdAt)) : "",
        } as StoreItem;
      });
      setAllStores(data);
    } catch (err) { console.error("Stores error:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  // Filtrage côté client
  const stores = allStores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.address || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: allStores.length,
    active: allStores.filter((s) => s.status === "active").length,
    open: allStores.filter((s) => s.isOpen).length,
    totalOrders: allStores.reduce((sum, s) => sum + (s.totalOrders || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépanneurs partenaires</h1>
          <p className="text-muted-foreground">{allStores.length} dépanneur{allStores.length !== 1 ? "s" : ""} — Firebase temps réel</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchStores(true)} disabled={refreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Store, color: "text-foreground", bg: "bg-gray-50 dark:bg-gray-800" },
          { label: "Actifs", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Ouverts maintenant", value: stats.open, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total commandes", value: stats.totalOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
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
            <CardTitle className="text-base">Liste des dépanneurs</CardTitle>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nom, adresse..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
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
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Store className="h-10 w-10 mb-2 opacity-30" /><p>Aucun dépanneur trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Dépanneur</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Ouvert</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Revenus</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => {
                  const cfg = STATUS_CONFIG[store.status || "active"] ?? STATUS_CONFIG.active;
                  return (
                    <TableRow key={store.id} className="hover:bg-muted/30">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Store className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{store.name}</p>
                            <p className="text-xs text-muted-foreground">{store.phone || "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm text-muted-foreground truncate max-w-40 block">{store.address || "—"}</span></TableCell>
                      <TableCell><Badge className={cn("border-0 text-xs", cfg.color)}>{cfg.label}</Badge></TableCell>
                      <TableCell>
                        {store.isOpen
                          ? <Badge className="text-xs bg-green-100 text-green-700 border-0">Ouvert</Badge>
                          : <Badge className="text-xs bg-gray-100 text-gray-600 border-0">Fermé</Badge>}
                      </TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{store.zoneName || "—"}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-sm font-medium">{(store.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-medium">{store.totalOrders || 0}</span></TableCell>
                      <TableCell><span className="text-sm font-medium">${(store.totalRevenue || 0).toFixed(2)}</span></TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={() => router.push(`/admin/stores/${store.id}`)}>
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
