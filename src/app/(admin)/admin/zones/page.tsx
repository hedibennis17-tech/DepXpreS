"use client";
import { useState, useEffect, useRef } from "react";
import {
  MapPin, Plus, Search, RefreshCw, CheckCircle2, XCircle,
  ShoppingBag, Car, Store, ChevronRight, Filter, X,
  Clock, DollarSign, Loader2, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import { DELIVERY_ZONES, searchZones, type DeliveryZone } from "@/lib/delivery-zones";

interface ZoneWithStats {
  id: string; name: string; slug: string; city: string;
  region: string; region_code: string; delivery_zone_group: string;
  is_active: boolean; is_core: boolean; type: string;
  delivery_fee: number; min_order: number;
  estimated_time_min: number; estimated_time_max: number;
  ordersCount: number; driversCount: number; storesCount: number;
  search_terms?: string[]; aliases?: string[];
}

const GROUP_LABELS: Record<string, string> = {
  laval: "🏙️ Laval",
  montreal: "🗺️ Montréal",
  longueuil: "🌉 Longueuil",
  north_shore: "⬆️ Rive-Nord",
  west_north_shore: "↖️ Rive-Nord Ouest",
  west_extended: "⬅️ Ouest étendu",
  south_shore_east: "↘️ Rive-Sud Est",
  south_west: "↙️ Rive-Sud Ouest",
};

const CORE_GROUPS = ["laval", "montreal", "longueuil"];

export default function ZonesAdminPage() {
  const [zones, setZones] = useState<ZoneWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  async function loadZones() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/zones", { credentials: "include" });
      const data = await res.json();
      setZones(data.zones || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadZones(); }, []);

  async function toggleZone(zone: ZoneWithStats) {
    setToggling(zone.id);
    try {
      await fetch("/api/admin/zones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ zoneId: zone.id, updates: { is_active: !zone.is_active } }),
      });
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, is_active: !z.is_active } : z));
    } finally { setToggling(null); }
  }

  // Filtres
  const filtered = zones.filter(z => {
    if (filter === "active" && !z.is_active) return false;
    if (filter === "inactive" && z.is_active) return false;
    if (groupFilter !== "all" && z.delivery_zone_group !== groupFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return z.name.toLowerCase().includes(q) ||
        z.city?.toLowerCase().includes(q) ||
        z.search_terms?.some(t => t.includes(q));
    }
    return true;
  });

  // Grouper par delivery_zone_group
  const grouped = filtered.reduce((acc, z) => {
    const g = z.delivery_zone_group || "other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(z);
    return acc;
  }, {} as Record<string, ZoneWithStats[]>);

  const activeCount = zones.filter(z => z.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zones de livraison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} zones actives · {zones.length} zones au total · Grand Montréal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadZones} className="p-2 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" /> Nouvelle zone
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une zone (Chomedey, Plateau, Longueuil...)"
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm bg-background outline-none focus:border-orange-400" />
        </div>

        {/* Status filter */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {[["all","Toutes"],["active","Actives"],["inactive","Inactives"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === v ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500"
              }`}>{l}</button>
          ))}
        </div>

        {/* Group filter */}
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-orange-400">
          <option value="all">Toutes les régions</option>
          {Object.entries(GROUP_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Stat cards rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Zones actives", value: activeCount, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
          { label: "Zones inactives", value: zones.length - activeCount, color: "text-gray-500", bg: "bg-gray-50", icon: XCircle },
          { label: "Zones core", value: zones.filter(z => z.is_core).length, color: "text-orange-600", bg: "bg-orange-50", icon: MapPin },
          { label: "Expansion", value: zones.filter(z => !z.is_core).length, color: "text-blue-600", bg: "bg-blue-50", icon: ChevronRight },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liste zones groupées */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, groupZones]) => (
            <div key={group}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {GROUP_LABELS[group] || group}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {groupZones.length} zone{groupZones.length > 1 ? "s" : ""}
                </span>
                {CORE_GROUPS.includes(group) && (
                  <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                    Core
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupZones.map(zone => (
                  <div key={zone.id}
                    className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-4 transition-all ${
                      zone.is_active ? "border-gray-100" : "border-gray-200 opacity-60"
                    }`}>
                    {/* Header zone */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{zone.name}</p>
                        <p className="text-xs text-gray-400">{zone.city} · {zone.region_code}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          zone.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {zone.is_active ? "Active" : "Inactive"}
                        </span>
                        <button onClick={() => toggleZone(zone)} disabled={toggling === zone.id}
                          className="text-gray-400 hover:text-orange-500 transition-colors">
                          {toggling === zone.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : zone.is_active
                              ? <ToggleRight className="h-5 w-5 text-green-500" />
                              : <ToggleLeft className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { icon: ShoppingBag, value: zone.ordersCount || 0, label: "Commandes", color: "text-blue-500" },
                        { icon: Car, value: zone.driversCount || 0, label: "Chauffeurs", color: "text-green-500" },
                        { icon: Store, value: zone.storesCount || 0, label: "Commerces", color: "text-orange-500" },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[9px] text-gray-400">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Infos livraison */}
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{zone.delivery_fee?.toFixed(2)}$</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{zone.estimated_time_min}-{zone.estimated_time_max} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Min. {zone.min_order}$</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL AJOUTER UNE ZONE ── */}
      {showAddModal && <AddZoneModal onClose={() => setShowAddModal(false)} onSaved={loadZones} />}
    </div>
  );
}

function AddZoneModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState<"search" | "configure">("search");
  const [searchQ, setSearchQ] = useState("");
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [results, setResults] = useState<DeliveryZone[]>([]);
  const [form, setForm] = useState({
    delivery_fee: "4.99",
    min_order: "10.00",
    estimated_time_min: "25",
    estimated_time_max: "40",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Recherche dans notre liste complète
  useEffect(() => {
    if (searchQ.length < 2) {
      setResults(DELIVERY_ZONES.slice(0, 15));
      return;
    }
    setResults(searchZones(searchQ).slice(0, 20));
  }, [searchQ]);

  function selectZone(zone: DeliveryZone) {
    setSelectedZone(zone);
    setForm(f => ({
      ...f,
      delivery_fee: String(zone.delivery_fee),
      min_order: String(zone.min_order),
      estimated_time_min: String(zone.estimated_time_min),
      estimated_time_max: String(zone.estimated_time_max),
    }));
    setStep("configure");
  }

  async function handleSave() {
    if (!selectedZone) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...selectedZone,
          delivery_fee: parseFloat(form.delivery_fee),
          min_order: parseFloat(form.min_order),
          estimated_time_min: parseInt(form.estimated_time_min),
          estimated_time_max: parseInt(form.estimated_time_max),
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally { setSaving(false); }
  }

  // Groupes pour affichage
  const REGION_GROUPS: Record<string, string> = {
    laval: "🏙️ Laval",
    montreal: "🗺️ Montréal",
    longueuil: "🌉 Longueuil",
    north_shore: "⬆️ Rive-Nord",
    west_north_shore: "↖️ Rive-Nord Ouest",
    west_extended: "⬅️ Ouest",
    south_shore_east: "↘️ Rive-Sud Est",
    south_west: "↙️ Rive-Sud Ouest",
  };

  const grouped = results.reduce((acc, z) => {
    const g = z.delivery_zone_group;
    if (!acc[g]) acc[g] = [];
    acc[g].push(z);
    return acc;
  }, {} as Record<string, DeliveryZone[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header modal */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            {step === "configure" && (
              <button onClick={() => setStep("search")} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-gray-500 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                {step === "search" ? "Chercher une zone" : "Configurer la zone"}
              </h2>
              <p className="text-xs text-gray-500">
                {step === "search" ? "103 zones disponibles — Grand Montréal" : selectedZone?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Étape 1 — Recherche */}
        {step === "search" && (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  autoFocus
                  placeholder="Chomedey, Plateau, Saint-Hubert, Blainville..."
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:border-orange-400 bg-background" />
              </div>
              {/* Filtres rapides */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {Object.entries(REGION_GROUPS).map(([k, v]) => (
                  <button key={k} onClick={() => setSearchQ(k === "laval" ? "laval" : k === "montreal" ? "montréal" : v.split(" ").slice(1).join(" "))}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors whitespace-nowrap">
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.entries(grouped).map(([group, groupZones]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-t text-xs font-bold text-gray-500 sticky top-0">
                    {REGION_GROUPS[group] || group}
                  </div>
                  {groupZones.map(zone => (
                    <button key={zone.id} onClick={() => selectZone(zone)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors border-b last:border-0 text-left">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        zone.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {zone.is_active ? "✓" : "○"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{zone.name}</p>
                        <p className="text-xs text-gray-400">{zone.city} · {zone.estimated_time_min}-{zone.estimated_time_max} min · {zone.delivery_fee}$</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Étape 2 — Configuration */}
        {step === "configure" && selectedZone && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            {/* Info zone sélectionnée */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedZone.name}</p>
                  <p className="text-xs text-gray-500">{selectedZone.city} · {selectedZone.region_code} · {selectedZone.type}</p>
                </div>
              </div>
            </div>

            {/* Formulaire config */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Frais livraison ($)</label>
                <input type="number" step="0.01" value={form.delivery_fee}
                  onChange={e => setForm(f => ({ ...f, delivery_fee: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Commande min. ($)</label>
                <input type="number" step="0.01" value={form.min_order}
                  onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Délai min. (min)</label>
                <input type="number" value={form.estimated_time_min}
                  onChange={e => setForm(f => ({ ...f, estimated_time_min: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-background" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Délai max. (min)</label>
                <input type="number" value={form.estimated_time_max}
                  onChange={e => setForm(f => ({ ...f, estimated_time_max: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-background" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-xl">
              <input type="checkbox" id="is_active" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 accent-orange-500" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-900 cursor-pointer">
                Zone active immédiatement
              </label>
            </div>
          </div>
        )}

        {/* Footer modal */}
        <div className="p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          {step === "configure" && (
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</> : <><CheckCircle2 className="h-4 w-4" />Ajouter la zone</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
