"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, MapPin, ShoppingBag, Wallet, Star, Calendar,
  CheckCircle2, XCircle, ChevronLeft, Loader2, Package, CreditCard,
} from "lucide-react";
import Link from "next/link";

interface ClientData {
  id: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  fullName?: string;
  full_name?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  photo_url?: string;
  status?: string;
  totalOrders?: number;
  total_orders?: number;
  totalSpent?: number;
  total_spent?: number;
  loyaltyPoints?: number;
  loyalty_points?: number;
  walletBalance?: number;
  wallet_balance?: number;
  isEmailVerified?: boolean;
  is_email_verified?: boolean;
  createdAt?: string;
  created_at?: string;
  defaultAddress?: string;
  default_address?: string;
}

interface OrderItem {
  id: string;
  status: string;
  total: number;
  storeName?: string;
  store_name?: string;
  createdAt?: string;
  created_at?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "Actif",    color: "bg-green-100 text-green-800" },
  inactive:  { label: "Inactif", color: "bg-gray-100 text-gray-800" },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-800" },
};

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",     color: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmée",      color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Préparation",    color: "bg-yellow-100 text-yellow-700" },
  en_route:  { label: "En route",       color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée",         color: "bg-green-100 text-green-700" },
  completed: { label: "Terminée",       color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée",        color: "bg-red-100 text-red-700" },
};

export default function ClientDetailPage() {
  const { clientId } = useParams() as { clientId: string };
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/clients/${clientId}`);
        const data = await res.json();
        setClient(data.client || data);
        setOrders(data.recentOrders || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [clientId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (!client) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Client introuvable.</p>
      <Button asChild className="mt-4" variant="outline">
        <Link href="/admin/clients"><ChevronLeft className="h-4 w-4 mr-1" />Retour</Link>
      </Button>
    </div>
  );

  // Normaliser les champs
  const firstName = client.firstName || client.first_name || "";
  const lastName = client.lastName || client.last_name || "";
  const fullName = client.fullName || client.full_name || client.display_name || `${firstName} ${lastName}`.trim() || "Client";
  const email = client.email || "";
  const phone = client.phone || "";
  const photoURL = client.photoURL || client.photo_url || "";
  const status = client.status || "active";
  const totalOrders = client.totalOrders || client.total_orders || 0;
  const totalSpent = client.totalSpent || client.total_spent || 0;
  const loyaltyPoints = client.loyaltyPoints || client.loyalty_points || 0;
  const walletBalance = client.walletBalance || client.wallet_balance || 0;
  const isEmailVerified = client.isEmailVerified || client.is_email_verified || false;
  const createdAt = client.createdAt || client.created_at || "";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || fullName?.[0]?.toUpperCase() || "C";
  const statusCfg = STATUS_CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/clients"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profil du client</h1>
          <p className="text-muted-foreground text-sm">ID: {clientId}</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              {photoURL && <AvatarImage src={photoURL} alt={fullName} />}
              <AvatarFallback className="text-2xl bg-orange-100 text-orange-700 font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{fullName}</h2>
                <Badge className={`text-xs border-0 ${statusCfg.color}`}>{statusCfg.label}</Badge>
                {isEmailVerified && (
                  <Badge className="text-xs border-0 bg-blue-100 text-blue-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Email vérifié
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{email}</div>}
                {phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{phone}</div>}
                {createdAt && <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />Membre depuis {new Date(createdAt).toLocaleDateString("fr-CA")}</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ShoppingBag, label: "Commandes", value: totalOrders, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CreditCard, label: "Total dépensé", value: `$${totalSpent.toFixed(2)}`, color: "text-green-600", bg: "bg-green-50" },
          { icon: Wallet, label: "Portefeuille", value: `$${walletBalance.toFixed(2)}`, color: "text-orange-600", bg: "bg-orange-50" },
          { icon: Star, label: "Points fidélité", value: loyaltyPoints, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-4 pb-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Commandes ({orders.length})</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">Aucune commande pour ce client</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order, i) => {
                    const oCfg = ORDER_STATUS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                    const storeName = order.storeName || order.store_name || "Dépanneur";
                    const orderDate = order.createdAt || order.created_at || "";
                    return (
                      <div key={order.id || i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{storeName}</p>
                          <p className="text-xs text-muted-foreground">{orderDate ? new Date(orderDate).toLocaleDateString("fr-CA") : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs border-0 ${oCfg.color}`}>{oCfg.label}</Badge>
                          <span className="text-sm font-bold">${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  { label: "Nom complet", value: fullName, icon: User },
                  { label: "Email", value: email || "Non renseigné", icon: Mail },
                  { label: "Téléphone", value: phone || "Non renseigné", icon: Phone },
                  { label: "Statut", value: statusCfg.label, icon: CheckCircle2 },
                  { label: "Email vérifié", value: isEmailVerified ? "Oui" : "Non", icon: isEmailVerified ? CheckCircle2 : XCircle },
                  { label: "Date d'inscription", value: createdAt ? new Date(createdAt).toLocaleDateString("fr-CA") : "Inconnue", icon: Calendar },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
