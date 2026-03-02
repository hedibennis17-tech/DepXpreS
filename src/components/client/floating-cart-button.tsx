import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function FloatingCartButton() {
  const itemCount = 3;
  const total = 29.05;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50">
      <Button size="lg" className="w-full shadow-lg">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span>{itemCount} articles</span>
          </div>
          <span>Voir le panier - ${total.toFixed(2)}</span>
        </div>
      </Button>
    </div>
  );
}
