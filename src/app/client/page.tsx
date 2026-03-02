import { DeliveryInfoPanel } from "@/components/client/delivery-info-panel";
import { CategoryList } from "@/components/client/category-list";
import { ProductGrid } from "@/components/client/product-grid";
import { MapPanel } from "@/components/client/map-panel";
import { FloatingCartButton } from "@/components/client/floating-cart-button";

export default function ClientHomePage() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="hidden lg:block lg:col-span-3">
          <DeliveryInfoPanel />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 space-y-12">
          <CategoryList />
          <ProductGrid />
        </div>

        {/* Right Column */}
        <div className="hidden lg:block lg:col-span-3">
          <MapPanel />
        </div>
      </div>
      <FloatingCartButton />
    </div>
  );
}
