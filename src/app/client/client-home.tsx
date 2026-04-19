"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { TAXONOMY } from "@/lib/taxonomy";
import { ACTIVE_ZONES, getNeighborZones, searchZones, type DeliveryZone } from "@/lib/delivery-zones";
import Link from "next/link";
import {
  Search, MapPin, ChevronRight, Star, Clock, Zap,
  Store, Package, ArrowRight, TrendingUp, ShieldCheck
} from "lucide-react";

interface StoreData {
  id: string; name: string; address?: string; zoneName?: string;
  isOpen?: boolean; rating?: number; totalOrders?: number;
  commerceTypeName?: string; imageUrl?: string;
  deliveryTime?: number; minOrder?: number;
}



// Top catégories pour la page accueil
const TOP_CATEGORIES = [
  { emoji: "🛒", label: "Épicerie", slug: "depanneur-epicerie" },
  { emoji: "🌸", label: "Fleurs", slug: "fleuriste" },
  { emoji: "🥩", label: "Boucherie", slug: "boucherie" },
  { emoji: "🎂", label: "Pâtisserie", slug: "patisserie" },
  { emoji: "🥦", label: "Fruits & Légumes", slug: "fruiterie-legumes" },
  { emoji: "💊", label: "Pharmacie", slug: "pharmacie-independante" },
  { emoji: "👶", label: "Bébé", slug: "boutique-bebe" },
  { emoji: "🐾", label: "Animalerie", slug: "animalerie" },
  { emoji: "🥖", label: "Boulangerie", slug: "boulangerie-artisanale" },
  { emoji: "🌿", label: "Bio & Vrac", slug: "epicerie-bio-vrac" },
];

