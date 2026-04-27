"use client";
import { useState, useEffect } from "react";
import { Package, Store, CheckCircle2, Loader2, Upload, AlertCircle, ChevronDown, Leaf } from "lucide-react";

interface StoreItem { id: string; name: string; }

const CATALOGUES = [
  {
    key: "pharmacie",
    label: "💊 Pharmacie & Santé",
    file: "/catalogue-otc.json",
    desc: "150 produits OTC — 12 sous-catégories",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    key: "fruits",
    label: "🥦 Fruits & Légumes Bio",
    file: "/catalogue-fruits-legumes.json",
    desc: "210 produits — 29 sous-catégories dont 105 bio",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
];

const SUBCATEGORY_ICONS: Record<string,string> = {
  "Douleur et fièvre":"💊","Rhume et grippe":"🤧","Allergies":"🌿",
  "Digestion":"🫁","Vitamines et produits naturels":"💪","Premiers soins":"🩹",
  "Hygiène et protection":"🧴","Peau et démangeaisons":"🧴","Bébé et enfant":"👶",
  "Soins buccaux":"🦷","Sommeil et stress léger":"😴","Yeux et oreilles":"👁️",
  "Pommes et poires":"🍎","Agrumes":"🍊","Baies":"🫐","Bananes":"🍌",
  "Fruits à noyau":"🍑","Tropicaux":"🥭","Melons":"🍈","Raisins":"🍇",
  "Avocats":"🥑","Tomates":"🍅","Laitues":"🥬","Feuilles vertes":"🥬",
  "Crucifères":"🥦","Poivrons":"🫑","Piments":"🌶️","Concombres":"🥒",
  "Courges":"🎃","Aubergines":"🍆","Champignons":"🍄","Oignons et ail":"🧅",
  "Pommes de terre":"🥔","Racines":"🥕","Haricots et pois":"🫘",
  "Tiges":"🌿","Maïs":"🌽","Herbes":"🌿","Salades prêtes":"🥗",
  "Fruits spéciaux":"🫒","Fruits secs frais":"🥜","Courgettes":"🥒",
};

export default function ImportCataloguePage() {
  const [stores, setStores]         = useState<StoreItem[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCat, setSelectedCat]     = useState(CATALOGUES[0]);
  const [catalogue, setCatalogue]         = useState<any[]>([]);
  const [loadingCat, setLoadingCat]       = useState(false);
  const [importing, setImporting]         = useState(false);
  const [result, setResult]               = useState<any>(null);
  const [error, setError]                 = useState("");
  const [expandedSub, setExpandedSub]     = useState<string|null>(null);

  useEffect(()=>{
    fetch("/api/admin/stores",{credentials:"include"})
      .then(r=>r.json()).then(d=>setStores(d.stores||[]));
  },[]);

  useEffect(()=>{
    setLoadingCat(true);
    setCatalogue([]);
    setResult(null);
    setError("");
    fetch(selectedCat.file)
      .then(r=>r.json())
      .then(d=>{ setCatalogue(Array.isArray(d)?d:(d.products||[])); })
      .catch(()=>setError("Impossible de charger le catalogue"))
      .finally(()=>setLoadingCat(false));
  },[selectedCat]);

  const grouped = catalogue.reduce((acc:Record<string,any[]>,p)=>{
    const sub = p.subcategory||p.subcategoryName||"Autres";
    if (!acc[sub]) acc[sub]=[];
    acc[sub].push(p);
    return acc;
  },{});

  async function handleImport() {
    if (!selectedStore||!catalogue.length) return;
    setImporting(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/import-catalogue",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ storeId:selectedStore, products:catalogue, catalogueType: selectedCat.key }),
      });
      const data = await res.json();
      if (data.ok) setResult(data);
      else setError(data.error||"Erreur inconnue");
    } catch(e){ setError(String(e)); }
    finally { setImporting(false); }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📦 Import Catalogue</h1>
        <p className="text-muted-foreground text-sm mt-1">Importez des produits directement dans le catalogue d'un commerce</p>
      </div>

      {/* Sélection catalogue */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-bold flex items-center gap-2"><Package className="h-5 w-5 text-orange-500"/>Choisir le catalogue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATALOGUES.map(cat=>(
            <button key={cat.key} onClick={()=>setSelectedCat(cat)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${selectedCat.key===cat.key?"border-orange-500 bg-orange-50":"border-border hover:border-orange-200"}`}>
              <p className="font-bold text-sm">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sélection store */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-bold flex items-center gap-2"><Store className="h-5 w-5 text-orange-500"/>Sélectionner le store</h2>
        <select value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
          <option value="">Choisir un commerce...</option>
          {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Aperçu */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Package className="h-5 w-5 text-blue-500"/>
            Aperçu — {loadingCat ? "Chargement..." : `${catalogue.length} produits`}
          </h2>
          {catalogue.some(p=>p.isOrganic) && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <Leaf className="h-3 w-3"/>🌿 {catalogue.filter(p=>p.isOrganic).length} bio
            </span>
          )}
        </div>

        {loadingCat ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500"/></div>
        ) : (
          <>
            {/* Grille sous-catégories */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(grouped).map(([sub,prods])=>(
                <div key={sub} className="bg-muted/30 rounded-xl p-2.5 text-center border border-border hover:border-orange-200 transition-colors">
                  <p className="text-xl mb-1">{SUBCATEGORY_ICONS[sub]||"📦"}</p>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{sub}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{(prods as any[]).length} produits</p>
                </div>
              ))}
            </div>

            {/* Liste dépliable */}
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {Object.entries(grouped).map(([sub,prods])=>(
                <div key={sub} className="border rounded-xl overflow-hidden">
                  <button onClick={()=>setExpandedSub(expandedSub===sub?null:sub)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      {SUBCATEGORY_ICONS[sub]||"📦"} {sub}
                      <span className="text-xs text-muted-foreground font-normal">({(prods as any[]).length})</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedSub===sub?"rotate-180":""}`}/>
                  </button>
                  {expandedSub===sub && (
                    <div className="border-t divide-y">
                      {(prods as any[]).map((p:any,i:number)=>(
                        <div key={p.sku||i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20">
                          <img src={p.imageUrl} alt={p.name||p.name_fr} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.name||p.name_fr}
                              {p.isOrganic && <span className="ml-1 text-[10px] text-green-600 font-bold">BIO</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.sku} · {p.unit||"unité"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-orange-500">
                              {p.price ? `${p.price.toFixed(2)} $` :
                               p.priceEstimateCAD?.min ? `${p.priceEstimateCAD.min}–${p.priceEstimateCAD.max} $` : "—"}
                            </p>
                            {p.isLocal && <p className="text-[10px] text-blue-500">🏠 Local</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Résultat */}
      {result && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-600"/>
            <p className="font-bold text-green-800">Import réussi !</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {l:"Importés",v:result.imported,c:"text-green-700"},
              {l:"Déjà existants",v:result.skipped,c:"text-yellow-700"},
              {l:"Total",v:result.totalProducts,c:"text-blue-700"},
            ].map(s=>(
              <div key={s.l} className="bg-white rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0"/>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Bouton */}
      <button onClick={handleImport} disabled={!selectedStore||!catalogue.length||importing}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base">
        {importing
          ? <><Loader2 className="h-5 w-5 animate-spin"/>Import en cours... ({catalogue.length} produits)</>
          : <><Upload className="h-5 w-5"/>Importer {catalogue.length} produits — {selectedCat.label}</>}
      </button>
    </div>
  );
}
