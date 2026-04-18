"use client";

import dynamic from "next/dynamic";

const CatalogContent = dynamic(() => import("./catalog-content"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  ),
});

export default function StoreCatalogPage() {
  return <CatalogContent />;
}
