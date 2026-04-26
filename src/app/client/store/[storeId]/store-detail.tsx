"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft, Star, Clock, MapPin, Phone, Package,
  Search, ShoppingCart, Plus, Minus, Store, ChevronRight
} from "lucide-react";

interface StoreData {
  id: string; name: string; address?: string; phone?: string;
  zoneName?: string; isOpen?: boolean; rating?: number;
  commerceTypeName?: string; imageUrl?: string;
}

interface Product {
  id: string; name: string; price: number; description?: string;
  isAvailable?: boolean; stock?: number; imageUrl?: string;
  categoryName?: string; subcategoryName?: string;
  requiresAgeVerification?: boolean;
}

// 10 blocs de sous-catégories avec emojis
const SUBCATEGORY_BLOCKS = [
  { key: "boissons", label: "🥤 Boissons froides", keywords: ["eau", "soda", "jus", "boisson", "energy", "sport", "thé glacé", "café froid"] },
  { key: "alcool", label: "🍺 Alcool & bières", keywords: ["bière", "vin", "alcool", "spiritueux", "cooler", "seltzer", "lager", "ipa"] },
  { key: "snacks", label: "🍿 Snacks & chips", keywords: ["chips", "craquelin", "nachos", "pop-corn", "bretzel", "noix", "snack", "collation"] },
  { key: "chocolat", label: "🍫 Chocolat & bonbons", keywords: ["chocolat", "bonbon", "barre", "caramel", "sucette", "gomme", "friandise", "candy"] },
  { key: "cafe", label: "☕ Café & boissons chaudes", keywords: ["café", "thé", "tisane", "capsule", "expresso", "chocolat chaud"] },
  { key: "tabac", label: "🚬 Tabac & vapotage", keywords: ["cigarette", "cigare", "tabac", "vape", "vapotage", "pod", "nicotine", "briquet"] },
  { key: "epicerie", label: "🛒 Épicerie & lait", keywords: ["lait", "pain", "beurre", "oeuf", "fromage", "yogourt", "crème", "farine"] },
  { key: "hygiene", label: "🧴 Hygiène & santé", keywords: ["savon", "shampoing", "déodorant", "dentifrice", "rasoir", "vitamine", "médicament"] },
  { key: "bebe", label: "👶 Bébé & couches", keywords: ["couche", "lingette", "biberon", "lait maternisé", "purée bébé", "sucette"] },
  { key: "loterie", label: "🎰 Loterie & divers", keywords: ["loterie", "gratteux", "journal", "magazine", "carte-cadeau", "allumette"] },
];

function matchBlock(product: Product, keywords: string[]): boolean {
  const fields = [
    product.name, product.categoryName, product.subcategoryName, product.description
  ].join(" ").toLowerCase();
  return keywords.some(k => fields.includes(k.toLowerCase()));
}

// Composant carte utilisant Maps JavaScript API (même clé que le dashboard)
declare global { interface Window { google: any; initStoreMap: () => void; } }
function StoreMap({ address, lat, lng }: { address: string; lat?: number; lng?: number }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      const center = lat && lng ? { lat, lng } : { lat: 45.55, lng: -73.75 };
      const map = new window.google.maps.Map(mapRef.current, {
        center, zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      });
      new window.google.maps.Marker({
        position: center, map,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: '#f97316', fillOpacity: 1,
          strokeColor: '#fff', strokeWeight: 2,
          scale: 1.8, anchor: new window.google.maps.Point(12, 22),
        },
      });
    };
    if (window.google?.maps) { initMap(); return; }
    window.initStoreMap = initMap;
    if (!document.querySelector('script[data-storemap]')) {
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAmDwm43D52jpgDp1MiNg_TvLBn_fDTsU8&callback=initStoreMap';
      s.async = true;
      s.setAttribute('data-storemap', '1');
      document.head.appendChild(s);
    }
  }, [lat, lng]);
  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />;
}


