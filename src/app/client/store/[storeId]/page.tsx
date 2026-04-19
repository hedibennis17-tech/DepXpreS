"use client";
import dynamic from "next/dynamic";
const StoreDetail = dynamic(() => import("./store-detail"), { ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"/></div>
});
export default function StoreDetailPage() { return <StoreDetail />; }
