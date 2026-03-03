"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductRow = {
  id: string;
  name?: string;
  description?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  requiresAgeVerification?: boolean;
};

export default function StoresCatalogPage() {
  const router = useRouter();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/products", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/admin/login?redirect=/admin/stores/catalog");
          return;
        }

        if (res.status === 403) {
          router.replace("/admin/dashboard");
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || "Impossible de charger le catalogue.");
        }

        if (active) {
          setItems(Array.isArray(data?.products) ? data.products : []);
        }
      } catch (err: unknown) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Impossible de charger le catalogue.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Chargement du catalogue...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Catalogue global</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} résultat(s)</p>
      </div>

      <div className="max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit, code-barres, description..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Aucun résultat trouvé.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{item.name || item.id}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description || "Sans description"}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                  {item.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Prix:</span>{" "}
                  <strong>
                    {typeof item.price === "number" ? `${item.price.toFixed(2)} $` : "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock:</span>{" "}
                  <strong>{typeof item.stock === "number" ? item.stock : "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Code-barres:</span>{" "}
                  <strong>{item.barcode || "—"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Âge requis:</span>{" "}
                  <strong>{item.requiresAgeVerification ? "Oui" : "Non"}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
