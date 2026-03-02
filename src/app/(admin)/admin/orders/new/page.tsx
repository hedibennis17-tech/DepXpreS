
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddressAutocompleteInput, type AddressValue } from '@/components/address/AddressAutocompleteInput';

interface Store { id: string; name: string; address: string; }
interface Product { id: string; name: string; price: number; categoryName: string; }
interface Client { id: string; fullName: string; phone: string; email: string; }

export default function Page() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedItems, setSelectedItems] = useState<{productId: string; name: string; qty: number; price: number}[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddressObj, setDeliveryAddressObj] = useState<AddressValue | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/stores').then(r => r.json()),
      fetch('/api/admin/clients').then(r => r.json()),
    ]).then(([storesData, clientsData]) => {
      setStores(storesData.stores || []);
      setClients(clientsData.clients || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetch(`/api/admin/stores/${selectedStore}/products`).then(r => r.json()).then(d => setProducts(d.products || []));
    }
  }, [selectedStore]);

  const addItem = (product: Product) => {
    const existing = selectedItems.find(i => i.productId === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { productId: product.id, name: product.name, qty: 1, price: product.price }]);
    }
  };

  const removeItem = (productId: string) => setSelectedItems(selectedItems.filter(i => i.productId !== productId));

  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 3.99;
  const taxes = subtotal * 0.14975;
  const total = subtotal + deliveryFee + taxes;

  const handleSubmit = async () => {
    if (!selectedStore || !selectedClient || selectedItems.length === 0 || !deliveryAddress) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSubmitting(true);
    try {
      const client = clients.find(c => c.id === selectedClient);
      const store = stores.find(s => s.id === selectedStore);
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          clientName: client?.fullName,
          clientPhone: client?.phone,
          storeId: selectedStore,
          storeName: store?.name,
          items: selectedItems,
          deliveryAddress,
          note,
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryFee,
          taxes: Math.round(taxes * 100) / 100,
          total: Math.round(total * 100) / 100,
        }),
      });
      const data = await res.json();
      if (data.order) router.push(`/admin/orders/${data.order.id}`);
    } catch { alert('Erreur lors de la création'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Créer une commande manuelle</h1>
        <p className="text-muted-foreground mt-1">Créer une commande pour un client depuis l&apos;interface admin.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Client</h2>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.fullName} — {c.phone}</option>)}
          </select>
          <div>
            <AddressAutocompleteInput
              label="Adresse de livraison"
              placeholder="123 Rue Sainte-Catherine, Montréal..."
              value={deliveryAddressObj || undefined}
              onChange={(val) => {
                setDeliveryAddressObj(val);
                setDeliveryAddress(val?.fullLabel || val?.line1 || '');
              }}
              province="QC"
              showCurrentLocationButton={true}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Note pour le chauffeur</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Instructions spéciales..." rows={3} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Dépanneur</h2>
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sélectionner un dépanneur...</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {selectedStore && (
            <div>
              <h3 className="text-sm font-medium mb-2">Produits disponibles</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50">
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.categoryName} — {p.price.toFixed(2)} $</p></div>
                    <button onClick={() => addItem(p)} className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600">+ Ajouter</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedItems.length > 0 && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Récapitulatif</h2>
          <div className="space-y-2">
            {selectedItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3"><span className="text-sm font-medium">{item.name}</span><span className="text-xs text-muted-foreground">x{item.qty}</span></div>
                <div className="flex items-center gap-3"><span className="text-sm font-medium">{(item.price * item.qty).toFixed(2)} $</span><button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700 text-xs">✕</button></div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-1">
            <div className="flex justify-between text-sm"><span>Sous-total</span><span>{subtotal.toFixed(2)} $</span></div>
            <div className="flex justify-between text-sm"><span>Livraison</span><span>{deliveryFee.toFixed(2)} $</span></div>
            <div className="flex justify-between text-sm"><span>Taxes (TPS+TVQ)</span><span>{taxes.toFixed(2)} $</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{total.toFixed(2)} $</span></div>
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={submitting || !selectedStore || !selectedClient || selectedItems.length === 0} className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
          {submitting ? 'Création...' : 'Créer la commande'}
        </button>
        <button onClick={() => router.back()} className="px-6 py-2 border rounded-lg font-medium hover:bg-muted">Annuler</button>
      </div>
    </div>
  );
}
