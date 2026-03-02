import { PRODUCTS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const ProductCard = ({ product }: { product: (typeof PRODUCTS)[0] }) => {
  const image = PlaceHolderImages.find(img => img.id === product.imageId);

  const stockColor = {
    in_stock: "text-green-600",
    low_stock: "text-orange-500",
    out_of_stock: "text-red-500",
  };
  const stockText = {
    in_stock: "En stock",
    low_stock: "Faible stock",
    out_of_stock: "Indisponible",
  };

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square w-full">
        {image && (
          <Image
            src={image.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.tags.map(tag => (
            <Badge key={tag} variant={tag === 'promo' ? 'destructive' : 'secondary'}>
              {tag === 'age_required' ? '18+' : tag}
            </Badge>
          ))}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.format}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
          <Button size="icon" disabled={product.stock === 'out_of_stock'}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className={`text-xs mt-2 ${stockColor[product.stock]}`}>{stockText[product.stock]}</p>
      </CardContent>
    </Card>
  );
};

export function ProductGrid() {
  const popularProducts = PRODUCTS.filter(p => p.tags.includes('popular'));

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Populaire</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {popularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