export default function StoreDetail() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const cart = useCart();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const storeDoc = await getDoc(doc(db, "stores", storeId));
        if (storeDoc.exists()) setStore({ id: storeDoc.id, ...storeDoc.data() } as StoreData);
        const q = query(collection(db, "products"), where("storeId", "==", storeId));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
          .filter(p => p.isAvailable !== false));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [storeId]);

  // Produits filtrés par recherche
  const searchFiltered = search.trim().length > 0
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategoryName?.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  // Blocs avec produits
  const blocksWithProducts = SUBCATEGORY_BLOCKS.map(block => ({
    ...block,
    products: products.filter(p => matchBlock(p, block.keywords)).slice(0, 6)
  })).filter(b => b.products.length > 0);

  // Produits sans bloc (autres)
  const categorizedIds = new Set(blocksWithProducts.flatMap(b => b.products.map(p => p.id)));
  const otherProducts = products.filter(p => !categorizedIds.has(p.id)).slice(0, 6);

  const cartTotal = cart.total;
  const cartCount = cart.count;

  function addToCart(product: Product) {
    cart.add({
      id: product.id, name: product.name, price: product.price,
      imageUrl: product.imageUrl, categoryName: product.categoryName,
      storeId, storeName: store?.name || "",
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );

  if (!store) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <Store className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500">Commerce introuvable</p>
      <button onClick={() => router.back()} className="mt-3 text-orange-500 text-sm font-medium">← Retour</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* ── HEADER STORE ── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="px-4 pt-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        </div>
        <div className="px-4 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl shrink-0">
              🏪
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{store.name}</h1>
              {store.commerceTypeName && <p className="text-gray-400 text-sm">{store.commerceTypeName}</p>}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  store.isOpen ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {store.isOpen ? "Ouvert" : "Fermé"}
                </span>
                {store.rating && store.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-400" />{store.rating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> 25-35 min
                </span>
              </div>
              {store.address && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{store.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex gap-6 items-start">

        {/* ── CONTENU PRINCIPAL ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm outline-none focus:border-orange-400" />
          </div>

          {/* ── RÉSULTATS RECHERCHE ── */}
          {searchFiltered !== null ? (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">
                {searchFiltered.length} résultat{searchFiltered.length > 1 ? "s" : ""} pour &quot;{search}&quot;
              </p>
              {searchFiltered.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucun article trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchFiltered.map(p => <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} qty={cart.qty(p.id)} onDecrement={() => cart.decrement(p.id)} />)}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ── BLOCS SOUS-CATÉGORIES ── */}
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                  <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun article disponible</p>
                  <p className="text-gray-400 text-sm mt-1">Ce commerce n&apos;a pas encore ajouté d&apos;articles</p>
                </div>
              ) : (
                <>
                  {/* Filtres blocs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setActiveBlock(null)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        !activeBlock ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-100"
                      }`}>
                      Tout voir
                    </button>
                    {blocksWithProducts.map(b => (
                      <button key={b.key} onClick={() => setActiveBlock(activeBlock === b.key ? null : b.key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                          activeBlock === b.key ? "bg-orange-500 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-100"
                        }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {/* Blocs produits */}
                  {(activeBlock ? blocksWithProducts.filter(b => b.key === activeBlock) : blocksWithProducts).map(block => (
                    <div key={block.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Header bloc */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="text-sm font-bold text-gray-900">{block.label}</h2>
                        <span className="text-xs text-gray-400">{block.products.length} article{block.products.length > 1 ? "s" : ""}</span>
                      </div>
                      {/* Grille 6 articles max */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-gray-50">
                        {block.products.map(p => (
                          <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)}
                            qty={cart.qty(p.id)} onDecrement={() => cart.decrement(p.id)} />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Bloc "Autres articles" */}
                  {otherProducts.length > 0 && !activeBlock && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="text-sm font-bold text-gray-900">📦 Autres articles</h2>
                        <span className="text-xs text-gray-400">{otherProducts.length} article{otherProducts.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-gray-50">
                        {otherProducts.map(p => (
                          <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)}
                            qty={cart.qty(p.id)} onDecrement={() => cart.decrement(p.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* ── CARTE GOOGLE MAPS — desktop ── */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-gray-900">Localisation</span>
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 ${store.isOpen ? "text-green-500" : "text-red-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                {store.isOpen ? "Ouvert" : "Fermé"}
              </span>
            </div>
            <div className="h-56">
<StoreMap address={store.address || store.name || ''} lat={store.lat} lng={store.lng} />
            </div>
            <div className="p-4 space-y-2">
              {store.address && (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>
              )}
              {store.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>{store.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span>Livraison 25–35 min</span>
              </div>
            </div>
          </div>

          {/* Résumé panier */}
          {cartCount > 0 && (
            <div className="bg-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-bold">{cartCount} article{cartCount > 1 ? "s" : ""}</span>
                </div>
                <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
              </div>
              <Link href="/client/cart"
                className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors w-full">
                Voir mon panier <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── BARRE PANIER MOBILE ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 z-50 lg:hidden">
          <Link href="/client/cart"
            className="flex items-center justify-between bg-orange-500 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-orange-500/30">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="font-bold">{cartCount} article{cartCount > 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
              <ChevronRight className="h-4 w-4 text-orange-200" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── COMPOSANT CARTE PRODUIT ──────────────────────────────────────────────────
function ProductCard({ product, onAdd, qty, onDecrement }: {
  product: Product;
  onAdd: () => void;
  qty: number;
  onDecrement: () => void;
}) {
  return (
    <div className="p-4 flex flex-col gap-3 hover:bg-orange-50/50 transition-colors">
      {/* Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> // eslint-disable-line
          : <Package className="h-8 w-8 text-gray-200" />}
      </div>

      {/* Infos */}
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
        {product.subcategoryName && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{product.subcategoryName}</p>
        )}
        {product.requiresAgeVerification && (
          <span className="text-[9px] text-red-500 font-bold">18+</span>
        )}
      </div>

      {/* Prix + bouton */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-orange-500">${product.price.toFixed(2)}</span>
        {qty === 0 ? (
          <button onClick={onAdd}
            className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
            <Plus className="h-4 w-4 text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button onClick={onDecrement}
              className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors">
              <Minus className="h-3 w-3 text-orange-600" />
            </button>
            <span className="text-xs font-bold text-gray-900 w-4 text-center">{qty}</span>
            <button onClick={onAdd}
              className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <Plus className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
