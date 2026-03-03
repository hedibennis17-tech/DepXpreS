"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";

export default function ZonesStoresPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/zones/stores")
      .then(r => r.json())
      .then(d => {
        const list = d.clients || d.drivers || d.stores || d.zones || d.orders || d.promotions || d.notifications || d.tickets || d.wallets || d.documents || d.vehicles || d.earnings || d.payouts || d.applications || [];
        setItems(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dépanneurs par zone</h1>
        <p className="text-muted-foreground mt-1">Répartition des dépanneurs par zone</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-card"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {search ? "Aucun résultat pour cette recherche" : "Aucune donnée disponible"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Zone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Dépanneurs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actifs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Commandes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.slice(0, 50).map((item, i) => (
                  <tr key={String(item.id) || String(i)} className="hover:bg-muted/30 transition-colors">
                    {Object.entries(item).slice(0, 4).map(([k, v]) => (
                      <td key={k} className="px-4 py-3 text-sm text-foreground">
                        {typeof v === "boolean" ? (v ? "Oui" : "Non") : typeof v === "object" && v !== null ? JSON.stringify(v).slice(0, 40) : String(v ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} résultat(s)</p>
    </div>
  );
}
