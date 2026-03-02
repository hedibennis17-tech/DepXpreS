'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Plus, Trash2, Star, CheckCircle2 } from 'lucide-react';
import { AddressAutocompleteInput, type AddressValue } from '@/components/address/AddressAutocompleteInput';

interface SavedAddress {
  id: string;
  label?: string;
  line1: string;
  city: string;
  provinceCode: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export default function Page() {
  const { clientId } = useParams() as { clientId: string };
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressValue | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    fetch(`/api/admin/clients/${clientId}/addresses`)
      .then(r => r.json())
      .then(d => setAddresses(d.addresses || []))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleSaveAddress = async () => {
    if (!newAddress) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel || newAddress.line1,
          line1: newAddress.line1,
          city: newAddress.city,
          provinceCode: newAddress.provinceCode,
          postalCode: newAddress.postalCode,
          latitude: newAddress.latitude,
          longitude: newAddress.longitude,
          bdoa_row_id: newAddress.addressId,
          deliveryInstructions: newInstructions,
        }),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses(prev => [...prev, data.address]);
        setShowAddForm(false);
        setNewAddress(null);
        setNewLabel('');
        setNewInstructions('');
      }
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adresses du client</h1>
          <p className="text-muted-foreground mt-1">Gérer les adresses de livraison</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Ajouter une adresse
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Nouvelle adresse</h2>
          <AddressAutocompleteInput
            label="Adresse"
            placeholder="Commencez à taper l'adresse..."
            value={newAddress || undefined}
            onChange={setNewAddress}
            province="QC"
            showCurrentLocationButton={true}
            required
          />
          {newAddress && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg border border-green-200 text-sm">
              <div><p className="text-xs text-gray-500">Ville</p><p className="font-medium">{newAddress.city || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Code postal</p><p className="font-medium">{newAddress.postalCode || '—'}</p></div>
              <div><p className="text-xs text-gray-500">Province</p><p className="font-medium">{newAddress.provinceCode || 'QC'}</p></div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Étiquette (optionnel)</label>
            <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Ex: Maison, Bureau..." className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Instructions de livraison</label>
            <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} placeholder="Ex: Sonner à la porte 2..." rows={2} className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveAddress} disabled={!newAddress || saving} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <CheckCircle2 className="h-4 w-4" />}
              Sauvegarder
            </button>
            <button onClick={() => { setShowAddForm(false); setNewAddress(null); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Aucune adresse enregistrée.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border bg-card p-4 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{addr.label || addr.line1}</p>
                  {addr.isDefault && <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded"><Star className="h-3 w-3" />Défaut</span>}
                </div>
                <p className="text-sm text-muted-foreground">{addr.line1}{addr.city ? `, ${addr.city}` : ''}{addr.provinceCode ? `, ${addr.provinceCode}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}</p>
                {addr.deliveryInstructions && <p className="text-xs text-gray-400 mt-1">{addr.deliveryInstructions}</p>}
                {addr.latitude && addr.longitude && <p className="text-xs font-mono text-gray-400 mt-0.5">GPS: {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}</p>}
              </div>
              <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
