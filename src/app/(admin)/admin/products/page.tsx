"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, Package, Plus, Edit2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  stock?: number;
  isActive?: boolean;
  requiresAgeVerification?: boolean;
  totalSold?: number;
  description?: string;
}

interface Category {
  id: string;
  nameFr: string;
  icon?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "", categoryId: "", description: "", requiresAgeVerification: false });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
      if (activeFilter !== "all") params.set("isActive", activeFilter);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/products?${params}`),
        fetch("/api/admin/categories"),
      ]);
      const [productsData, categoriesData] = await Promise.all([productsRes.json(), categoriesRes.json()]);
      setProducts(productsData.products || []);
      setTotal(productsData.total || 0);
      setCategories(categoriesData.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, categoryFilter, activeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProduct) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: editProduct.id,
            updates: {
              name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock),
              categoryId: form.categoryId, description: form.description,
              requiresAgeVerification: form.requiresAgeVerification,
            },
          }),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock),
            categoryId: form.categoryId, description: form.description,
            requiresAgeVerification: form.requiresAgeVerification,
          }),
        });
      }
      setShowAdd(false); setEditProduct(null);
      setForm({ name: "", price: "", stock: "", categoryId: "", description: "", requiresAgeVerification: false });
      await fetchData(true);
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (product: Product) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, updates: { isActive: !product.isActive } }),
    });
    await fetchData(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name, price: String(product.price), stock: String(product.stock || 0),
      categoryId: product.categoryId || "", description: product.description || "",
      requiresAgeVerification: product.requiresAgeVerification || false,
    });
    setShowAdd(true);
  };

  const stats = {
    total, active: products.filter((p) => p.isActive).length,
    restricted: products.filter((p) => p.requiresAgeVerification).length,
    lowStock: products.filter((p) => (p.stock || 0) < 5).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogue produits</h1>
          <p className="text-muted-foreground">{total} produit{total !== 1 ? "s" : ""} — Firebase temps réel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Actualiser
          </Button>
          <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => { setEditProduct(null); setForm({ name: "", price: "", stock: "", categoryId: "", description: "", requiresAgeVerification: false }); setShowAdd(true); }}>
            <Plus className="h-4 w-4" /> Ajouter produit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Package, color: "text-foreground", bg: "bg-gray-50 dark:bg-gray-800" },
          { label: "Actifs", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Restreints 18+", value: stats.restricted, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
          { label: "Stock faible", value: stats.lowStock, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
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
            <CardTitle className="text-base">Liste des produits</CardTitle>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nom, description..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.nameFr}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Package className="h-10 w-10 mb-2 opacity-30" /><p>Aucun produit trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Vendu</TableHead>
                  <TableHead>18+</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.description && <p className="text-xs text-muted-foreground truncate max-w-40">{product.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{product.categoryName || "—"}</span></TableCell>
                    <TableCell><span className="text-sm font-medium">${(product.price || 0).toFixed(2)}</span></TableCell>
                    <TableCell>
                      <span className={cn("text-sm font-medium", (product.stock || 0) < 5 ? "text-red-600" : "text-foreground")}>
                        {product.stock ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{product.totalSold || 0}</span></TableCell>
                    <TableCell>
                      {product.requiresAgeVerification
                        ? <Badge className="text-xs bg-orange-100 text-orange-700 border-0">18+</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {product.isActive
                        ? <Badge className="text-xs bg-green-100 text-green-700 border-0">Actif</Badge>
                        : <Badge className="text-xs bg-gray-100 text-gray-600 border-0">Inactif</Badge>}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(product)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleToggleActive(product)}>
                          {product.isActive ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom *</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Bière Molson 500ml" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prix ($) *</Label><Input className="mt-1" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
              <div><Label>Stock</Label><Input className="mt-1" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" /></div>
            </div>
            <div>
              <Label>Catégorie</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Sélectionner...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.nameFr}</option>)}
              </select>
            </div>
            <div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description courte..." /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="age" checked={form.requiresAgeVerification} onChange={(e) => setForm({ ...form, requiresAgeVerification: e.target.checked })} className="rounded" />
              <Label htmlFor="age" className="cursor-pointer">Vérification d&apos;âge requise (18+)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.price || saving} className="bg-orange-600 hover:bg-orange-700">
              {saving && <RefreshCw className="h-4 w-4 animate-spin mr-2" />} {editProduct ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
