"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  ShoppingBag, DollarSign, Truck, Users, RefreshCw, TrendingUp,
  CheckCircle2, XCircle, Clock, Store, Wifi, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  completedToday: number;
  cancelledToday: number;
  avgDeliveryTime: number;
  totalDrivers: number;
  onlineDrivers: number;
  busyDrivers: number;
  availableDrivers: number;
  totalClients: number;
  activeClients: number;
  totalStores: number;
  openStores: number;
  weeklyChart: Array<{ date: string; label: string; orders: number; revenue: number; completed: number }>;
  recentOrders: Array<Record<string, unknown>>;
  activeOrdersList: Array<Record<string, unknown>>;
  topDrivers: Array<Record<string, unknown>>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:               { label: "En attente",        color: "bg-yellow-100 text-yellow-800" },
  confirmed:             { label: "Confirmée",         color: "bg-blue-100 text-blue-800" },
  preparing:             { label: "Préparation",       color: "bg-orange-100 text-orange-800" },
  ready:                 { label: "Prête",             color: "bg-cyan-100 text-cyan-800" },
  driver_assigned:       { label: "Chauffeur assigné", color: "bg-purple-100 text-purple-800" },
  driver_en_route_store: { label: "En route magasin",  color: "bg-indigo-100 text-indigo-800" },
  at_store:              { label: "Au magasin",        color: "bg-violet-100 text-violet-800" },
  en_route:              { label: "En route client",   color: "bg-blue-100 text-blue-800" },
  delivered:             { label: "Livré",             color: "bg-green-100 text-green-800" },
  completed:             { label: "Complété",          color: "bg-emerald-100 text-emerald-800" },
  cancelled:             { label: "Annulé",            color: "bg-red-100 text-red-800" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      // Charger les données directement via Firebase Client SDK (côté navigateur)
      const [ordersSnap, driversSnap, clientsSnap, storesSnap] = await Promise.all([
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200))),
        getDocs(collection(db, "driver_profiles")),
        getDocs(collection(db, "client_profiles")),
        getDocs(collection(db, "stores")),
      ]);

      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
      const ACTIVE_STATUSES = ["pending","confirmed","preparing","ready","driver_assigned","driver_en_route_store","at_store","en_route"];
      const COMPLETED_STATUSES = ["delivered","completed"];

      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>;
      const drivers = driversSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>;
      const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>;
      const stores = storesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>;

      const processedOrders = orders.map(o => ({
        id: o.id as string,
        status: (o.status as string) || "pending",
        total: Number(o.total) || 0,
        createdAt: o.createdAt ? (typeof o.createdAt === 'object' && 'toDate' in (o.createdAt as object) ? (o.createdAt as { toDate: () => Date }).toDate().toISOString() : String(o.createdAt)) : null,
        clientName: (o.clientName as string) || "Client",
        driverName: (o.driverName as string) || null,
        storeName: (o.storeName as string) || null,
        orderNumber: (o.orderNumber as string) || null,
        paymentStatus: (o.paymentStatus as string) || null,
      }));

      const todayOrders = processedOrders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
      const weekOrders = processedOrders.filter(o => o.createdAt && new Date(o.createdAt) >= weekStart);

      const weeklyChart = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
        const dayOrders = processedOrders.filter(o => { if (!o.createdAt) return false; const d = new Date(o.createdAt); return d >= day && d <= dayEnd; });
        weeklyChart.push({
          date: day.toISOString().split("T")[0],
          label: day.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric" }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
          completed: dayOrders.filter(o => COMPLETED_STATUSES.includes(o.status)).length,
        });
      }

      const json: DashboardData = {
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
        weekOrders: weekOrders.length,
        weekRevenue: weekOrders.reduce((sum, o) => sum + o.total, 0),
        totalOrders: processedOrders.length,
        totalRevenue: processedOrders.reduce((sum, o) => sum + o.total, 0),
        totalCommission: processedOrders.reduce((sum, o) => sum + (o.deliveryFee || 5) * 0.20, 0),
        totalDriverPayouts: processedOrders.reduce((sum, o) => sum + (o.driverFee || (o.deliveryFee || 5) * 0.80), 0),
        activeOrders: processedOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
        completedToday: todayOrders.filter(o => COMPLETED_STATUSES.includes(o.status)).length,
        cancelledToday: todayOrders.filter(o => o.status === "cancelled").length,
        avgDeliveryTime: 35,
        totalDrivers: drivers.length,
        onlineDrivers: drivers.filter(d => d.isOnline === true).length,
        busyDrivers: drivers.filter(d => d.status === "busy" || d.currentOrderId).length,
        availableDrivers: drivers.filter(d => d.isOnline === true && !d.currentOrderId).length,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.isActive !== false).length,
        totalStores: stores.length,
        openStores: stores.filter(s => s.isOpen === true).length,
        weeklyChart,
        recentOrders: [...processedOrders].sort((a, b) => { if (!a.createdAt || !b.createdAt) return 0; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); }).slice(0, 10),
        activeOrdersList: processedOrders.filter(o => ACTIVE_STATUSES.includes(o.status)).slice(0, 10),
        topDrivers: drivers.map(d => ({ id: d.id, name: (d.displayName as string) || (d.name as string) || "Chauffeur", completedOrders: Number(d.completedOrders) || 0, rating: Number(d.rating) || 0, isOnline: d.isOnline === true })).sort((a, b) => b.completedOrders - a.completedOrders).slice(0, 5),
      };

      setData(json);
      setLastUpdated(new Date());
    } catch (err) { console.error("Dashboard error:", err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement des données Firebase...</span>
      </div>
    );
  }

  if (!data) return <div className="text-center py-16 text-muted-foreground">Erreur de chargement</div>;

  const kpis = [
    { label: "Commandes aujourd'hui", value: data.todayOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", sub: `${data.completedToday} complétées` },
    { label: "Revenus aujourd'hui", value: `$${data.todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", sub: `$${data.weekRevenue.toFixed(2)} cette semaine` },
    { label: "Commandes actives", value: data.activeOrders, icon: Package, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", sub: `${data.cancelledToday} annulées aujourd'hui` },
    { label: "Chauffeurs en ligne", value: data.onlineDrivers, icon: Truck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", sub: `${data.availableDrivers} disponibles · ${data.busyDrivers} en livraison` },
    { label: "Clients actifs", value: data.activeClients, icon: Users, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", sub: `${data.totalClients} inscrits au total` },
    { label: "Dépanneurs ouverts", value: data.openStores, icon: Store, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", sub: `${data.totalStores} partenaires au total` },
    { label: "Temps moyen livraison", value: `${data.avgDeliveryTime} min`, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", sub: "Estimation moyenne" },
    { label: "Revenus totaux", value: `$${data.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", sub: `${data.totalOrders} commandes au total` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm">
            {lastUpdated ? `Mis à jour ${lastUpdated.toLocaleTimeString("fr-CA", { timeStyle: "short" })} — actualisation auto toutes les 30s` : "Firebase temps réel"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchDashboard(true)} disabled={refreshing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={cn("border-0 shadow-sm", kpi.bg)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                    <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <Icon className={cn("h-5 w-5", kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" /> Commandes — 7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [value, name === "orders" ? "Commandes" : "Complétées"]} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="orders" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Revenus — 7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenus"]} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" /> Commandes récentes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => router.push("/admin/orders")}>
                Voir tout →
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune commande</p>
                ) : data.recentOrders.map((order: Record<string, unknown>) => {
                  const cfg = STATUS_CONFIG[order.status as string] ?? STATUS_CONFIG.pending;
                  return (
                    <div key={order.id as string}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium font-mono">{(order.orderNumber as string) || (order.id as string)?.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{(order.clientName as string) || "Client"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${(Number(order.total) || 0).toFixed(2)}</p>
                        <Badge className={cn("text-xs border-0 mt-0.5", cfg.color)}>{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" /> Commandes actives ({data.activeOrders})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.activeOrdersList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune commande active</p>
              ) : (
                <div className="divide-y max-h-48 overflow-y-auto">
                  {data.activeOrdersList.map((order: Record<string, unknown>) => {
                    const cfg = STATUS_CONFIG[order.status as string] ?? STATUS_CONFIG.pending;
                    return (
                      <div key={order.id as string}
                        className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}>
                        <div>
                          <p className="text-xs font-medium font-mono">{(order.orderNumber as string) || (order.id as string)?.slice(0, 8)}</p>
                          <Badge className={cn("text-xs border-0 mt-0.5", cfg.color)}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm font-medium">${(Number(order.total) || 0).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-500" /> Chauffeurs en ligne ({data.onlineDrivers})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.topDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun chauffeur en ligne</p>
              ) : (
                <div className="divide-y">
                  {data.topDrivers.map((driver: Record<string, unknown>) => (
                    <div key={driver.id as string}
                      className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/admin/drivers/${driver.id}`)}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                          <Truck className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{driver.firstName as string} {driver.lastName as string}</p>
                          <p className="text-xs text-muted-foreground">{driver.zoneName as string || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {driver.currentOrderId ? (
                          <Badge className="text-xs bg-purple-100 text-purple-700 border-0">En livraison</Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Wifi className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">Libre</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">⭐ {(driver.rating as number || 0).toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Résumé semaine</p>
              <div className="space-y-2">
                {[
                  { label: "Commandes", value: data.weekOrders, icon: ShoppingBag, color: "text-blue-600" },
                  { label: "Revenus", value: `$${data.weekRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
                  { label: "Complétées", value: data.completedToday, icon: CheckCircle2, color: "text-emerald-600" },
                  { label: "Annulations", value: data.cancelledToday, icon: XCircle, color: "text-red-600" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", s.color)} />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <span className={cn("text-sm font-semibold", s.color)}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
