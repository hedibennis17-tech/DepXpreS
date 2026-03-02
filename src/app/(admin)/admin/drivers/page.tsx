"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Car, Star, Package, DollarSign, Eye, Wifi, WifiOff } from "lucide-react";
import { DRIVERS } from "@/lib/data";

const EXTENDED_DRIVERS = [
  ...DRIVERS,
  { id: "driver-3", name: "Luc Bergeron", status: "En livraison", earnings: 210.00, rating: 4.7, deliveries: 28, avatarUrl: "https://picsum.photos/seed/driver-luc/200/200" },
  { id: "driver-4", name: "Amina Diallo", status: "En ligne", earnings: 95.50, rating: 5.0, deliveries: 9, avatarUrl: "https://picsum.photos/seed/driver-amina/200/200" },
];

const STATUS_COLOR: Record<string, string> = {
  "En ligne": "bg-green-100 text-green-800",
  "En livraison": "bg-blue-100 text-blue-800",
  "Hors ligne": "bg-gray-100 text-gray-600",
};

export default function DriversPage() {
  const [search, setSearch] = useState("");

  const filtered = EXTENDED_DRIVERS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chauffeurs</h1>
        <p className="text-muted-foreground">Gestion et suivi de tous les chauffeurs partenaires.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Car, label: "Total", value: EXTENDED_DRIVERS.length, color: "text-foreground" },
          { icon: Wifi, label: "En ligne", value: EXTENDED_DRIVERS.filter(d => d.status !== "Hors ligne").length, color: "text-green-600" },
          { icon: WifiOff, label: "Hors ligne", value: EXTENDED_DRIVERS.filter(d => d.status === "Hors ligne").length, color: "text-gray-500" },
          { icon: DollarSign, label: "Gains totaux", value: `$${EXTENDED_DRIVERS.reduce((s, d) => s + d.earnings, 0).toFixed(0)}`, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <s.icon className="h-4 w-4" />{s.label}
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Liste des chauffeurs</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chauffeur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Livraisons</TableHead>
                <TableHead className="text-right">Gains</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(driver => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={driver.avatarUrl} />
                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${STATUS_COLOR[driver.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {driver.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{driver.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      {driver.deliveries}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ${driver.earnings.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
