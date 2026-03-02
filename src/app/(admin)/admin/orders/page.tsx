"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/data";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "En attente",   color: "bg-yellow-100 text-yellow-800", icon: Clock },
  preparing:  { label: "Preparation", color: "bg-blue-100 text-blue-800",    icon: Package },
  en_route:   { label: "En route",    color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered:  { label: "Livre",       color: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  cancelled:  { label: "Annule",      color: "bg-red-100 text-red-800",      icon: XCircle },
};

const EXTENDED_ORDERS = [
  ...MOCK_ORDERS,
  { id: "FDC-12343", status: "preparing", items: [{ product: { name: "Doritos", price: 4.29 }, quantity: 2 }], total: 18.50, createdAt: "2024-07-28T10:00:00Z", driver: { name: "Luc", avatarUrl: "https://picsum.photos/seed/104/200/200" } },
  { id: "FDC-12342", status: "pending",   items: [{ product: { name: "Coca-Cola", price: 1.79 }, quantity: 3 }], total: 12.75, createdAt: "2024-07-28T09:30:00Z", driver: null },
  { id: "FDC-12341", status: "cancelled", items: [{ product: { name: "Heineken", price: 14.99 }, quantity: 1 }], total: 28.90, createdAt: "2024-07-28T08:15:00Z", driver: { name: "Marc-Andre", avatarUrl: "https://picsum.photos/seed/driver-marc/200/200" } },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = EXTENDED_ORDERS.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.driver?.name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: EXTENDED_ORDERS.length,
    pending: EXTENDED_ORDERS.filter(o => o.status === "pending").length,
    en_route: EXTENDED_ORDERS.filter(o => o.status === "en_route").length,
    delivered: EXTENDED_ORDERS.filter(o => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Toutes les Commandes</h1>
        <p className="text-muted-foreground">Gestion et suivi de toutes les commandes de la plateforme.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "En attente", value: stats.pending, color: "text-yellow-600" },
          { label: "En route", value: stats.en_route, color: "text-blue-600" },
          { label: "Livrees", value: stats.delivered, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="text-base">Liste des commandes</CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="preparing">Preparation</SelectItem>
                  <SelectItem value="en_route">En route</SelectItem>
                  <SelectItem value="delivered">Livre</SelectItem>
                  <SelectItem value="cancelled">Annule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Chauffeur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const Icon = config.icon;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell>
                      {order.driver ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={order.driver.avatarUrl} />
                            <AvatarFallback>{order.driver.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{order.driver.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non assigne</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1 border-0", config.color)}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("fr-CA", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
