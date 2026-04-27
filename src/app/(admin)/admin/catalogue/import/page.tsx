"use client";
import { useState, useEffect } from "react";
import { Package, Store, CheckCircle2, Loader2, Upload, AlertCircle, ChevronDown } from "lucide-react";


interface StoreItem { id: string; name: string; }

const SUBCATEGORY_ICONS: Record<string,string> = {
  "Douleur et fièvre":"💊","Rhume et grippe":"🤧","Allergies":"🌿",
  "Digestion":"🫁","Vitamines et produits naturels":"💪","Premiers soins":"🩹",
  "Hygiène et protection":"🧴","Peau et démangeaisons":"🧴","Bébé et enfant":"👶",
  "Soins buccaux":"🦷","Sommeil et stress léger":"😴","Yeux et oreilles":"👁️",
};

export default function ImportCataloguePage() {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  useEffect(()=>{
    fetch("/catalogue-otc.json").then(r=>r.json()).then(d=>setCatalogue(d));
  },[]);
  const [stores, setStores]       = useState<StoreItem[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState<any>(null);
  const [error, setError]         = useState("");
  const [expandedSub, setExpandedSub] = useState<string|null>(null);

  useEffect(()=>{
    fetch("/api/admin/stores",{credentials:"include"})
      .then(r=>r.json())
      .then(d=>setStores(d.stores||[]));
  },[]);

  // Grouper les produits par sous-catégorie
  const grouped = (catalogue as any[]).reduce((acc:Record<string,any[]>,p)=>{
    if (!acc[p.subcategory]) acc[p.subcategory]=[];
    acc[p.subcategory].push(p);
    return acc;
  },{});

  async function handleImport() {
    if (!selectedStore) return;
    setImporting(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/import-catalogue",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ storeId: selectedStore, products: catalogue }),
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
        <h1 className="text-2xl font-bold">📦 Import Catalogue Pharmacie</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {(catalogue as any[]).length} produits OTC & Santé — 12 sous-catégories
        </p>
      </div>

      {/* Sélection store */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <h2 className="font-bold flex items-center gap-2"><Store className="h-5 w-5 text-orange-500"/>Sélectionner le store</h2>
        <select value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
          <option value="">Choisir un commerce...</option>
          {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Aperçu catalogue */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-bold flex items-center gap-2"><Package className="h-5 w-5 text-blue-500"/>Aperçu des produits</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.entries(grouped).map(([sub,prods])=>(
            <div key={sub} className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">{SUBCATEGORY_ICONS[sub]||"💊"}</p>
              <p className="text-xs font-bold text-foreground leading-tight">{sub}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{(prods as any[]).length} produits</p>
            </div>
          ))}
        </div>

        {/* Liste dépliable par sous-catégorie */}
        <div className="space-y-2">
          {Object.entries(grouped).map(([sub,prods])=>(
            <div key={sub} className="border rounded-xl overflow-hidden">
              <button onClick={()=>setExpandedSub(expandedSub===sub?null:sub)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <span className="text-sm font-semibold flex items-center gap-2">
                  {SUBCATEGORY_ICONS[sub]||"💊"} {sub}
                  <span className="text-xs text-muted-foreground font-normal">({(prods as any[]).length})</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSub===sub?"rotate-180":""}`}/>
              </button>
              {expandedSub===sub && (
                <div className="border-t">
                  {(prods as any[]).map((p:any)=>(
                    <div key={p.sku} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-muted"/>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand} · {p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-orange-500">{p.priceEstimateCAD?.toFixed(2)} $</p>
                        {p.requiresPharmacistNotice && <p className="text-[10px] text-yellow-500">⚠️ Avis pharmacien</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-600"/>
            <p className="font-bold text-green-800">Import réussi!</p>
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

      {/* Bouton import */}
      <button onClick={handleImport} disabled={!selectedStore||importing}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base">
        {importing
          ? <><Loader2 className="h-5 w-5 animate-spin"/>Import en cours... ({(catalogue as any[]).length} produits)</>
          : <><Upload className="h-5 w-5"/>Importer {(catalogue as any[]).length} produits dans le catalogue</>}
      </button>
    </div>
  );
}
