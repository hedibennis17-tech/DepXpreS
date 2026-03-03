"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Store, ArrowLeft, RefreshCw, Star, ShoppingBag, TrendingUp,
  MapPin, Phone, Mail, Clock, Edit2, Save, X, CheckCircle2,
  Package, Users, DollarSign, Calendar, AlertCircle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoreHour {
  day: number;
  label: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface StoreData {
  id: string;
  name: string;
  address: string;
  city?: string;
  postalCode?: string;
  phone: string;
  email?: string;
  status: string;
  isOpen: boolean;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  zoneName?: string;
  zoneId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  hours?: StoreHour[];
  minOrderAmount?: number;
  deliveryFee?: number;
  preparationTime?: number;
  maxDeliveryRadius?: number;
  acceptsOnlinePayment?: boolean;
  acceptsCash?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface StoreStats {
  ordersCount: number;
  productsCount: number;
  reviewsCount: number;
  revenue: number;
  avgRating: number;
  completedOrders: number;
}

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "Actif",      color: "bg-green-100 text-green-800" },
  inactive:  { label: "Inactif",    color: "bg-gray-100 text-gray-800" },
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  suspended: { label: "Suspendu",   color: "bg-red-100 text-red-800" },
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function StoreDetailPage() {
  const { storeId } = useParams() as { storeId: string };
  const router = useRouter();

  const [store, setStore] = useState<StoreData | null>(null);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<StoreData>>({});

  const fetchStore = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError("");
    try {
      // Charger via API (server-side avec Admin SDK)
      const res = await fetch(`/api/admin/stores/${storeId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Dépanneur introuvable");
      }
      const json = await res.json();
      const s = json.store as StoreData;

      // Normaliser les horaires
      if (!s.hours || s.hours.length === 0) {
        s.hours = DAY_LABELS.map((label, day) => ({
          day, label, open: "08:00", close: "23:00", isClosed: day === 0,
        }));
      } else {
        s.hours = s.hours.map((h: StoreHour) => ({
          ...h,
          label: DAY_LABELS[h.day] || `Jour ${h.day}`,
        }));
      }

      setStore(s);
      setStats(json.stats || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const startEdit = () => {
    if (!store) return;
    setEditData({ ...store });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditData({});
    setEditMode(false);
  };

  const saveEdit = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      await fetchStore();
      setEditMode(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    if (!store) return;
    try {
      await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !store.isOpen }),
      });
      setStore(prev => prev ? { ...prev, isOpen: !prev.isOpen } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const set = (field: keyof StoreData, value: unknown) =>
    setEditData(prev => ({ ...prev, [field]: value }));

  const updateHour = (day: number, field: keyof StoreHour, value: unknown) => {
    setEditData(prev => ({
      ...prev,
      hours: (prev.hours || store?.hours || []).map(h =>
        h.day === day ? { ...h, [field]: value } : h
      ),
    }));
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement du dépanneur...</span>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-red-600">{error || "Dépanneur introuvable"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/stores")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[store.status] ?? STATUS_CONFIG.active;
  const currentHours = editMode ? (editData.hours || store.hours || []) : (store.hours || []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/stores")} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
              <Badge className={cn("border-0 text-xs", statusCfg.color)}>{statusCfg.label}</Badge>
              <Badge className={cn("border-0 text-xs", store.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {store.isOpen ? "Ouvert" : "Fermé"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {store.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-muted-foreground">{store.isOpen ? "Ouvert" : "Fermé"}</span>
            <Switch checked={store.isOpen} onCheckedChange={toggleOpen} />
          </div>
          {editMode ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={startEdit} variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" /> Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Commandes",    value: stats.ordersCount,    icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Revenus",      value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
            { label: "Note moyenne", value: `${stats.avgRating.toFixed(1)} ★`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Produits",     value: stats.productsCount,  icon: Package,     color: "text-purple-600", bg: "bg-purple-50" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className={cn("border-0 shadow-sm", s.bg)}>
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", s.color)} />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                  <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Onglets */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        {/* ─── Onglet Informations ─────────────────────────────────────────── */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-500" /> Informations du dépanneur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom du dépanneur</Label>
                    <Input value={editData.name ?? store.name} onChange={e => set("name", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Adresse complète</Label>
                    <Input value={editData.address ?? store.address} onChange={e => set("address", e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Téléphone</Label>
                      <Input value={editData.phone ?? store.phone} onChange={e => set("phone", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Courriel</Label>
                      <Input type="email" value={editData.email ?? store.email ?? ""} onChange={e => set("email", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Statut</Label>
                      <Select value={editData.status ?? store.status} onValueChange={v => set("status", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="suspended">Suspendu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Propriétaire</Label>
                      <Input value={editData.ownerName ?? store.ownerName ?? ""} onChange={e => set("ownerName", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Courriel propriétaire</Label>
                      <Input type="email" value={editData.ownerEmail ?? store.ownerEmail ?? ""} onChange={e => set("ownerEmail", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Téléphone propriétaire</Label>
                      <Input value={editData.ownerPhone ?? store.ownerPhone ?? ""} onChange={e => set("ownerPhone", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={Store} label="Nom" value={store.name} />
                  <InfoRow icon={MapPin} label="Adresse" value={store.address} />
                  <InfoRow icon={Phone} label="Téléphone" value={store.phone} />
                  <InfoRow icon={Mail} label="Courriel" value={store.email || "—"} />
                  <InfoRow icon={MapPin} label="Zone" value={store.zoneName || "—"} />
                  <InfoRow icon={Users} label="Propriétaire" value={store.ownerName || "—"} />
                  {store.ownerEmail && <InfoRow icon={Mail} label="Courriel propriétaire" value={store.ownerEmail} />}
                  {store.ownerPhone && <InfoRow icon={Phone} label="Tél. propriétaire" value={store.ownerPhone} />}
                  <InfoRow icon={Calendar} label="Créé le" value={store.createdAt ? new Date(store.createdAt).toLocaleDateString("fr-CA") : "—"} />
                  <InfoRow icon={Calendar} label="Mis à jour" value={store.updatedAt ? new Date(store.updatedAt).toLocaleDateString("fr-CA") : "—"} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Onglet Horaires ─────────────────────────────────────────────── */}
        <TabsContent value="hours">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" /> Horaires d&apos;ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentHours.map(h => (
                  <div key={h.day} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    h.isClosed ? "bg-gray-50 opacity-60" : "bg-white"
                  )}>
                    <div className="w-24 text-sm font-medium">{h.label}</div>
                    {editMode ? (
                      <>
                        <Switch
                          checked={!h.isClosed}
                          onCheckedChange={v => updateHour(h.day, "isClosed", !v)}
                        />
                        <span className="text-xs text-muted-foreground w-12">{h.isClosed ? "Fermé" : "Ouvert"}</span>
                        {!h.isClosed && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={h.open}
                              onChange={e => updateHour(h.day, "open", e.target.value)}
                              className="h-8 text-sm w-28"
                            />
                            <span className="text-muted-foreground text-sm">à</span>
                            <Input
                              type="time"
                              value={h.close}
                              onChange={e => updateHour(h.day, "close", e.target.value)}
                              className="h-8 text-sm w-28"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={cn("text-xs border-0", h.isClosed ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700")}>
                          {h.isClosed ? "Fermé" : "Ouvert"}
                        </Badge>
                        {!h.isClosed && (
                          <span className="text-sm text-muted-foreground">{h.open} – {h.close}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => currentHours.forEach(h => updateHour(h.day, "isClosed", false))}
                    className="text-xs"
                  >
                    Ouvrir tous les jours
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Onglet Paramètres ───────────────────────────────────────────── */}
        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Paramètres de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Commande minimum ($)</Label>
                    <Input
                      type="number" min="0" step="0.50"
                      value={editData.minOrderAmount ?? store.minOrderAmount ?? 10}
                      onChange={e => set("minOrderAmount", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frais de livraison ($)</Label>
                    <Input
                      type="number" min="0" step="0.25"
                      value={editData.deliveryFee ?? store.deliveryFee ?? 3.99}
                      onChange={e => set("deliveryFee", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Temps de préparation (min)</Label>
                    <Input
                      type="number" min="5" max="120"
                      value={editData.preparationTime ?? store.preparationTime ?? 15}
                      onChange={e => set("preparationTime", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rayon max (km)</Label>
                    <Input
                      type="number" min="1" max="50"
                      value={editData.maxDeliveryRadius ?? store.maxDeliveryRadius ?? 5}
                      onChange={e => set("maxDeliveryRadius", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2 space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">Paiement en ligne</p>
                        <p className="text-xs text-muted-foreground">Carte, débit, Apple Pay</p>
                      </div>
                      <Switch
                        checked={editData.acceptsOnlinePayment ?? store.acceptsOnlinePayment ?? true}
                        onCheckedChange={v => set("acceptsOnlinePayment", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">Paiement comptant</p>
                        <p className="text-xs text-muted-foreground">Argent comptant à la livraison</p>
                      </div>
                      <Switch
                        checked={editData.acceptsCash ?? store.acceptsCash ?? true}
                        onCheckedChange={v => set("acceptsCash", v)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <SettingRow label="Commande minimum" value={`$${(store.minOrderAmount || 10).toFixed(2)}`} />
                  <SettingRow label="Frais de livraison" value={`$${(store.deliveryFee || 3.99).toFixed(2)}`} />
                  <SettingRow label="Temps de préparation" value={`${store.preparationTime || 15} min`} />
                  <SettingRow label="Rayon de livraison" value={`${store.maxDeliveryRadius || 5} km`} />
                  <SettingRow label="Paiement en ligne" value={store.acceptsOnlinePayment !== false ? "Oui" : "Non"} />
                  <SettingRow label="Paiement comptant" value={store.acceptsCash !== false ? "Oui" : "Non"} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Onglet Commandes ────────────────────────────────────────────── */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-500" /> Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Voir les commandes de ce dépanneur</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push(`/admin/stores/${storeId}/orders`)}
                >
                  Voir toutes les commandes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
