"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, getDocs, limit } from "firebase/firestore";
import { ACTIVE_ZONES, getNeighborZones, searchZones, type DeliveryZone } from "@/lib/delivery-zones";
import Link from "next/link";
import {
  Search, MapPin, ChevronRight, Star, Clock, Zap,
  Store, Package, ArrowRight, ShieldCheck, Bell, User,
  Heart, ShoppingCart, ChevronDown, Leaf, Snowflake
} from "lucide-react";

interface Product {
  id: string; name: string; price: number;
  imageUrl?: string; categoryName?: string; subcategoryName?: string;
  department?: string; section?: string;
  storeId: string; storeName?: string;
  isOrganic?: boolean; isFrozen?: boolean; isFresh?: boolean;
}
interface StoreData {
  id: string; name: string; address?: string; zoneName?: string;
  isOpen?: boolean; rating?: number; totalOrders?: number;
  commerceTypeName?: string; imageUrl?: string;
  deliveryTime?: number; minOrder?: number;
}

// Catégories — matchs EXACTS sur les vrais champs Firestore/JSON
const CATEGORIES = [
  { key:"all",          emoji:"🏠", label:"Accueil"          },
  { key:"epicerie",     emoji:"🛒", label:"Épicerie"         },
  { key:"fruits",       emoji:"🥦", label:"Fruits & Légumes" },
  { key:"viandes",      emoji:"🥩", label:"Boucherie"        },
  { key:"pharma",       emoji:"💊", label:"Pharmacie"        },
  { key:"snacks",       emoji:"🍿", label:"Collations"       },
  { key:"boissons",     emoji:"🧃", label:"Boissons"         },
  { key:"laitiers",     emoji:"🥛", label:"Laitiers & Œufs" },
  { key:"boulangerie",  emoji:"🍞", label:"Boulangerie"      },
  { key:"bebe",         emoji:"👶", label:"Bébé"             },
  { key:"bio",          emoji:"🌿", label:"Bio"              },
  { key:"congeles",     emoji:"❄️", label:"Surgelés"         },
  { key:"vitamines",    emoji:"💪", label:"Vitamines"        },
];

// Matching par department/categoryName/subcategoryName exacts (lowercase)
function matchCat(p: Product, key: string): boolean {
  if (key === "all") return true;
  const dept = (p.department||"").toLowerCase().trim();
  const cat  = (p.categoryName||"").toLowerCase().trim();
  const sub  = (p.subcategoryName||"").toLowerCase().trim();

  if (key === "bio")     return !!p.isOrganic;
  if (key === "congeles")return dept === "aliments congelés" || !!p.isFrozen;

  if (key === "fruits")
    return dept.includes("fruits et légumes") || cat === "fruits & légumes";

  if (key === "viandes")
    return ["bœuf","poulet","dinde","porc","poissons","fruits de mer","charcuterie","substituts de viande"].includes(sub);

  if (key === "boissons")
    return dept === "boissons" ||
           ["boissons gazeuses","eau","jus","énergie et sport"].includes(sub);

  if (key === "laitiers")
    return dept === "produits laitiers et œufs";

  if (key === "snacks")
    return ["croustilles et craquelins","bonbons et chocolat","barres et noix"].includes(sub);

  if (key === "boulangerie")
    return ["pains","déjeuner boulangerie"].includes(sub);

  if (key === "bebe")
    return dept === "bébé et besoins spéciaux" || sub === "bébé et enfant";

  if (key === "pharma")
    return cat === "pharmacie / santé" && sub !== "vitamines et produits naturels";

  if (key === "vitamines")
    return sub === "vitamines et produits naturels";

  if (key === "epicerie")
    return dept === "garde-manger";

  return false;
}

