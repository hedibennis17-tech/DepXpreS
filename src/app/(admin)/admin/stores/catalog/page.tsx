"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const CatalogClient = dynamic(() => import("./catalog-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  ),
});

export default function StoresCatalogPage() {
  return <CatalogClient />;
}
