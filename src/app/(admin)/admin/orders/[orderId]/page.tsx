"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, RefreshCw, Package, Truck, CheckCircle2, XCircle, Clock,
  User, Store, MapPin, CreditCard, MessageSquare, AlertCircle, UserCheck,
  DollarSign, Phone, Mail, ShoppingBag, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetail {
  order: Record<string, unknown>;
  payment: Record<string, unknown> | null;
  client: Record<string, unknown> | null;
  driver: Record<string, unknown> | null;
  store: Record<string, unknown> | null;
  zone: Record<string, unknown> | null;
}

interface OrderItem {
  id: string;
  productName: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  requiresAgeVerification?: boolean;
}

interface StatusHistory {
  id: string;
  fromStatus?: string;
  toStatus: string;
  changedByType: string;
  note?: string;
  createdAt?: string;
}

interface CandidateDriver {
  id: string;
  firstName: string;
  lastName: string;
  rating?: number;
  totalDeliveries?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:               { label: "En attente",        color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed:             { label: "Confirmée",         color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  preparing:             { label: "Préparation",       color: "bg-orange-100 text-orange-800", icon: Package },
  ready:                 { label: "Prête",             color: "bg-cyan-100 text-cyan-800", icon: Package },
  driver_assigned:       { label: "Chauffeur assigné", color: "bg-purple-100 text-purple-800", icon: Truck },
  driver_en_route_store: { label: "En route magasin",  color: "bg-indigo-100 text-indigo-800", icon: Truck },
  at_store:              { label: "Au magasin",        color: "bg-violet-100 text-violet-800", icon: Package },
  en_route:              { label: "En route client",   color: "bg-blue-100 text-blue-800", icon: Truck },
  delivered:             { label: "Livré",             color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  completed:             { label: "Complété",          color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cancelled:             { label: "Annulé",            color: "bg-red-100 text-red-800", icon: XCircle },
  refunded:              { label: "Remboursé",         color: "bg-pink-100 text-pink-800", icon: XCircle },
  disputed:              { label: "Litige",            color: "bg-rose-100 text-rose-800", icon: AlertCircle },
};

const STATUS_FLOW = [
  "pending","confirmed","preparing","ready",
  "driver_assigned","driver_en_route_store","at_store","en_route","delivered","completed",
];

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();

  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [candidates, setCandidates] = useState<CandidateDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [detailRes, itemsRes, historyRes, candidatesRes] = await Promise.all([
        fetch(`/api/admin/orders/${orderId}`),
        fetch(`/api/admin/orders/${orderId}/items`),
        fetch(`/api/admin/orders/${orderId}/history`),
        fetch(`/api/admin/orders/${orderId}/candidate-drivers`),
      ]);
      const [detailData, itemsData, historyData, candidatesData] = await Promise.all([
        detailRes.json(), itemsRes.json(), historyRes.json(), candidatesRes.json(),
      ]);
      setDetail(detailData);
      setItems(itemsData.items || []);
      setHistory(historyData.history || []);
      setCandidates(candidatesData.drivers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [orderId]);

  const handleAssign = async () => {
    if (!selectedDriver) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: selectedDriver }),
      });
      const data = await res.json();
      if (data.success) { setShowAssign(false); await fetchAll(); }
      else alert(`Erreur: ${data.error}`);
    } finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Annulé par l'admin" }),
      });
      const data = await res.json();
      if (data.success) { setShowCancel(false); await fetchAll(); }
      else alert(`Erreur: ${data.error}`);
    } finally { setActionLoading(false); }
  };

  const handleRefund = async () => {
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason: refundReason || "Remboursement admin" }),
      });
      const data = await res.json();
      if (data.success) { setShowRefund(false); await fetchAll(); }
      else alert(`Erreur: ${data.error}`);
    } finally { setActionLoading(false); }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: newStatus, note: statusNote }),
      });
      const data = await res.json();
      if (data.success) { setShowStatus(false); await fetchAll(); }
      else alert(`Erreur: ${data.error}`);
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement depuis Firebase...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
        <p className="text-lg font-medium">Commande introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  const { order, payment, client, driver, store, zone } = detail;
  const statusCfg = STATUS_CONFIG[order.status as string] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status as string);
  const isTerminal = ["cancelled","completed","refunded"].includes(order.status as string);
  const canAssign = !isTerminal && !order.driverId;
  const canCancel = !isTerminal;
  const canRefund = payment && !isTerminal;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono">
                {(order.orderNumber as string) || orderId}
              </h1>
              <Badge className={cn("gap-1 border-0", statusCfg.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </Badge>
              {order.restrictedItemsPresent && (
                <Badge variant="outline" className="border-orange-300 text-orange-600">Articles 18+</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {order.createdAt ? new Date(order.createdAt as string).toLocaleString("fr-CA", { dateStyle: "full", timeStyle: "short" }) : "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
          </Button>
          {canAssign && (
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAssign(true)}>
              <UserCheck className="h-4 w-4 mr-1" /> Assigner chauffeur
            </Button>
          )}
          {!isTerminal && (
            <Button variant="outline" size="sm" onClick={() => setShowStatus(true)}>
              <Package className="h-4 w-4 mr-1" /> Changer statut
            </Button>
          )}
          {canRefund && (
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => setShowRefund(true)}>
              <DollarSign className="h-4 w-4 mr-1" /> Rembourser
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowCancel(true)}>
              <XCircle className="h-4 w-4 mr-1" /> Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {!isTerminal && currentStatusIdx >= 0 && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Progression</span>
              <span className="text-xs font-medium">{Math.round((currentStatusIdx / (STATUS_FLOW.length - 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentStatusIdx / (STATUS_FLOW.length - 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="summary">Résumé</TabsTrigger>
              <TabsTrigger value="items">Articles ({items.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline ({history.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" /> Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.deliveryAddress ? (
                    <div className="text-sm">
                      <p className="font-medium">{(order.deliveryAddress as Record<string, string>).street}</p>
                      <p className="text-muted-foreground">
                        {(order.deliveryAddress as Record<string, string>).city},{" "}
                        {(order.deliveryAddress as Record<string, string>).province}{" "}
                        {(order.deliveryAddress as Record<string, string>).postalCode}
                      </p>
                      {(order.deliveryAddress as Record<string, string>).instructions && (
                        <p className="text-muted-foreground mt-1 italic">
                          Note: {(order.deliveryAddress as Record<string, string>).instructions}
                        </p>
                      )}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">Non disponible</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" /> Récapitulatif financier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Sous-total", value: order.subtotal },
                      { label: "Frais de livraison", value: order.deliveryFee },
                      { label: "Pourboire", value: order.tipAmount },
                      { label: "TPS (5%)", value: order.gstAmount },
                      { label: "TVQ (9.975%)", value: order.qstAmount },
                    ].map(({ label, value }) =>
                      value !== undefined && value !== null ? (
                        <div key={label} className="flex justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span>${(Number(value) || 0).toFixed(2)}</span>
                        </div>
                      ) : null
                    )}
                    {order.discountAmount ? (
                      <div className="flex justify-between text-red-600">
                        <span>Rabais</span>
                        <span>-${(Number(order.discountAmount) || 0).toFixed(2)}</span>
                      </div>
                    ) : null}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>${(Number(order.total) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Méthode</span>
                      <span className="capitalize">{(order.paymentMethod as string) || "—"}</span>
                    </div>
                    {payment && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Statut paiement</span>
                        <Badge className="text-xs h-5 border-0 bg-green-100 text-green-700">
                          {(payment.paymentStatus as string) || "—"}
                        </Badge>
                      </div>
                    )}
                    {payment && (payment.refundedAmount as number) > 0 && (
                      <div className="flex justify-between text-xs text-red-600">
                        <span>Remboursé</span>
                        <span>-${(payment.refundedAmount as number).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-orange-500" /> Articles commandés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.productName}</span>
                              {item.requiresAgeVerification && (
                                <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 px-1 py-0">18+</Badge>
                              )}
                            </div>
                            {item.categoryName && <span className="text-xs text-muted-foreground">{item.categoryName}</span>}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium">{item.quantity} × ${(item.unitPrice || 0).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">= ${(item.lineSubtotal || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" /> Historique des statuts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun historique</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-4">
                        {history.map((h, i) => {
                          const cfg = STATUS_CONFIG[h.toStatus] ?? STATUS_CONFIG.pending;
                          const Icon = cfg.icon;
                          return (
                            <div key={h.id} className="flex gap-4 relative">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0",
                                i === history.length - 1 ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                              )}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{cfg.label}</span>
                                  <Badge variant="outline" className="text-xs px-1 py-0">{h.changedByType}</Badge>
                                </div>
                                {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                                {h.createdAt && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(h.createdAt).toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" /> Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{(client.firstName as string)} {(client.lastName as string)}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" /><span className="truncate">{(client.email as string) || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" /><span>{(client.phone as string) || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingBag className="h-3 w-3" /><span>{(client.totalOrders as number) || 0} commandes</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs"
                    onClick={() => router.push(`/admin/clients/${order.clientId}`)}>
                    Voir profil client
                  </Button>
                </div>
              ) : <p className="text-sm text-muted-foreground">Client non trouvé</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-500" /> Chauffeur
              </CardTitle>
            </CardHeader>
            <CardContent>
              {driver ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{(driver.firstName as string)} {(driver.lastName as string)}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" /><span>{(driver.phone as string) || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500" /><span>{(driver.rating as number)?.toFixed(1) || "—"} / 5.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" /><span>{(driver.totalDeliveries as number) || 0} livraisons</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs"
                    onClick={() => router.push(`/admin/drivers/${order.driverId}`)}>
                    Voir profil chauffeur
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">Aucun chauffeur assigné</p>
                  {canAssign && (
                    <Button size="sm" className="w-full text-xs" onClick={() => setShowAssign(true)}>
                      <UserCheck className="h-3 w-3 mr-1" /> Assigner maintenant
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-500" /> Dépanneur
              </CardTitle>
            </CardHeader>
            <CardContent>
              {store ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{(store.name as string)}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" /><span>{(store.address as string) || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" /><span>{(store.phone as string) || "—"}</span>
                  </div>
                </div>
              ) : <p className="text-sm text-muted-foreground">Magasin non trouvé</p>}
            </CardContent>
          </Card>

          {zone && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" /> Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-sm">{(zone.nameFr as string)}</p>
                <p className="text-xs text-muted-foreground">
                  Livraison: ${(zone.deliveryFee as number)?.toFixed(2)} · ~{zone.estimatedTimeMinutes as number} min
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assigner un chauffeur</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun chauffeur disponible</p>
            ) : candidates.map((d) => (
              <div key={d.id} onClick={() => setSelectedDriver(d.id)}
                className={cn("flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedDriver === d.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "hover:bg-muted/50")}>
                <div>
                  <p className="font-medium text-sm">{d.firstName} {d.lastName}</p>
                  <p className="text-xs text-muted-foreground">⭐ {d.rating?.toFixed(1) || "—"} · {d.totalDeliveries || 0} livraisons</p>
                </div>
                <Badge className="text-xs bg-green-100 text-green-700 border-0">Disponible</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Annuler</Button>
            <Button onClick={handleAssign} disabled={!selectedDriver || actionLoading}>
              {actionLoading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />} Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-red-600">Annuler la commande</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            <div>
              <Label>Raison</Label>
              <Textarea placeholder="Ex: Magasin fermé, produit indisponible..." value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>Retour</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />} Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefund} onOpenChange={setShowRefund}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Émettre un remboursement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {payment && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span>Montant payé</span><span className="font-medium">${(payment.amount as number)?.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Déjà remboursé</span><span>-${(payment.refundedAmount as number || 0).toFixed(2)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium"><span>Remboursable</span>
                  <span className="text-green-600">${((payment.amount as number || 0) - (payment.refundedAmount as number || 0)).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div>
              <Label>Montant ($)</Label>
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Raison</Label>
              <Input placeholder="Ex: Article manquant..." value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefund(false)}>Annuler</Button>
            <Button onClick={handleRefund} disabled={!refundAmount || actionLoading} className="bg-orange-600 hover:bg-orange-700">
              {actionLoading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />} Rembourser ${refundAmount || "0.00"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatus} onOpenChange={setShowStatus}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Changer le statut</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Statut actuel: <strong>{statusCfg.label}</strong></p>
            <div>
              <Label>Nouveau statut</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background"
                value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Sélectionner...</option>
                {STATUS_FLOW.filter((s) => STATUS_FLOW.indexOf(s) > currentStatusIdx).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                ))}
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div>
              <Label>Note (optionnel)</Label>
              <Input placeholder="Note interne..." value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatus(false)}>Annuler</Button>
            <Button onClick={handleStatusChange} disabled={!newStatus || actionLoading}>
              {actionLoading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />} Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
