"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Package, Plus, Search, Edit2, RefreshCw,
  DollarSign, Tag, AlertCircle, Check, X
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  isAvailable?: boolean;
  stock?: number;
  imageUrl?: string;
  sku?: string;
}

export default function StoreCatalogPage() {
  const [storeId, setStoreId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "", stock: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, "products"), where("storeId", "==", storeId));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [storeId]);

  const toggleAvailability = async (productId: string, current: boolean) => {
    await updateDoc(doc(db, "products", productId), {
      isAvailable: !current,
      updatedAt: serverTimestamp(),
    });
  };

  const saveEdit = async (productId: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "products", productId), {
        ...editData,
        price: Number(editData.price) || 0,
        stock: editData.stock !== undefined ? Number(editData.stock) : undefined,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "products"), {
        storeId,
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category || "Général",
        description: newProduct.description || "",
        stock: newProduct.stock ? Number(newProduct.stock) : null,
        isAvailable: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewProduct({ name: "", price: "", category: "", description: "", stock: "" });
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const available = products.filter(p => p.isAvailable !== false).length;
  const unavailable = products.length - available;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon catalogue</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {products.length} produit(s) — {available} disponibles, {unavailable} indisponibles
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Ajouter
        </Button>
      </div>

      {/* Formulaire ajout */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-900">Nouveau produit</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                placeholder="Nom du produit *"
                value={newProduct.name}
                onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <Input
              placeholder="Prix ($) *"
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
            />
            <Input
              placeholder="Catégorie"
              value={newProduct.category}
              onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
            />
            <Input
              placeholder="Stock (optionnel)"
              type="number"
              value={newProduct.stock}
              onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
            />
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addProduct}
              disabled={saving || !newProduct.name || !newProduct.price}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Sauvegarder</>}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste produits */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Package className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            {search ? "Aucun produit trouvé" : "Aucun produit dans votre catalogue"}
          </p>
          {!search && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="mt-3 text-orange-500 border-orange-200"
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter votre premier produit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => {
            const isEditing = editingId === product.id;
            return (
              <div key={product.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Input
                          value={editData.name ?? product.name}
                          onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                          placeholder="Nom"
                        />
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.price ?? product.price}
                        onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))}
                        placeholder="Prix"
                      />
                      <Input
                        value={editData.category ?? product.category ?? ""}
                        onChange={e => setEditData(d => ({ ...d, category: e.target.value }))}
                        placeholder="Catégorie"
                      />
                      <Input
                        type="number"
                        value={editData.stock ?? product.stock ?? ""}
                        onChange={e => setEditData(d => ({ ...d, stock: Number(e.target.value) }))}
                        placeholder="Stock"
                      />
                      <Input
                        value={editData.description ?? product.description ?? ""}
                        onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                        placeholder="Description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEdit(product.id)}
                        disabled={saving}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" /> Sauvegarder</>}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingId(null); setEditData({}); }}
                      >
                        <X className="h-3 w-3 mr-1" /> Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4">
                    {/* Icône produit */}
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-orange-400" />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-medium text-sm truncate", !product.isAvailable && product.isAvailable !== undefined && "line-through text-gray-400")}>
                          {product.name}
                        </p>
                        {product.category && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 border-gray-200 text-gray-500 flex-shrink-0">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-sm font-bold text-orange-500">
                          ${(product.price || 0).toFixed(2)}
                        </span>
                        {product.stock !== undefined && product.stock !== null && (
                          <span className={cn("text-xs", product.stock <= 5 ? "text-red-500" : "text-gray-400")}>
                            {product.stock <= 0 ? "Rupture de stock" : `Stock: ${product.stock}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={product.isAvailable !== false}
                        onCheckedChange={() => toggleAvailability(product.id, product.isAvailable !== false)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditData({ name: product.name, price: product.price, category: product.category, description: product.description, stock: product.stock });
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
