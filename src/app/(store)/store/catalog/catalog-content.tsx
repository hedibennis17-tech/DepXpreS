"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TAXONOMY } from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Package, Plus, Search, Edit2, RefreshCw, Trash2,
  DollarSign, ImageIcon, X, Loader2, AlertCircle,
  ShieldAlert, Layers, Check
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable?: boolean;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  requiresAgeVerification?: boolean;
}

const EMPTY_FORM = {
  name: "", price: "", description: "", stock: "",
  categoryId: "", subcategoryId: "",
  requiresAgeVerification: false, isAvailable: true,
};

export default function CatalogContent() {
  const [storeId, setStoreId] = useState("");
  const [commerceTypeSlug, setCommerceTypeSlug] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supprimer
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Taxonomie basée sur le type de commerce du store
  const commerceType = TAXONOMY.find(ct => ct.slug === commerceTypeSlug) || TAXONOMY[0];
  const categories = commerceType?.categories || [];
  const subcategories = categories.find(c => c.id === form.categoryId)?.subcategories || [];

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
    // Récupérer le type de commerce depuis localStorage ou Firestore
    // Pour l'instant on prend le premier commerce type disponible
    // TODO: connecter au vrai commerceTypeSlug du store
    setCommerceTypeSlug("depanneur-epicerie-de-quartier");
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, "products"), where("storeId", "==", storeId));
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [storeId]);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null); setImagePreview(null);
    setFormError(""); setUploadProgress("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name || "", price: String(p.price ?? ""),
      description: p.description || "", stock: String(p.stock ?? ""),
      categoryId: p.categoryId || "", subcategoryId: p.subcategoryId || "",
      requiresAgeVerification: !!p.requiresAgeVerification,
      isAvailable: p.isAvailable !== false,
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || null);
    setFormError(""); setUploadProgress("");
    setModalOpen(true);
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError("Image max 5 Mo."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  }

  async function handleSave() {
    setFormError("");
    if (!form.name.trim()) { setFormError("Nom requis."); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setFormError("Prix invalide."); return; }

    setSaving(true);
    try {
      let imageUrl = imagePreview && !imageFile ? imagePreview : "";

      // Upload image si nouvelle
      if (imageFile) {
        setUploadProgress("📤 Upload image...");
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/admin/products/upload", {
          method: "POST", credentials: "include", body: fd,
        });
        const upData = await upRes.json().catch(() => null);
        if (!upRes.ok) throw new Error(upData?.error || "Erreur upload");
        imageUrl = upData.imageUrl || "";
        setUploadProgress("✅ Image uploadée");
      }

      const cat = categories.find(c => c.id === form.categoryId);
      const sub = subcategories.find(s => s.id === form.subcategoryId);

      const payload: Record<string, unknown> = {
        storeId,
        name: form.name.trim(),
        price,
        description: form.description.trim(),
        stock: parseInt(form.stock) || 0,
        isAvailable: form.isAvailable,
        requiresAgeVerification: form.requiresAgeVerification || !!(cat?.requires_age_check),
        updatedAt: serverTimestamp(),
      };
      if (cat) { payload.categoryId = cat.id; payload.categoryName = cat.name; }
      if (sub) { payload.subcategoryId = sub.id; payload.subcategoryName = sub.name; }
      if (imageUrl) payload.imageUrl = imageUrl;

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), payload);
      }

      setModalOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false); setUploadProgress("");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await updateDoc(doc(db, "products", deleteId), {
        isAvailable: false, deletedAt: serverTimestamp()
      });
      setDeleteId(null);
    } finally { setDeleting(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon catalogue</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {products.length} produit(s) — {products.filter(p => p.isAvailable !== false).length} disponibles
          </p>
        </div>
        <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="h-4 w-4" /> Ajouter un article
        </Button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Rechercher..." value={search}
          onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">{search ? "Aucun résultat" : "Aucun article dans votre catalogue"}</p>
          {!search && (
            <Button onClick={openAdd} variant="outline" className="mt-3 text-orange-500 border-orange-200">
              <Plus className="h-4 w-4 mr-1" /> Ajouter votre premier article
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                  {p.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <Package className="h-6 w-6 text-orange-300" />}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    {p.categoryName && (
                      <Badge variant="outline" className="text-xs text-gray-500">{p.categoryName}</Badge>
                    )}
                    {p.subcategoryName && (
                      <Badge variant="outline" className="text-xs text-blue-500">{p.subcategoryName}</Badge>
                    )}
                    {p.requiresAgeVerification && (
                      <Badge className="text-xs bg-red-100 text-red-700">18+</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-orange-500">${(p.price || 0).toFixed(2)}</span>
                    {p.stock !== undefined && (
                      <span className={`text-xs ${p.stock <= 5 ? "text-red-500" : "text-gray-400"}`}>
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={p.isAvailable !== false}
                    onCheckedChange={async () => {
                      await updateDoc(doc(db, "products", p.id), {
                        isAvailable: p.isAvailable === false, updatedAt: serverTimestamp()
                      });
                    }}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ MODAL Ajouter / Modifier ════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={v => { if (!saving) setModalOpen(v); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-500" />
              {editingId ? "Modifier l'article" : "Ajouter un article"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />{formError}
              </div>
            )}
            {uploadProgress && !formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />{uploadProgress}
              </div>
            )}

            {/* Image */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Photo de l&apos;article</Label>
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Cliquer pour ajouter une photo</span>
                  <span className="text-xs">JPG, PNG — max 5 Mo</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
            </div>

            {/* Nom */}
            <div>
              <Label className="text-sm font-medium">Nom de l&apos;article *</Label>
              <Input placeholder="ex: Coca-Cola 500ml, Baguette tradition..."
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>

            {/* Catégorie + Sous-catégorie */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Catégorie</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v, subcategoryId: "" }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.requires_age_check ? "🔞 " : ""}{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Sous-catégorie</Label>
                <Select value={form.subcategoryId} onValueChange={v => setForm(f => ({ ...f, subcategoryId: v }))}
                  disabled={!form.categoryId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={form.categoryId ? "Sélectionner..." : "Choisir catégorie"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {subcategories.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prix + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Prix ($) *</Label>
                <Input type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">Stock</Label>
                <Input type="number" min="0" placeholder="0"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <textarea value={form.description} rows={2} placeholder="Description courte..."
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Switches */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg border flex-1">
                <Switch id="sw-avail" checked={form.isAvailable}
                  onCheckedChange={v => setForm(f => ({ ...f, isAvailable: v }))} />
                <Label htmlFor="sw-avail" className="text-sm cursor-pointer">Disponible</Label>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border flex-1">
                <Switch id="sw-age" checked={form.requiresAgeVerification}
                  onCheckedChange={v => setForm(f => ({ ...f, requiresAgeVerification: v }))} />
                <Label htmlFor="sw-age" className="text-sm cursor-pointer">
                  <ShieldAlert className="h-3.5 w-3.5 inline mr-1 text-red-500" />18+
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</>
                : <><Check className="h-4 w-4" />{editingId ? "Modifier" : "Ajouter"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal suppression */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v && !deleting) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Supprimer cet article ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">L&apos;article sera masqué du catalogue. Cette action est réversible.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Annuler</Button>
            <Button onClick={handleDelete} disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2">
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin" />Suppression...</>
                : <><Trash2 className="h-4 w-4" />Supprimer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
