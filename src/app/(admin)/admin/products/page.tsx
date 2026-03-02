"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Package, AlertTriangle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/data";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name ?? "Inconnu";

  const STOCK_CONFIG = {
    in_stock: { label: "En stock", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    low_stock: { label: "Stock faible", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    out_of_stock: { label: "Rupture", color: "bg-red-100 text-red-800", icon: AlertTriangle },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">Catalogue complet des produits disponibles.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Total produits", value: PRODUCTS.length, color: "text-foreground" },
          { icon: CheckCircle2, label: "En stock", value: PRODUCTS.filter(p => p.stock === "in_stock").length, color: "text-green-600" },
          { icon: AlertTriangle, label: "Stock faible", value: PRODUCTS.filter(p => p.stock === "low_stock").length, color: "text-yellow-600" },
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
            <CardTitle className="text-base">Catalogue</CardTitle>
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
                <TableHead>Produit</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => {
                const stock = STOCK_CONFIG[product.stock as keyof typeof STOCK_CONFIG];
                const Icon = stock?.icon ?? CheckCircle2;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.format}</TableCell>
                    <TableCell className="text-right font-semibold">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`border-0 gap-1 ${stock?.color ?? ""}`}>
                        <Icon className="h-3 w-3" />
                        {stock?.label ?? "Inconnu"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {product.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
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
