'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddressAutocompleteInput, type AddressValue } from '@/components/address/AddressAutocompleteInput';
import {
  Store, User, Package, MapPin, Plus, Minus, Trash2,
  CheckCircle2, Loader2, UserCheck, Navigation, Phone,
  ChevronRight, Search, DollarSign, Star
} from 'lucide-react';

interface StoreItem { id:string; name:string; address:string; phone?:string; }
interface Product   { id:string; name:string; price:number; categoryName:string; image?:string; inStock?:boolean; }
interface Client    { id:string; fullName:string; phone:string; email:string; }
interface Driver    { id:string; full_name:string; zone_name?:string; driver_status:string; last_lat?:number; last_lng?:number; vehicle_type?:string; }
interface CartItem  { productId:string; name:string; qty:number; price:number; }

type Step = 'order' | 'assign' | 'done';

export default function NewOrderPage() {
  const router = useRouter();

  // Step
  const [step, setStep] = useState<Step>('order');

  // Data
  const [stores, setStores]   = useState<StoreItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers]   = useState<Driver[]>([]);

  // Selections
  const [selectedStore,  setSelectedStore]  = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress]   = useState('');
  const [deliveryAddressObj, setDeliveryAddressObj] = useState<AddressValue|null>(null);
  const [deliveryType, setDeliveryType] = useState<'door'|'meet'>('door');
  const [note, setNote] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // State
  const [loadingStores, setLoadingStores]     = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDrivers, setLoadingDrivers]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning]   = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [createdOrderNum, setCreatedOrderNum] = useState('');

  // Charger stores + clients
  useEffect(() => {
    setLoadingStores(true);
    Promise.all([
      fetch('/api/admin/stores').then(r=>r.json()),
      fetch('/api/admin/clients').then(r=>r.json()),
    ]).then(([sd,cd]) => {
      setStores(sd.stores||[]);
      setClients(cd.clients||[]);
    }).finally(()=>setLoadingStores(false));
  }, []);

  // Charger produits quand store change
  useEffect(() => {
    if (!selectedStore) { setProducts([]); return; }
    setLoadingProducts(true);
    fetch(`/api/admin/stores/${selectedStore}/products`)
      .then(r=>r.json())
      .then(d=>setProducts(d.products||[]))
      .finally(()=>setLoadingProducts(false));
  }, [selectedStore]);

  // Charger chauffeurs disponibles
  async function loadDrivers() {
    setLoadingDrivers(true);
    try {
      const res = await fetch('/api/admin/drivers?status=online');
      const d = await res.json();
      setDrivers(d.drivers||[]);
    } catch {}
    finally { setLoadingDrivers(false); }
  }

  // Panier
  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(i=>i.productId===p.id);
      if (ex) return prev.map(i=>i.productId===p.id ? {...i, qty:i.qty+1} : i);
      return [...prev, {productId:p.id, name:p.name, qty:1, price:p.price}];
    });
  }
  function updateQty(productId:string, delta:number) {
    setCart(prev => prev.map(i=>i.productId===productId ? {...i,qty:Math.max(1,i.qty+delta)} : i));
  }
  function removeFromCart(productId:string) {
    setCart(prev=>prev.filter(i=>i.productId!==productId));
  }

  // Calculs
  const subtotal    = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const deliveryFee = 4.99;
  const taxes       = subtotal * 0.14975;
  const total       = subtotal + deliveryFee + taxes;

  const storeObj  = stores.find(s=>s.id===selectedStore);
  const clientObj = clients.find(c=>c.id===selectedClient);
  const driverObj = drivers.find(d=>d.id===selectedDriver);

  const filteredProducts = products.filter(p=>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // STEP 1 → Créer la commande
  async function handleCreate() {
    if (!selectedStore||!selectedClient||cart.length===0||!deliveryAddress) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          clientId:selectedClient,
          clientName:clientObj?.fullName,
          clientPhone:clientObj?.phone,
          storeId:selectedStore,
          storeName:storeObj?.name,
          storeAddress:storeObj?.address,
          storePhone:storeObj?.phone,
          items:cart,
          deliveryAddress,
          deliveryLat: deliveryAddressObj?.lat||null,
          deliveryLng: deliveryAddressObj?.lng||null,
          deliveryType,
          deliveryInstructions:note,
          note,
          subtotal:Math.round(subtotal*100)/100,
          deliveryFee,
          taxes:Math.round(taxes*100)/100,
          total:Math.round(total*100)/100,
          status:'pending',
        }),
      });
      const data = await res.json();
      if (data.order?.id) {
        setCreatedOrderId(data.order.id);
        setCreatedOrderNum(data.order.orderNumber||data.order.id.slice(-6));
        await loadDrivers();
        setStep('assign');
      }
    } catch(e){ console.error(e); }
    finally { setSubmitting(false); }
  }

  // STEP 2 → Assigner un chauffeur
  async function handleAssign() {
    if (!createdOrderId||!selectedDriver) return;
    setAssigning(true);
    try {
      await fetch(`/api/admin/orders/${createdOrderId}`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          driverId:selectedDriver,
          driverName:driverObj?.full_name,
          status:'assigned',
        }),
      });
      setStep('done');
    } catch(e){ console.error(e); }
    finally { setAssigning(false); }
  }

  async function handleSkipAssign() {
    setStep('done');
  }

  if (loadingStores) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500"/>
    </div>
  );

  // ── STEP DONE ──────────────────────────────────────────────────────────────
  if (step==='done') return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-green-500"/>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Commande créée !</h2>
        <p className="text-muted-foreground mt-1">#{createdOrderNum}</p>
        {selectedDriver && driverObj && (
          <p className="text-green-600 font-semibold mt-2">✅ Assignée à {driverObj.full_name}</p>
        )}
        {!selectedDriver && <p className="text-orange-500 mt-2">⚠️ Aucun chauffeur assigné — en attente dispatch</p>}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={()=>router.push(`/admin/orders/${createdOrderId}`)}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">
          Voir la commande
        </button>
        <button onClick={()=>router.push('/admin/orders')}
          className="px-6 py-3 border rounded-xl font-semibold hover:bg-muted">
          Toutes les commandes
        </button>
      </div>
    </div>
  );

  // ── STEP ASSIGN ────────────────────────────────────────────────────────────
  if (step==='assign') return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span className="text-green-500 font-semibold">✅ Commande #{createdOrderNum} créée</span>
          <ChevronRight className="h-3 w-3"/>
          <span className="font-semibold text-foreground">Assigner un chauffeur</span>
        </div>
        <h1 className="text-2xl font-bold">Assigner un chauffeur</h1>
        <p className="text-muted-foreground text-sm mt-1">Choisis un chauffeur disponible ou ignore pour dispatch manuel.</p>
      </div>

      {/* Récap commande */}
      <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Package className="h-5 w-5 text-orange-500"/>
        </div>
        <div className="flex-1">
          <p className="font-semibold">{storeObj?.name} → {clientObj?.fullName}</p>
          <p className="text-sm text-muted-foreground">{deliveryAddress}</p>
        </div>
        <p className="font-bold text-orange-500">{total.toFixed(2)} $</p>
      </div>

      {/* Chauffeurs disponibles */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500"/>
            Chauffeurs en ligne ({drivers.length})
          </h2>
          <button onClick={loadDrivers} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
            <Loader2 className={`h-3 w-3 ${loadingDrivers?"animate-spin":""}`}/> Actualiser
          </button>
        </div>

        {loadingDrivers ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500"/></div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-2 opacity-20"/>
            <p>Aucun chauffeur en ligne</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {drivers.map(d => (
              <button key={d.id} onClick={()=>setSelectedDriver(d.id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedDriver===d.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-border hover:border-orange-200 hover:bg-muted/30"
                }`}>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-green-700 font-bold text-sm">{d.full_name?.[0]||"?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{d.full_name}</p>
                  <p className="text-xs text-muted-foreground">{d.zone_name||"—"} · {d.vehicle_type||"Véhicule"}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 bg-green-500 rounded-full"/>
                  <span className="text-xs text-green-600 font-semibold">En ligne</span>
                </div>
                {selectedDriver===d.id && <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0"/>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSkipAssign}
          className="flex-1 py-3 border rounded-xl font-semibold text-muted-foreground hover:bg-muted">
          Ignorer — dispatch manuel
        </button>
        <button onClick={handleAssign} disabled={!selectedDriver||assigning}
          className="flex-[2] py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
          {assigning
            ? <><Loader2 className="h-4 w-4 animate-spin"/>Assignation...</>
            : <><UserCheck className="h-4 w-4"/>Assigner et confirmer</>}
        </button>
      </div>
    </div>
  );

  // ── STEP ORDER ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Créer une commande</h1>
        <p className="text-muted-foreground mt-1">Remplis tous les champs puis assigne un chauffeur.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── COL 1 : Client ── */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2"><User className="h-5 w-5 text-blue-500"/>Client</h2>
            <select value={selectedClient} onChange={e=>setSelectedClient(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">Sélectionner un client...</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>)}
            </select>
            {clientObj && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1">
                <p className="text-sm font-semibold text-blue-800">{clientObj.fullName}</p>
                <p className="text-xs text-blue-600">{clientObj.phone}</p>
                <p className="text-xs text-blue-600">{clientObj.email}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-red-500"/>Livraison</h2>
            <AddressAutocompleteInput
              label="Adresse de livraison *"
              placeholder="123 Rue Sainte-Catherine..."
              value={deliveryAddressObj||undefined}
              onChange={val=>{ setDeliveryAddressObj(val); setDeliveryAddress(val?.fullLabel||val?.line1||''); }}
              province="QC"
              showCurrentLocationButton
              required
            />
            {/* Type livraison */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type de livraison</label>
              <div className="grid grid-cols-2 gap-2">
                {([['door','🚪 Devant la porte'],['meet','🤝 Remettre en main']] as const).map(([v,l])=>(
                  <button key={v} onClick={()=>setDeliveryType(v)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      deliveryType===v ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border"
                    }`}>{l}</button>
                ))}
              </div>
              {deliveryType==='door' && (
                <p className="text-xs text-orange-600 mt-1.5">📸 Photo obligatoire pour le chauffeur</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Instructions chauffeur</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Code d'entrée, étage, instructions..." rows={3}
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"/>
            </div>
          </div>
        </div>

        {/* ── COL 2 : Catalogue ── */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Store className="h-5 w-5 text-purple-500"/>Dépanneur & Catalogue</h2>
          <select value={selectedStore} onChange={e=>setSelectedStore(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium">
            <option value="">Sélectionner un dépanneur...</option>
            {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {selectedStore && (
            <>
              {/* Recherche produit */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input value={productSearch} onChange={e=>setProductSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm"/>
              </div>

              {/* Liste produits */}
              <div className="space-y-1 overflow-y-auto" style={{maxHeight:380}}>
                {loadingProducts ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-orange-500"/></div>
                ) : filteredProducts.length===0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">Aucun produit trouvé</p>
                ) : (
                  // Grouper par catégorie
                  Object.entries(
                    filteredProducts.reduce((acc:Record<string,Product[]>,p)=>{
                      const cat = p.categoryName||"Autres";
                      if (!acc[cat]) acc[cat]=[];
                      acc[cat].push(p);
                      return acc;
                    },{})
                  ).map(([cat,prods])=>(
                    <div key={cat}>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide py-2 px-1">{cat}</p>
                      {prods.map(p=>{
                        const inCart = cart.find(i=>i.productId===p.id);
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-2.5 rounded-xl mb-1 transition-colors ${
                            inCart ? "bg-orange-50 border border-orange-200" : "hover:bg-muted/50 border border-transparent"
                          }`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.price.toFixed(2)} $</p>
                            </div>
                            {inCart ? (
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={()=>updateQty(p.id,-1)} className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200">
                                  <Minus className="h-3.5 w-3.5"/>
                                </button>
                                <span className="text-sm font-bold w-5 text-center">{inCart.qty}</span>
                                <button onClick={()=>updateQty(p.id,1)} className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600">
                                  <Plus className="h-3.5 w-3.5"/>
                                </button>
                              </div>
                            ) : (
                              <button onClick={()=>addToCart(p)}
                                className="shrink-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center">
                                <Plus className="h-4 w-4"/>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          {!selectedStore && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mb-3 opacity-20"/>
              <p className="text-sm">Sélectionne un dépanneur pour voir le catalogue</p>
            </div>
          )}
        </div>

        {/* ── COL 3 : Panier + Récap ── */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500"/>
              Panier
              {cart.length>0 && <span className="ml-auto text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full">{cart.length}</span>}
            </h2>

            {cart.length===0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-20"/>
                <p className="text-sm">Aucun article ajouté</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {cart.map(item=>(
                    <div key={item.productId} className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.price.toFixed(2)} $ × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={()=>updateQty(item.productId,-1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                          <Minus className="h-3 w-3"/>
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={()=>updateQty(item.productId,1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                          <Plus className="h-3 w-3"/>
                        </button>
                        <button onClick={()=>removeFromCart(item.productId)} className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1">
                          <Trash2 className="h-3 w-3 text-red-500"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="border-t pt-3 space-y-1.5">
                  {[
                    ["Sous-total", `${subtotal.toFixed(2)} $`],
                    ["Livraison", `${deliveryFee.toFixed(2)} $`],
                    ["TPS + TVQ (14.975%)", `${taxes.toFixed(2)} $`],
                  ].map(([l,v])=>(
                    <div key={l} className="flex justify-between text-sm text-muted-foreground">
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span><span className="text-orange-500">{total.toFixed(2)} $</span>
                  </div>
                </div>
              </>
            )}

            {/* Validation */}
            {cart.length>0 && (
              <div className="space-y-2">
                {!selectedClient && <p className="text-xs text-red-500">⚠️ Sélectionne un client</p>}
                {!deliveryAddress && <p className="text-xs text-red-500">⚠️ Adresse de livraison requise</p>}
                <button onClick={handleCreate}
                  disabled={submitting||!selectedStore||!selectedClient||cart.length===0||!deliveryAddress}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {submitting
                    ? <><Loader2 className="h-5 w-5 animate-spin"/>Création...</>
                    : <><CheckCircle2 className="h-5 w-5"/>Créer la commande →</>}
                </button>
                <button onClick={()=>router.back()} className="w-full py-2.5 border rounded-xl text-sm font-medium hover:bg-muted">
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