// Sections produits pour la home (même keys que matchCat)
const SECTIONS = [
  { key:"epicerie",     emoji:"🛒", label:"Épicerie & Garde-Manger",      color:"#f97316", bg:"#fff7ed" },
  { key:"fruits",       emoji:"🥦", label:"Fruits & Légumes",              color:"#22c55e", bg:"#f0fdf4" },
  { key:"viandes",      emoji:"🥩", label:"Boucherie & Poissons",          color:"#ef4444", bg:"#fef2f2" },
  { key:"pharma",       emoji:"💊", label:"Pharmacie & Santé",             color:"#3b82f6", bg:"#eff6ff" },
  { key:"boissons",     emoji:"🧃", label:"Boissons",                      color:"#8b5cf6", bg:"#f5f3ff" },
  { key:"laitiers",     emoji:"🥛", label:"Produits Laitiers & Œufs",      color:"#0ea5e9", bg:"#f0f9ff" },
  { key:"snacks",       emoji:"🍿", label:"Collations & Snacks",           color:"#f59e0b", bg:"#fffbeb" },
  { key:"boulangerie",  emoji:"🍞", label:"Boulangerie",                   color:"#d97706", bg:"#fefce8" },
  { key:"bio",          emoji:"🌿", label:"Produits Bio",                  color:"#10b981", bg:"#ecfdf5" },
  { key:"congeles",     emoji:"❄️", label:"Surgelés",                      color:"#06b6d4", bg:"#ecfeff" },
  { key:"bebe",         emoji:"👶", label:"Bébé & Enfant",                 color:"#ec4899", bg:"#fdf2f8" },
  { key:"vitamines",    emoji:"💪", label:"Vitamines & Produits Naturels",  color:"#84cc16", bg:"#f7fee7" },
];

