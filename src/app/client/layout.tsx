import { ClientHeader } from "@/components/client/client-header";
import { CartProvider } from "@/context/CartContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <ClientHeader />
        <main className="flex-1">{children}</main>
      </div>
    </CartProvider>
  );
}
