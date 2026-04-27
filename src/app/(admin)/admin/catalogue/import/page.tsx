"use client";
import { useState, useEffect } from "react";
import { Package, Store, CheckCircle2, Loader2, Upload, AlertCircle, ChevronDown, ChevronRight, Leaf } from "lucide-react";

interface StoreItem { id: string; name: string; }

const CATALOGUES = [
  {
    key: "pharmacie",
    label: "💊 Pharmacie & Santé",
    file: "/catalogue-otc.json",
    desc: "150 produits OTC — 12 sous-catégories",
    color: "#3b82f6",
    groupBy: "subcategory",
  },
  {
    key: "fruits",
    label: "🥦 Fruits & Légumes Bio",
    file: "/catalogue-fruits-legumes.json",
    desc: "210 produits — 29 sous-catégories dont 105 bio 🌿",
    color: "#22c55e",
    groupBy: "subcategory",
  },
  {
    key: "alimentation",
    label: "🛒 Alimentation Supercentre",
    file: "/catalogue-alimentation.json",
    desc: "495 produits — 6 départements, 18 sections, 52 sous-catégories",
    color: "#f97316",
    groupBy: "department",
  },
];

const ICONS: Record<string,string> = {
  // Pharmacie
  "Douleur et fièvre":"💊","Rhume et grippe":"🤧","Allergies":"🌿",
  "Digestion":"🫁","Vitamines et produits naturels":"💪","Premiers soins":"🩹",
  "Hygiène et protection":"🧴","Peau et démangeaisons":"🧴","Bébé et enfant":"👶",
  "Soins buccaux":"🦷","Sommeil et stress léger":"😴","Yeux et oreilles":"👁️",
  // Fruits
  "Pommes et poires":"🍎","Agrumes":"🍊","Baies":"🫐","Bananes":"🍌",
  "Fruits à noyau":"🍑","Tropicaux":"🥭","Melons":"🍈","Raisins":"🍇",
  "Avocats":"🥑","Tomates":"🍅","Laitues":"🥬","Feuilles vertes":"🥬",
  "Crucifères":"🥦","Poivrons":"🫑","Piments":"🌶️","Concombres":"🥒",
  "Courges":"🎃","Aubergines":"🍆","Champignons":"🍄","Oignons et ail":"🧅",
  "Pommes de terre":"🥔","Racines":"🥕","Haricots et pois":"🫘",
  "Tiges":"🌿","Maïs":"🌽","Herbes":"🌿","Salades prêtes":"🥗",
  // Alimentation départements
  "Produits frais":"🥩","Produits laitiers et œufs":"🥛","Garde-manger":"🥫",
  "Boissons":"🧃","Aliments congelés":"🧊","Bébé et besoins spéciaux":"🍼",
  // Sections alimentation
  "Fruits et légumes":"🥦","Viandes et volailles":"🥩","Poissons et fruits de mer":"🐟",
  "Boulangerie":"🍞","Charcuterie et mets préparés":"🥗","Fromages et œufs":"🧀",
  "Lait et boissons végétales":"🥛","Yogourt, crème et beurre":"🧈",
  "Pâtes, riz et grains":"🍝","Conserves":"🥫","Condiments et cuisson":"🧂",
  "Collations":"🍿","Déjeuner":"🥣","Eaux, jus et boissons":"🧃",
  "Boissons énergétiques et sport":"⚡","Repas et collations surgelés":"❄️",
  "Viandes et poissons congelés":"🧊","Fruits et légumes surgelés":"🥶",
  "Aliments pour bébés":"🍼","Besoins alimentaires spéciaux":"🌾",
};

