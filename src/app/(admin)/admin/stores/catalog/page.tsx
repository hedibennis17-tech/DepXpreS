"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, RefreshCw, Package, ImageIcon, X, Loader2, Store, Tag, Barcode, DollarSign, Layers, AlertCircle, ShieldAlert } from "lucide-react";

type ProductRow = {
  id: string; name?: string; description?: string; barcode?: string;
  price?: number; stock?: number; isActive?: boolean;
  requiresAgeVerification?: boolean; storeId?: string; storeName?: string;
  categoryId?: string; categoryName?: string; imageUrl?: string;
};
type StoreOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

const EMPTY_FORM = {
  name: "", description: "", barcode: "", price: "", stock: "",
  categoryId: "", storeId: "", requiresAgeVerification: false, isActive: true,
};

export default function StoresCatalogPage() {
  const router = useRouter();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProducts(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { credentials: "include", cache: "no-store" });
      if (res.status === 401) { router.replace("/admin/login?redirect=/admin/stores/catalog"); return; }
      if (res.status === 403) { router.replace("/admin/dashboard"); return; }
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Impossible de charger le catalogue.");
      setItems(Array.isArray(data?.products) ? data.products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => {
    loadProducts();
    getDocs(query(collection(db, "stores"), orderBy("name")))
      .then(snap => setStores(snap.docs.map(d => ({ id: d.id, name: (d.data().name as string) || d.id }))))
      .catch(() => {});
    getDocs(collection(db, "categories"))
      .then(snap => {
        const cats = snap.docs.map(d => ({ 
          id: d.id, 
          name: (d.data().name as string) || d.id,
          sortOrder: (d.data().sortOrder as number) || 999
        }));
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(cats);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter(p =>
      (p.name || "").toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s) ||
      (p.barcode || "").toLowerCase().includes(s) ||
      (p.storeName || "").toLowerCase().includes(s)
    );
  }, [items, search]);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError("Image trop lourde (max 5 Mo)."); return; }
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError("");
  }

  function removeImage() {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openModal() {
    setForm({ ...EMPTY_FORM }); setImageFile(null); setImagePreview(null);
    setFormError(""); setModalOpen(true);
  }

  async function handleSubmit() {
    setFormError("");
    if (!form.name.trim()) { setFormError("Le nom de l'article est requis."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setFormError("Le prix doit être un nombre valide."); return; }
    if (!form.storeId) { setFormError("Veuillez sélectionner un commercant (store)."); return; }
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      const payload = {
        name: form.name.trim(), description: form.description.trim(),
        barcode: form.barcode.trim(), price,
        stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId || null, storeId: form.storeId,
        requiresAgeVerification: form.requiresAgeVerification,
        isActive: form.isActive,
        ...(imageUrl ? { imageUrl } : {}),
      };
      const res = await fetch("/api/admin/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Erreur lors de la création.");
      setModalOpen(false);
      await loadProducts(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogue global</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Chargement..." : `${filtered.length} article(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadProducts(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={openModal}>
            <Plus className="h-4 w-4" /> Ajouter un article
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un produit, code-barres, description..." value={search}
          onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Grille produits */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">{search ? "Aucun article ne correspond à la recherche." : "Aucun article dans le catalogue."}</p>
            {!search && (
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={openModal}>
                <Plus className="h-4 w-4" /> Ajouter le premier article
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {product.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    : <ImageIcon className="h-10 w-10 text-muted-foreground/30" />}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name || "Sans nom"}</p>
                    <Badge className={product.isActive !== false ? "bg-green-100 text-green-800 shrink-0" : "bg-gray-100 text-gray-600 shrink-0"}>
                      {product.isActive !== false ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  {product.description && <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                      <DollarSign className="h-3.5 w-3.5" />
                      {product.price !== undefined ? `${Number(product.price).toFixed(2)} $` : "—"}
                    </div>
                    {product.stock !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" /> Stock : {product.stock}
                      </div>
                    )}
                    {product.barcode && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Barcode className="h-3 w-3" /> {product.barcode}
                      </div>
                    )}
                    {product.storeName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Store className="h-3 w-3" /> {product.storeName}
                      </div>
                    )}
                    {product.categoryName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" /> {product.categoryName}
                      </div>
                    )}
                    {product.requiresAgeVerification && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                        <ShieldAlert className="h-3 w-3" /> Âge requis (18+)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MODAL — Ajouter un article */}
      <Dialog open={modalOpen} onOpenChange={v => { if (!submitting) setModalOpen(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-orange-500" />
              Ajouter un article au catalogue
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{formError}
              </div>
            )}

            {/* Image */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Photo de l&apos;article</Label>
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-orange-400 hover:text-orange-500 transition-colors">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Cliquer pour ajouter une photo</span>
                  <span className="text-xs">JPG, PNG, WEBP — max 5 Mo</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </div>

            {/* Nom + Description */}
            <div>
              <Label htmlFor="art-name" className="text-sm font-medium">
                Nom de l&apos;article <span className="text-red-500">*</span>
              </Label>
              <Input id="art-name" placeholder="ex: Coca-Cola 500ml, Chips Doritos..."
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="art-desc" className="text-sm font-medium">Description</Label>
              <textarea id="art-desc" placeholder="Description courte (optionnel)..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Prix + Stock + Code-barres */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="art-price" className="text-sm font-medium">
                  Prix ($) <span className="text-red-500">*</span>
                </Label>
                <Input id="art-price" type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="art-stock" className="text-sm font-medium">Stock initial</Label>
                <Input id="art-stock" type="number" min="0" placeholder="0"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="art-barcode" className="text-sm font-medium">Code-barres</Label>
                <Input id="art-barcode" placeholder="000000000000"
                  value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Store + Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Commercant (Store) <span className="text-red-500">*</span>
                </Label>
                <Select value={form.storeId} onValueChange={v => setForm(f => ({ ...f, storeId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un store..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.length === 0
                      ? <div className="px-3 py-2 text-sm text-muted-foreground">Aucun store disponible</div>
                      : stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Catégorie</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Aucune catégorie —</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Switches */}
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-lg border flex-1">
                <Switch id="sw-active" checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
                <div>
                  <Label htmlFor="sw-active" className="text-sm font-medium cursor-pointer">Article actif</Label>
                  <p className="text-xs text-muted-foreground">Visible par les clients</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border flex-1">
                <Switch id="sw-age" checked={form.requiresAgeVerification}
                  onCheckedChange={v => setForm(f => ({ ...f, requiresAgeVerification: v }))} />
                <div>
                  <Label htmlFor="sw-age" className="text-sm font-medium cursor-pointer">Âge requis (18+)</Label>
                  <p className="text-xs text-muted-foreground">Alcool, tabac, etc.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Annuler</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</> : <><Plus className="h-4 w-4" /> Ajouter l&apos;article</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
