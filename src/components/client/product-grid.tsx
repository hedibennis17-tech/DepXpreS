'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: string;
  isActive?: boolean;
  requiresAgeVerification?: boolean;
  categoryId?: string;
  format?: string;
  tags?: string[];
}

const stockColor: Record<string, string> = {
  in_stock: 'text-green-600',
  low_stock: 'text-orange-500',
  out_of_stock: 'text-red-500',
};
const stockText: Record<string, string> = {
  in_stock: 'En stock',
  low_stock: 'Faible stock',
  out_of_stock: 'Indisponible',
};

function ProductCard({ product }: { product: Product }) {
  const stock = product.stock || 'in_stock';
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square w-full bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingCart className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {product.requiresAgeVerification && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">18+</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base truncate">{product.name}</h3>
        {product.format && <p className="text-sm text-muted-foreground">{product.format}</p>}
        <div className="flex items-center justify-between mt-4">
          <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
          <Button size="icon" disabled={stock === 'out_of_stock'}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className={`text-xs mt-2 ${stockColor[stock] || 'text-green-600'}`}>
          {stockText[stock] || 'En stock'}
        </p>
      </CardContent>
    </Card>
  );
}

export function ProductGrid({ categoryId }: { categoryId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = '/api/admin/products?isActive=true';
        if (categoryId) url += `&categoryId=${categoryId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Produits</h2>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Produits</h2>
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun produit disponible</p>
          <p className="text-sm mt-1">Ajoutez des produits depuis le tableau de bord admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">
        {categoryId ? 'Produits' : 'Populaires'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
