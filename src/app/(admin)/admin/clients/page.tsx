"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, UserX, Wallet, Eye, MoreHorizontal } from "lucide-react";

const MOCK_CLIENTS = [
  { id: "c1", name: "Sophie Martin", email: "sophie@email.com", phone: "514-555-0101", orders: 24, spent: 387.50, status: "active", joined: "2024-01-15", avatarUrl: "https://picsum.photos/seed/c1/200/200" },
  { id: "c2", name: "Jean-Pierre Tremblay", email: "jp@email.com", phone: "514-555-0202", orders: 8, spent: 142.00, status: "active", joined: "2024-03-22", avatarUrl: "https://picsum.photos/seed/c2/200/200" },
  { id: "c3", name: "Marie Gagnon", email: "marie@email.com", phone: "450-555-0303", orders: 45, spent: 892.75, status: "active", joined: "2023-11-08", avatarUrl: "https://picsum.photos/seed/c3/200/200" },
  { id: "c4", name: "Carlos Rodriguez", email: "carlos@email.com", phone: "514-555-0404", orders: 3, spent: 56.25, status: "blocked", joined: "2024-06-10", avatarUrl: "https://picsum.photos/seed/c4/200/200" },
  { id: "c5", name: "Fatima Benali", email: "fatima@email.com", phone: "438-555-0505", orders: 17, spent: 298.90, status: "active", joined: "2024-02-28", avatarUrl: "https://picsum.photos/seed/c5/200/200" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">Gestion de tous les clients de la plateforme.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total clients", value: MOCK_CLIENTS.length, color: "text-foreground" },
          { icon: UserCheck, label: "Actifs", value: MOCK_CLIENTS.filter(c => c.status === "active").length, color: "text-green-600" },
          { icon: UserX, label: "Bloques", value: MOCK_CLIENTS.filter(c => c.status === "blocked").length, color: "text-red-600" },
          { icon: Wallet, label: "Revenu total", value: `$${MOCK_CLIENTS.reduce((s, c) => s + c.spent, 0).toFixed(0)}`, color: "text-primary" },
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
            <CardTitle className="text-base">Liste des clients</CardTitle>
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
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead className="text-right">Depenses</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(client => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.avatarUrl} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{client.email}</p>
                      <p className="text-muted-foreground">{client.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{client.orders}</TableCell>
                  <TableCell className="text-right font-semibold">${client.spent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={client.status === "active" ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                      {client.status === "active" ? "Actif" : "Bloque"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(client.joined).toLocaleDateString("fr-CA")}
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