export default function ClientHome() {
  const [user,         setUser]         = useState<FirebaseUser|null>(null);
  const [zone,         setZone]         = useState("Chomedey");
  const [currentZone,  setCurrentZone]  = useState<DeliveryZone|null>(null);
  const [showZonePicker,setShowZonePicker] = useState(false);
  const [zoneSearch,   setZoneSearch]   = useState("");
  const [stores,       setStores]       = useState<StoreData[]>([]);
  const [nearbyStores, setNearbyStores] = useState<StoreData[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [searchResults,setSearchResults]= useState<any[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [activeCat,    setActiveCat]    = useState("all");
  const searchRef = useRef<HTMLDivElement>(null);
  const catRef    = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>setUser(u));
    return ()=>unsub();
  },[]);

  useEffect(()=>{
    async function load() {
      setLoading(true);
      try {
        // Stores
        const snap = await getDocs(collection(db,"stores"));
        const list = snap.docs.map(d=>({id:d.id,...d.data()} as StoreData));
        setStores(list.filter(s=>s.isOpen));
        setNearbyStores(list.filter(s=>!s.isOpen).slice(0,4));

        // Trouver le premier store actif pour lier les produits catalogues
        const activeStore = list.find(s=>s.isOpen) || list[0];
        const defaultStoreId = activeStore?.id || "";
        const defaultStoreName = activeStore?.name || "FastDép";

        // Produits Firestore (importés)
        const psnap = await getDocs(query(collection(db,"products"),limit(500)));
        const firestoreProds = psnap.docs.map(d=>{
          const data = d.data();
          return {
            id:d.id,
            name: data.name||data.name_fr||"",
            price: data.price||0,
            imageUrl: data.imageUrl||"",
            categoryName: data.categoryName||data.category||"",
            subcategoryName: data.subcategoryName||data.subcategory||"",
            department: data.department||"",
            section: data.section||"",
            storeId: data.storeId||"",
            storeName: data.storeName||list.find(s=>s.id===data.storeId)?.name||"Commerce",
            isOrganic: data.isOrganic||false,
            isFrozen: data.isFrozen||false,
            isFresh: data.isFresh||false,
          } as Product;
        }).filter(p=>p.name&&p.price>0);

        // Charger catalogues JSON publics (alimentation + fruits + pharmacie)
        const catalogFiles = [
          "/catalogue-alimentation.json",
          "/catalogue-fruits-legumes.json",
          "/catalogue-otc.json",
        ];
        const catalogProds: Product[] = [];
        for (const file of catalogFiles) {
          try {
            const res = await fetch(file);
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.products || [];
            items.forEach((p:any, i:number) => {
              if (!p.name && !p.name_fr) return;
              const price = typeof p.priceEstimateCAD==="object"
                ? Math.round(((p.priceEstimateCAD?.min||0)+(p.priceEstimateCAD?.max||0))/2*100)/100
                : p.price || p.priceEstimateCAD || 0;
              if (!price) return;
              catalogProds.push({
                id: `cat-${file.replace(/\//g,"")}-${i}`,
                name: p.name||p.name_fr||"",
                price,
                imageUrl: p.imageUrl||"",
                categoryName: p.categoryName||p.department||p.category||"",
                subcategoryName: p.subcategoryName||p.subcategory||"",
                department: p.department||"",
                section: p.section||"",
                storeId: p.storeId||defaultStoreId,
                storeName: p.storeName||defaultStoreName,
                isOrganic: p.isOrganic||false,
                isFrozen: p.isFrozen||false,
                isFresh: p.isFresh||false,
              });
            });
          } catch(e){ console.warn("catalogue load failed:", file, e); }
        }

        // Fusionner — Firestore en premier, catalogues en complément
        const firestoreIds = new Set(firestoreProds.map(p=>p.name.toLowerCase()));
        const uniqueCatalog = catalogProds.filter(p=>!firestoreIds.has(p.name.toLowerCase()));
        setProducts([...firestoreProds, ...uniqueCatalog]);

      } catch(e){console.error(e);}
      finally{setLoading(false);}
    }
    load();
  },[zone]);

  // Recherche
  useEffect(()=>{
    if (!search.trim()||search.length<2){setSearchResults([]);return;}
    const t = setTimeout(()=>{
      setSearching(true);
      const r = products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).slice(0,8);
      setSearchResults(r);
      setSearching(false);
    },200);
    return ()=>clearTimeout(t);
  },[search,products]);

  const filteredProducts = activeCat==="all" ? products : products.filter(p=>matchCat(p,activeCat));
  const bio = products.filter(p=>p.isOrganic);
  const frozen = products.filter(p=>p.isFrozen);

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{background:"#f8f9fb"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body{font-family:'Plus Jakarta Sans',sans-serif;}
        .scrollbar-hide::-webkit-scrollbar{display:none;}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none;}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .shimmer{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease forwards;}
      `}</style>

      {/* ── HERO — version mobile dark, version desktop gradient ── */}
      <div className="relative overflow-hidden" style={{background:"linear-gradient(145deg,#0f0f0f 0%,#1a0a00 50%,#2d1200 100%)"}}>
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{background:"radial-gradient(circle,#f97316,transparent)",transform:"translate(30%,-30%)"}}/>
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 pointer-events-none" style={{background:"radial-gradient(circle,#f59e0b,transparent)",transform:"translate(-30%,30%)"}}/>

        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8 sm:pt-10 sm:pb-12">
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            {/* Zone picker */}
            <button onClick={()=>setShowZonePicker(v=>!v)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-2 hover:bg-white/15 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-orange-400"/>
              <span className="text-sm font-semibold text-white">{zone}</span>
              <ChevronDown className="h-3 w-3 text-gray-400"/>
            </button>
            {/* User */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                <Bell className="h-4 w-4 text-gray-300"/>
              </button>
              <Link href={user?"/client/profile":"/client/login"}
                className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
                {user
                  ? <span className="text-white text-xs font-bold">{user.email?.[0]?.toUpperCase()}</span>
                  : <User className="h-4 w-4 text-white"/>}
              </Link>
            </div>
          </div>

          {/* Zone picker dropdown */}
          {showZonePicker && (
            <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-auto sm:w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <input value={zoneSearch} onChange={e=>setZoneSearch(e.target.value)}
                  placeholder="Chercher votre zone..."
                  className="w-full bg-white/10 text-white placeholder-gray-500 text-sm px-3 py-2 rounded-xl outline-none"/>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {(zoneSearch.length>=2?searchZones(zoneSearch):ACTIVE_ZONES.slice(0,15)).map(z=>(
                  <button key={z.id} onClick={()=>{setCurrentZone(z);setZone(z.name);setShowZonePicker(false);setZoneSearch("");}}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                    <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0"/>
                    <div>
                      <p className="text-sm font-medium text-white">{z.name}</p>
                      <p className="text-[10px] text-gray-500">{z.city} · {z.estimated_time_min}-{z.estimated_time_max} min</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hero: titre + carte côte à côte sur desktop, empilés sur mobile */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-6 mb-6">
            {/* Texte */}
            <div className="flex-1 mb-4 lg:mb-0">
              <p className="text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-2">⚡ Livraison express 30 min</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1.5">
                Livré chez vous,{" "}
                <span style={{background:"linear-gradient(135deg,#f97316,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                  en un clic
                </span>
              </h1>
              <p className="text-gray-400 text-xs mb-4">{stores.length} commerce{stores.length!==1?"s":""} ouverts · {products.length} articles disponibles</p>
              {/* Stats mini */}
              <div className="flex flex-wrap gap-2">
                {[
                  {e:"⚡",l:"30 min"},
                  {e:"🌿",l:`${bio.length} bio`},
                  {e:"🛒",l:`${products.length} articles`},
                ].map(b=>(
                  <div key={b.l} className="flex items-center gap-1 bg-white/8 border border-white/10 rounded-full px-2.5 py-1">
                    <span className="text-[10px]">{b.e}</span>
                    <span className="text-[10px] text-gray-300 font-medium">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte Google Maps intégrée dans le hero */}
            <div className="lg:w-80 xl:w-96 rounded-2xl overflow-hidden border border-white/10 shrink-0" style={{height:"160px"}}>
              <div className="relative h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-73.7124!3d45.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sca!4v1"
                  width="100%" height="100%"
                  style={{border:0,filter:"invert(90%) hue-rotate(180deg) brightness(0.85)"}}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"/>
                {/* Overlay label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none">
                  <p className="text-white text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                    {stores.filter(s=>s.isOpen).length} commerces ouverts · {zone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-2xl shadow-orange-900/20">
              <Search className="h-5 w-5 text-gray-400 shrink-0"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Advil, pommes, chips, yaourt..."
                className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 outline-none font-medium"/>
              {searching && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0"/>}
            </div>
            {/* Résultats recherche */}
            {searchResults.length>0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searchResults.map((p,i)=>(
                  <Link key={i} href={`/client/store/${p.storeId}`}
                    onClick={()=>{setSearch("");setSearchResults([]);}}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b last:border-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover"/> : <Package className="h-5 w-5 text-gray-300 m-auto mt-2.5"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.storeName} · {p.categoryName}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-500 shrink-0">{p.price?.toFixed(2)} $</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Badges stats */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              {icon:"❄️",label:`${frozen.length} surgelés`},
              {icon:"👶",label:"Bébé & enfant"},
            ].map(b=>(
              <div key={b.label} className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-2.5 py-1">
                <span className="text-[10px]">{b.icon}</span>
                <span className="text-[10px] text-gray-300 font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── CATÉGORIES SCROLL ── */}
        <div>
          <div ref={catRef} className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map(cat=>(
              <button key={cat.key}
                onClick={()=>setActiveCat(cat.key)}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border shrink-0 transition-all text-center ${
                  activeCat===cat.key
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"
                }`}>
                <span className="text-xl leading-none">{cat.emoji}</span>
                <span className="text-[11px] font-bold whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* ── COLONNE PRINCIPALE ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── COMMERCES OUVERTS ── */}
            {stores.length>0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    Commerces ouverts
                  </h2>
                  <span className="text-xs text-gray-400">{stores.length} disponibles</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3">
                  {loading ? [1,2,3].map(i=>(
                    <div key={i} className="shrink-0 w-64 md:w-auto h-36 rounded-2xl shimmer"/>
                  )) : stores.slice(0,6).map(store=>(
                    <StoreCard key={store.id} store={store}/>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTIONS PRODUITS ── */}
            {activeCat==="all" ? (
              // Vue accueil — toutes les sections
              SECTIONS.map(sec=>{
                const prods = products.filter(p=>matchCat(p,sec.key)).slice(0,10);
                if (prods.length===0) return null;
                return (
                  <div key={sec.key} className="fade-up">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                          style={{background:sec.bg}}>{sec.emoji}</span>
                        {sec.label}
                      </h2>
                      <button onClick={()=>setActiveCat(sec.key)}
                        className="text-xs font-semibold text-orange-500 flex items-center gap-0.5">
                        Tout voir <ChevronRight className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {prods.map(p=><ProductCard key={p.id} product={p}/>)}
                    </div>
                  </div>
                );
              })
            ) : (
              // Vue catégorie filtrée
              <div className="fade-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">
                    {CATEGORIES.find(c=>c.key===activeCat)?.emoji}{" "}
                    {CATEGORIES.find(c=>c.key===activeCat)?.label}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredProducts.length} articles
                  </span>
                </div>
                {filteredProducts.length===0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <Package className="h-10 w-10 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-500 text-sm font-medium">Aucun produit dans cette catégorie</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredProducts.slice(0,40).map(p=>(
                      <ProductCardGrid key={p.id} product={p}/>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CTA inscription ── */}
            {!user && (
              <div className="rounded-3xl p-6 text-white relative overflow-hidden fade-up"
                style={{background:"linear-gradient(135deg,#f97316,#ea580c)"}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
                <h3 className="text-xl font-extrabold mb-2">🎉 Première livraison gratuite</h3>
                <p className="text-orange-100 text-sm mb-4">Inscrivez-vous et profitez de la livraison offerte. Code: <span className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">DEPXPRES1</span></p>
                <Link href="/client/signup"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                  Créer mon compte <ArrowRight className="h-4 w-4"/>
                </Link>
              </div>
            )}
          </div>

          {/* ── SIDEBAR DESKTOP ── */}
          <div className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 shrink-0 sticky top-20">
            {/* Infos zone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500"/>Votre zone
              </h3>
              <div className="space-y-2">
                {[
                  {l:"Zone",v:zone},
                  {l:"Délai",v:"25–35 min",c:"text-orange-500"},
                  {l:"Commerces",v:`${stores.length} ouverts`},
                  {l:"Articles",v:`${products.length} disponibles`},
                ].map(r=>(
                  <div key={r.l} className="flex justify-between text-xs">
                    <span className="text-gray-400">{r.l}</span>
                    <span className={`font-semibold ${(r as any).c||"text-gray-900"}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500"/>Carte zone</span>
                <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>En direct
                </span>
              </div>
              <div className="h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d22400!2d-73.7124!3d45.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sca!4v1"
                  width="100%" height="100%"
                  style={{border:0}} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"/>
              </div>
            </div>

            {/* Promo */}
            <div className="rounded-2xl p-4 text-center" style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)"}}>
              <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2"/>
              <p className="text-sm font-bold text-green-800">{bio.length} produits biologiques</p>
              <p className="text-xs text-green-600 mt-1">Disponibles dès maintenant</p>
              <button onClick={()=>setActiveCat("bio")}
                className="mt-3 text-xs font-bold text-green-700 bg-white border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 transition-colors">
                Voir les produits bio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV MOBILE ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex items-center justify-around py-2">
          {[
            {href:"/client",icon:"🏠",label:"Accueil"},
            {href:"/client/orders",icon:"📋",label:"Commandes"},
            {href:"/client/cart",icon:"🛒",label:"Panier"},
            {href:user?"/client/profile":"/client/login",icon:user?"👤":"🔐",label:user?"Profil":"Connexion"},
          ].map(item=>(
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1">
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Carte produit horizontale (scroll) ──────────────────────────────────────
function ProductCard({product:p}:{product:Product}) {
  return (
    <Link href={`/client/store/${p.storeId}`}
      className="shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group">
      <div className="w-full h-28 bg-gray-50 relative overflow-hidden">
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <Package className="h-8 w-8 text-gray-200 absolute inset-0 m-auto"/>}
        {p.isOrganic && (
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Leaf className="h-2.5 w-2.5"/>Bio
          </div>
        )}
        {p.isFrozen && (
          <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">❄️</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{p.storeName}</p>
        <p className="text-xs font-extrabold text-orange-500 mt-1.5">{p.price?.toFixed(2)} $</p>
      </div>
    </Link>
  );
}

// ── Carte produit grille (vue catégorie) ────────────────────────────────────
function ProductCardGrid({product:p}:{product:Product}) {
  return (
    <Link href={`/client/store/${p.storeId}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group">
      <div className="w-full aspect-square bg-gray-50 relative overflow-hidden">
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <Package className="h-8 w-8 text-gray-200 absolute inset-0 m-auto"/>}
        {p.isOrganic && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">🌿 Bio</div>
        )}
        {p.isFrozen && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">❄️</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{p.storeName}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-extrabold text-orange-500">{p.price?.toFixed(2)} $</p>
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Carte store ─────────────────────────────────────────────────────────────
function StoreCard({store,nearby}:{store:StoreData;nearby?:boolean}) {
  return (
    <Link href={`/client/store/${store.id}`}
      className="shrink-0 w-64 md:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group overflow-hidden">
      <div className="h-24 relative overflow-hidden" style={{background:"linear-gradient(135deg,#fff7ed,#fef3c7)"}}>
        {store.imageUrl
          ? <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <div className="absolute inset-0 flex items-center justify-center text-4xl">🏪</div>}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
          store.isOpen?"bg-green-500 text-white":"bg-gray-200 text-gray-600"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen?"bg-white":"bg-gray-400"}`}/>
          {store.isOpen?"Ouvert":"Fermé"}
        </div>
        {nearby && <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Zone voisine</div>}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-600 transition-colors">{store.name}</p>
            {store.commerceTypeName && <p className="text-xs text-gray-400 truncate">{store.commerceTypeName}</p>}
          </div>
          {store.rating&&store.rating>0&&(
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400"/>
              <span className="text-xs font-bold text-gray-700">{store.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{store.deliveryTime||30} min</span>
          {store.address&&<span className="truncate flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0"/><span className="truncate">{store.address}</span></span>}
        </div>
      </div>
    </Link>
  );
}