export default function ClientHome() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentZone, setCurrentZone] = useState<DeliveryZone | null>(null);
  const [zone, setZone] = useState("Chomedey");
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [zoneSearch, setZoneSearch] = useState("");

  // Trouver la zone par défaut (Chomedey)
  useEffect(() => {
    const defaultZone = ACTIVE_ZONES.find(z => z.slug === "chomedey");
    if (defaultZone) { setCurrentZone(defaultZone); setZone(defaultZone.name); }
  }, []);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [nearbyStores, setNearbyStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; storeId: string; storeName: string; price: number; imageUrl?: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // Charger les stores de la zone
  useEffect(() => {
    async function loadStores() {
      setLoading(true);
      try {
        // Stores zone principale — chercher par nom ET slug
        const zoneNames = currentZone
          ? [currentZone.name, ...currentZone.aliases]
          : [zone];

        const q = query(
          collection(db, "stores"),
          where("status", "==", "active"),
          limit(50)
        );
        const snap = await getDocs(q);
        const allStores = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoreData));

        // Filtrer par zone
        const mainStores = allStores.filter(s =>
          zoneNames.some(n => s.zoneName?.toLowerCase().includes(n.toLowerCase()) ||
            n.toLowerCase().includes(s.zoneName?.toLowerCase() || "xxx"))
        );
        setStores(mainStores.length > 0 ? mainStores : allStores.slice(0, 10));

        // Zones voisines depuis delivery-zones
        if (currentZone) {
          const neighborZones = getNeighborZones(currentZone.id);
          const neighborNames = neighborZones.flatMap(z => [z.name, ...z.aliases]);
          const nearbyList = allStores.filter(s =>
            !mainStores.find(m => m.id === s.id) &&
            neighborNames.some(n => s.zoneName?.toLowerCase().includes(n.toLowerCase()))
          );
          setNearbyStores(nearbyList.slice(0, 8));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, [zone, currentZone]);

  // Recherche autocomplete
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query(
          collection(db, "products"),
          where("isAvailable", "==", true),
          limit(8)
        );
        const snap = await getDocs(q);
        const results = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as { id: string; name: string; storeId: string; storeName: string; price: number; imageUrl?: string }))
          .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
        setSearchResults(results);
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredStores = selectedCat
    ? stores.filter(s => {
        const ct = TAXONOMY.find(t => t.slug === selectedCat);
        return s.commerceTypeName === ct?.name;
      })
    : stores;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white pt-8 pb-16 px-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-3xl mx-auto relative">
          {/* Zone */}
          <div className="flex items-center gap-2 mb-4 relative">
            <button onClick={() => setShowZonePicker(v => !v)}
              className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 border border-white/20 hover:bg-white/20 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-sm font-medium">{currentZone?.name || zone}</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </button>

            {showZonePicker && (
              <div className="absolute top-10 left-0 w-72 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-white/10">
                  <input value={zoneSearch} onChange={e => setZoneSearch(e.target.value)}
                    placeholder="Chercher votre zone..."
                    className="w-full bg-white/10 text-white placeholder-gray-500 text-sm px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-orange-500/50" />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {(zoneSearch.length >= 2 ? searchZones(zoneSearch) : ACTIVE_ZONES.slice(0, 20)).map(z => (
                    <button key={z.id} onClick={() => { setCurrentZone(z); setZone(z.name); setShowZonePicker(false); setZoneSearch(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                      <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{z.name}</p>
                        <p className="text-[10px] text-gray-500">{z.city} · {z.estimated_time_min}-{z.estimated_time_max} min</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
            Livraison express<br />
            <span className="text-orange-400">dans votre quartier</span>
          </h1>
          <p className="text-gray-300 text-sm mb-6">
            {stores.length} commerce{stores.length !== 1 ? "s" : ""} disponible{stores.length !== 1 ? "s" : ""} · Livraison en 30 min
          </p>

          {/* Search bar */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-2xl shadow-black/20">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un article, un commerce..."
                className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 outline-none font-medium"
              />
              {searching && (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </div>

            {/* Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {searchResults.map((r, i) => (
                  <Link key={i} href={`/client/store/${r.storeId}`}
                    onClick={() => { setSearch(""); setSearchResults([]); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm">
                      {r.imageUrl
                        ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover rounded-lg" /> // eslint-disable-line
                        : <Package className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.storeName}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-500">${r.price?.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="flex gap-6 items-start">
          {/* Colonne principale */}
          <div className="flex-1 min-w-0 space-y-8">

        {/* ── STATS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Zap, value: "30 min", label: "Livraison", color: "text-orange-500", bg: "bg-orange-50" },
            { icon: Store, value: `${stores.length}+`, label: "Commerces", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: ShieldCheck, value: "100%", label: "Sécurisé", color: "text-green-500", bg: "bg-green-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── CATÉGORIES ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Catégories</h2>
            <button onClick={() => setSelectedCat(null)}
              className={`text-xs font-medium ${!selectedCat ? "text-orange-500" : "text-gray-400"}`}>
              Tout voir
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {TOP_CATEGORIES.map(cat => (
              <button key={cat.slug}
                onClick={() => setSelectedCat(selectedCat === cat.slug ? null : cat.slug)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border shrink-0 transition-all ${
                  selectedCat === cat.slug
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white border-gray-100 text-gray-700 hover:border-orange-200"
                }`}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── COMMERCES DANS VOTRE ZONE ──────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Commerces ouverts
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />{zone}
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold">En direct</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Aucun commerce disponible dans votre zone</p>
              <p className="text-gray-400 text-xs mt-1">Vérifiez les zones voisines ci-dessous</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>

        {/* ── ZONES VOISINES ─────────────────────────────────────── */}
        {nearbyStores.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Zones voisines</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {nearbyStores.length} commerce{nearbyStores.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyStores.map(store => (
                <StoreCard key={store.id} store={store} nearby />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA inscription ────────────────────────────────────── */}
        {!user && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-xl font-bold mb-2">Première livraison gratuite 🎉</h3>
            <p className="text-orange-100 text-sm mb-4">Inscrivez-vous et profitez de la livraison offerte sur votre première commande.</p>
            <Link href="/client/signup"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
              Créer mon compte <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
          </div>{/* fin colonne principale */}

          {/* ── CARTE GOOGLE MAPS — desktop uniquement ─────────── */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-20">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header carte */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-gray-900">Carte de la zone</span>
                </div>
                <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  En direct
                </span>
              </div>

              {/* Map iframe Google Maps */}
              <div className="h-72">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-73.7124!3d45.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sca!4v1"
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Légende */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🏪</span>
                    <span>{filteredStores.filter(s => s.isOpen).length} commerce{filteredStores.filter(s => s.isOpen).length > 1 ? "s" : ""} ouvert{filteredStores.filter(s => s.isOpen).length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🚗</span>
                    <span>Chauffeurs actifs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone info card */}
            <div className="mt-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Votre zone de livraison
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Zone</span>
                  <span className="font-semibold text-gray-900">{zone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Délai estimé</span>
                  <span className="font-semibold text-orange-500">25–35 min</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Commerces actifs</span>
                  <span className="font-semibold text-gray-900">{filteredStores.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Zones voisines</span>
                  <span className="font-semibold text-blue-500">{(ZONE_NEIGHBORS[zone] || []).length} zones</span>
                </div>
              </div>
            </div>
          </div>

        </div>{/* fin flex principal */}

        {/* Carte mobile — en bas de page */}
        <div className="lg:hidden mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-900">Carte de la zone</span>
            </div>
            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              En direct
            </span>
          </div>
          <div className="h-56">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-73.7124!3d45.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sca!4v1"
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function StoreCard({ store, nearby }: { store: StoreData; nearby?: boolean }) {
  return (
    <Link href={`/client/store/${store.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group overflow-hidden">
      {/* Image header */}
      <div className="h-24 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center relative">
        {store.imageUrl
          ? <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" /> // eslint-disable-line
          : <div className="text-4xl">🏪</div>}
        {/* Status badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          store.isOpen ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? "bg-white" : "bg-gray-400"}`} />
          {store.isOpen ? "Ouvert" : "Fermé"}
        </div>
        {nearby && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Zone voisine
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-600 transition-colors">
              {store.name}
            </p>
            {store.commerceTypeName && (
              <p className="text-xs text-gray-500 truncate">{store.commerceTypeName}</p>
            )}
          </div>
          {store.rating && store.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-gray-700">{store.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {store.deliveryTime || 30} min
          </span>
          {store.address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{store.address}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
