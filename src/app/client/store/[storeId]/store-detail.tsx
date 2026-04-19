"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import {
  ArrowLeft, Star, Clock, MapPin, Phone, Package,
  Search, ShoppingCart, Plus, Minus, Store
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface StoreData {
  id: string; name: string; address?: string; phone?: string;
  zoneName?: string; isOpen?: boolean; rating?: number;
  commerceTypeName?: string; totalOrders?: number;
}

interface Product {
  id: string; name: string; price: number; description?: string;
  isAvailable?: boolean; stock?: number; imageUrl?: string;
  categoryName?: string; subcategoryName?: string;
  requiresAgeVerification?: boolean;
}

export default function StoreDetail() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const cart = useCart();

  useEffect(() => {
    async function load() {
      try {
        // Charger le store
        const storeDoc = await getDoc(doc(db, "stores", storeId));
        if (storeDoc.exists()) setStore({ id: storeDoc.id, ...storeDoc.data() } as StoreData);

        // Charger les produits disponibles
        const q = query(
          collection(db, "products"),
          where("storeId", "==", storeId),
          where("isAvailable", "==", true)
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [storeId]);

  // Catégories disponibles
  const categories = [...new Set(products.map(p => p.categoryName).filter(Boolean))] as string[];

  // Produits filtrés
  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCat || p.categoryName === selectedCat;
    return matchSearch && matchCat;
  });

  // Produits groupés par catégorie
  const grouped = filtered.reduce((acc, p) => {
    const cat = p.categoryName || "Autres";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  function addToCart(product: Product) {
    cart.add({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      storeId,
      storeName: store?.name || "",
    });
  }

  const cartQty = (productId: string) => cart.qty(productId);
  const cartTotal = cart.total;
  const cartCount = cart.count;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );

  if (!store) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Commerce introuvable</p>
        <button onClick={() => router.back()} className="mt-3 text-orange-500 text-sm font-medium">← Retour</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* ── HEADER STORE ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {/* Back button */}
        <div className="px-4 pt-4">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>

        {/* Store info */}
        <div className="px-4 py-6">
          <div className="flex items-start gap-4">
            {/* Logo store */}
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl shrink-0">
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{store.name}</h1>
              {store.commerceTypeName && (
                <p className="text-gray-400 text-sm mt-0.5">{store.commerceTypeName}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* Status */}
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  store.isOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {store.isOpen ? "Ouvert maintenant" : "Fermé"}
                </span>
                {/* Rating */}
                {store.rating && store.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {store.rating.toFixed(1)}
                  </span>
                )}
                {/* Délai */}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> 25-35 min
                </span>
              </div>
            </div>
          </div>

          {/* Adresse & tel */}
          <div className="mt-4 space-y-1.5">
            {store.address && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{store.address}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{store.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">

        {/* ── RECHERCHE ──────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm outline-none focus:border-orange-400 transition-colors" />
        </div>

        {/* ── CATÉGORIES ─────────────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setSelectedCat(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                !selectedCat ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-100"
              }`}>
              Tout
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCat === cat ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-100"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── PRODUITS ───────────────────────────────────────────── */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun article disponible</p>
            <p className="text-gray-400 text-sm mt-1">Ce commerce n&apos;a pas encore ajouté d&apos;articles</p>
          </div>
        ) : Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            {/* Titre catégorie */}
            {!selectedCat && (
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full" />
                {cat}
              </h2>
            )}
            <div className="space-y-3">
              {items.map(product => {
                const qty = cartQty(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> // eslint-disable-line
                          : <Package className="h-8 w-8 text-gray-300" />}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
                        )}
                        {product.subcategoryName && (
                          <span className="inline-block mt-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {product.subcategoryName}
                          </span>
                        )}
                        {product.requiresAgeVerification && (
                          <span className="inline-block mt-1 ml-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">18+</span>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-orange-500 font-bold">${product.price.toFixed(2)}</span>

                          {/* Bouton ajouter / +- */}
                          {qty === 0 ? (
                            <button onClick={() => addToCart(product)}
                              className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-colors">
                              <Plus className="h-3.5 w-3.5" /> Ajouter
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => cart.decrement(product.id)}
                                className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors">
                                <Minus className="h-3.5 w-3.5 text-orange-600" />
                              </button>
                              <span className="text-sm font-bold text-gray-900 w-4 text-center">{qty}</span>
                              <button onClick={() => addToCart(product)}
                                className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                                <Plus className="h-3.5 w-3.5 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── BARRE PANIER FIXE ──────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 z-50">
          <Link href="/client/cart"
            className="flex items-center justify-between bg-orange-500 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="font-bold">{cartCount} article{cartCount > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
              <span className="text-orange-200 text-sm">Voir le panier →</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
