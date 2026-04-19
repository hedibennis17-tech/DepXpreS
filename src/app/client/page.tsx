"use client";
import dynamic from "next/dynamic";

const ClientHome = dynamic(() => import("./client-home"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 animate-pulse" />
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  )
});

export default function ClientPage() {
  return <ClientHome />;
}