export default function ImportCataloguePage() {
  const [stores, setStores]           = useState<StoreItem[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCat, setSelectedCat]     = useState(CATALOGUES[0]);
  const [catalogue, setCatalogue]         = useState<any[]>([]);
  const [loadingCat, setLoadingCat]       = useState(false);
  const [importing, setImporting]         = useState(false);
  const [result, setResult]               = useState<any>(null);
  const [error, setError]                 = useState("");
  const [expanded, setExpanded]           = useState<Record<string,boolean>>({});

  useEffect(()=>{
    fetch("/api/admin/stores",{credentials:"include"})
      .then(r=>r.json()).then(d=>setStores(d.stores||[]));
  },[]);

  useEffect(()=>{
    setLoadingCat(true); setCatalogue([]); setResult(null); setError(""); setExpanded({});
    fetch(selectedCat.file)
      .then(r=>r.json())
      .then(d=>setCatalogue(Array.isArray(d)?d:(d.products||[])))
      .catch(()=>setError("Impossible de charger le catalogue"))
      .finally(()=>setLoadingCat(false));
  },[selectedCat]);

  // Grouper par département puis section puis sous-catégorie (alimentation)
  // ou par sous-catégorie directement (pharmacie, fruits)
  function buildGroups(products: any[]) {
    if (selectedCat.groupBy === "department") {
      // Structure: dept → section → [produits]
      const tree: Record<string, Record<string, any[]>> = {};
      products.forEach(p => {
        const dept = p.department || "Autres";
        const sec = p.section || "Général";
        if (!tree[dept]) tree[dept] = {};
        if (!tree[dept][sec]) tree[dept][sec] = [];
        tree[dept][sec].push(p);
      });
      return tree;
    } else {
      // Structure: sous-cat → [produits]
      const flat: Record<string, any[]> = {};
      products.forEach(p => {
        const sub = p.subcategory || p.subcategoryName || "Autres";
        if (!flat[sub]) flat[sub] = [];
        flat[sub].push(p);
      });
      return flat;
    }
  }

  const groups = buildGroups(catalogue);
  const isTree = selectedCat.groupBy === "department";

  async function handleImport() {
    if (!selectedStore || !catalogue.length) return;
    setImporting(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/import-catalogue", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ storeId:selectedStore, products:catalogue, catalogueType:selectedCat.key }),
      });
      const data = await res.json();
      if (data.ok) setResult(data);
      else setError(data.error||"Erreur inconnue");
    } catch(e){ setError(String(e)); }
    finally { setImporting(false); }
  }

  const toggle = (key: string) => setExpanded(prev=>({...prev,[key]:!prev[key]}));

  const bio = catalogue.filter(p=>p.isOrganic).length;
  const frozen = catalogue.filter(p=>p.isFrozen).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-orange-500"/>Import Catalogue
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Importez des produits directement dans le catalogue d&apos;un commerce partenaire
        </p>
      </div>

      {/* ── SÉLECTION CATALOGUE ── */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Choisir le catalogue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATALOGUES.map(cat=>(
            <button key={cat.key} onClick={()=>setSelectedCat(cat)}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm ${selectedCat.key===cat.key?"border-orange-500 shadow-sm":"border-border hover:border-orange-200"}`}
              style={selectedCat.key===cat.key?{background:cat.color+"08"}:{}}>
              <p className="font-bold text-sm">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── SÉLECTION STORE ── */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Store className="h-4 w-4 text-orange-500"/>Commerce destinataire
        </h2>
        <select value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium">
          <option value="">Choisir un commerce...</option>
          {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* ── APERÇU CATALOGUE ── */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-bold flex items-center gap-2">
              Aperçu — {loadingCat ? "Chargement..." : `${catalogue.length} produits`}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {bio>0 && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><Leaf className="h-3 w-3"/>{bio} biologiques</span>}
              {frozen>0 && <span className="text-xs text-blue-500 font-semibold">❄️ {frozen} surgelés</span>}
            </div>
          </div>
          {/* Badges stats */}
          <div className="flex gap-2">
            {isTree ? (
              <span className="text-xs bg-orange-50 text-orange-700 font-bold px-2.5 py-1 rounded-full border border-orange-200">
                {Object.keys(groups).length} départements
              </span>
            ) : (
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
                {Object.keys(groups).length} catégories
              </span>
            )}
          </div>
        </div>

        {loadingCat ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange-500"/></div>
        ) : isTree ? (
          /* ── VUE ARBORESCENTE (Alimentation) ── */
          <div className="divide-y">
            {Object.entries(groups as Record<string,Record<string,any[]>>).map(([dept, sections])=>{
              const deptTotal = Object.values(sections).reduce((s,a)=>s+a.length,0);
              const deptOpen = expanded[dept];
              return (
                <div key={dept}>
                  {/* Département */}
                  <button onClick={()=>toggle(dept)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
                    <span className="text-xl">{ICONS[dept]||"📦"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{dept}</p>
                      <p className="text-xs text-muted-foreground">{Object.keys(sections).length} sections · {deptTotal} produits</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${deptOpen?"rotate-180":""}`}/>
                  </button>

                  {deptOpen && Object.entries(sections).map(([section, prods])=>{
                    const secKey = `${dept}__${section}`;
                    const secOpen = expanded[secKey];
                    return (
                      <div key={section} className="bg-muted/10">
                        {/* Section */}
                        <button onClick={()=>toggle(secKey)}
                          className="w-full flex items-center gap-3 px-8 py-3 hover:bg-muted/30 transition-colors text-left border-t border-border/50">
                          <span className="text-base">{ICONS[section]||"📂"}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{section}</p>
                            <p className="text-xs text-muted-foreground">{prods.length} produits</p>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${secOpen?"rotate-90":""}`}/>
                        </button>

                        {secOpen && (
                          <div className="divide-y border-t border-border/30">
                            {prods.map((p:any,i:number)=>(
                              <div key={p.sku||i} className="flex items-center gap-3 px-10 py-2.5 hover:bg-muted/20">
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.sku} · {p.subcategory}</p>
                                </div>
                                <div className="text-right shrink-0 space-y-0.5">
                                  <p className="text-sm font-bold text-orange-500">{p.price?.toFixed(2)} $</p>
                                  <div className="flex gap-1 justify-end">
                                    {p.isFrozen && <span className="text-[9px] text-blue-500 font-bold">❄️</span>}
                                    {p.isFresh && <span className="text-[9px] text-green-600 font-bold">🌿</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── VUE PLATE (Pharmacie / Fruits) ── */
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-5">
              {Object.entries(groups as Record<string,any[]>).map(([sub,prods])=>(
                <div key={sub} className="bg-muted/30 rounded-xl p-2.5 text-center border border-border hover:border-orange-200 transition-colors">
                  <p className="text-xl mb-1">{ICONS[sub]||"📦"}</p>
                  <p className="text-[11px] font-semibold leading-tight">{sub}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{(prods as any[]).length}</p>
                </div>
              ))}
            </div>
            <div className="divide-y border-t">
              {Object.entries(groups as Record<string,any[]>).map(([sub,prods])=>(
                <div key={sub}>
                  <button onClick={()=>toggle(sub)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      {ICONS[sub]||"📦"} {sub}
                      <span className="text-xs text-muted-foreground font-normal">({(prods as any[]).length})</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded[sub]?"rotate-180":""}`}/>
                  </button>
                  {expanded[sub] && (
                    <div className="border-t divide-y">
                      {(prods as any[]).map((p:any,i:number)=>(
                        <div key={p.sku||i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                          <img src={p.imageUrl} alt={p.name||p.name_fr} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name||p.name_fr}</p>
                            <p className="text-xs text-muted-foreground">{p.sku}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-orange-500">{p.price?.toFixed(2)||"—"} $</p>
                            {p.isOrganic && <p className="text-[10px] text-green-600 font-bold">🌿 Bio</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RÉSULTAT ── */}
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

      {/* ── BOUTON IMPORT ── */}
      <button onClick={handleImport} disabled={!selectedStore||!catalogue.length||importing}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-base">
        {importing
          ? <><Loader2 className="h-5 w-5 animate-spin"/>Import en cours... ({catalogue.length} produits)</>
          : <><Upload className="h-5 w-5"/>Importer {catalogue.length} produits — {selectedCat.label}</>}
      </button>
    </div>
  );
}
