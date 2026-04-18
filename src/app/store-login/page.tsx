"use client";
import dynamic from "next/dynamic";

const StoreLoginClient = dynamic(() => import("./store-login-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
});

export default function StoreLoginPage() {
  return <StoreLoginClient />;
}
