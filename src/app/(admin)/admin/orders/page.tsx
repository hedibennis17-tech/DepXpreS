"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Filter, Eye, Package, Truck, CheckCircle2, XCircle, Clock,
  RefreshCw, AlertCircle, TrendingUp, DollarSign, Users, ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber?: string;
  clientName?: string;
  driverName?: string;
  storeName?: string;
  status: string;
  paymentStatus?: string;
  total?: number;
  deliveryFee?: number;
  createdAt?: string;
  restrictedItemsPresent?: boolean;
}

interface Metrics {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveringOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  grossTotal: number;
  todayOrders: number;
  todayRevenue: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:              { label: "En attente",       color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  confirmed:            { label: "Confirmée",        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  preparing:            { label: "Préparation",      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Package },
  ready:                { label: "Prête",            color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400", icon: Package },
  driver_assigned:      { label: "Chauffeur assigné",color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  driver_en_route_store:{ label: "En route magasin", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Truck },
  at_store:             { label: "Au magasin",       color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400", icon: Package },
  en_route:             { label: "En route",         color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Truck },
  delivered:            { label: "Livré",            color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  completed:            { label: "Complété",         color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  cancelled:            { label: "Annulé",           color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  refunded:             { label: "Remboursé",        color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400", icon: XCircle },
  disputed:             { label: "Litige",           color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", icon: AlertCircle },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  pending:            { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  paid:               { label: "Payé",       color: "bg-green-100 text-green-700" },
  refunded:           { label: "Remboursé",  color: "bg-red-100 text-red-700" },
  partially_refunded: { label: "Part. remb.", color: "bg-orange-100 text-orange-700" },
  failed:             { label: "Échoué",     color: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("orderStatus", statusFilter);
      if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter);

      const [ordersRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/orders?${params}`),
        fetch("/api/admin/orders/metrics"),
      ]);

      const ordersData = await ordersRes.json();
      const metricsData = await metricsRes.json();

      setOrders(ordersData.rows || []);
      setTotal(ordersData.total || 0);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const statCards = metrics
    ? [
        { label: "Total", value: metrics.totalOrders, color: "text-foreground", icon: ShoppingBag, bg: "bg-gray-50 dark:bg-gray-800" },
        { label: "En attente", value: metrics.pendingOrders, color: "text-yellow-600", icon: Clock, bg: "bg-yellow-50 dark:bg-yellow-900/20" },
        { label: "En livraison", value: metrics.deliveringOrders, color: "text-blue-600", icon: Truck, bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Complétées", value: metrics.completedOrders, color: "text-green-600", icon: CheckCircle2, bg: "bg-green-50 dark:bg-green-900/20" },
        { label: "Annulées", value: metrics.cancelledOrders, color: "text-red-600", icon: XCircle, bg: "bg-red-50 dark:bg-red-900/20" },
        { label: "Revenus bruts", value: `$${(metrics.grossTotal || 0).toFixed(2)}`, color: "text-emerald-600", icon: DollarSign, bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Aujourd'hui", value: metrics.todayOrders, color: "text-purple-600", icon: TrendingUp, bg: "bg-purple-50 dark:bg-purple-900/20" },
        { label: "Rev. aujourd'hui", value: `$${(metrics.todayRevenue || 0).toFixed(2)}`, color: "text-indigo-600", icon: DollarSign, bg: "bg-indigo-50 dark:bg-indigo-900/20" },
      ]
    : [];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            {total} commande{total !== 1 ? "s" : ""} au total — données en temps réel Firebase
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className={cn("border-0 shadow-sm", s.bg)}>
                <CardContent className="pt-3 pb-3 px-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className={cn("h-3 w-3", s.color)} />
                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  </div>
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters + Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <CardTitle className="text-base">Liste des commandes</CardTitle>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="N° commande, client, chauffeur..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-44 h-9">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="preparing">Préparation</SelectItem>
                  <SelectItem value="driver_assigned">Chauffeur assigné</SelectItem>
                  <SelectItem value="en_route">En route</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="disputed">Litige</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous paiements</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
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
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mb-2 opacity-30" />
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Magasin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus || "pending"] ?? PAYMENT_CONFIG.pending;
                  const Icon = statusCfg.icon;
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">
                            {order.orderNumber || order.id}
                          </span>
                          {order.restrictedItemsPresent && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 px-1 py-0">
                              18+
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {order.clientName || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.driverName || <span className="italic text-xs">Non assigné</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-28 block">
                          {order.storeName || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1 border-0 text-xs", statusCfg.color)}>
                          <Icon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0 text-xs", paymentCfg.color)}>
                          {paymentCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${(order.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("fr-CA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/orders/${order.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} sur {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
