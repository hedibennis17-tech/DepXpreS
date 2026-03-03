'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPanel } from '@/components/client/map-panel';
import { DeliveryInfoPanel } from '@/components/client/delivery-info-panel';
import { FloatingCartButton } from '@/components/client/floating-cart-button';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  available?: boolean;
  categoryId?: string;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Charger toutes les catégories pour trouver celle qui correspond au slug
        const catRes = await fetch('/api/admin/categories');
        const catData = await catRes.json();
        const allCategories: Category[] = catData.categories || [];

        // Trouver la catégorie par slug ou id
        const found = allCategories.find(
          (c) => c.slug === slug || c.id === slug
        );
        setCategory(found || null);

        if (found) {
          // Charger les produits de cette catégorie
          const prodRes = await fetch(`/api/admin/products?categoryId=${found.id}`);
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Catégorie introuvable</h1>
        <p className="text-muted-foreground">Cette catégorie n&apos;existe pas ou a été supprimée.</p>
        <Button asChild>
          <Link href="/client">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-4 px-4">
        <div className="container flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold">{category.name}</h1>
            <p className="text-sm text-white/80">
              {products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="hidden lg:block lg:col-span-3">
            <DeliveryInfoPanel />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 space-y-6">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <Package className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Aucun produit dans cette catégorie</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Les produits de la catégorie &quot;{category.name}&quot; seront disponibles prochainement.
                </p>
                <Button asChild variant="outline">
                  <Link href="/client">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voir toutes les catégories
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {product.image ? (
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Package className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                        {product.available === false || (product.stock !== undefined && product.stock <= 0) ? (
                          <Badge variant="secondary" className="text-xs shrink-0">Rupture</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200 shrink-0">
                            En stock
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </span>
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          disabled={product.available === false || (product.stock !== undefined && product.stock <= 0)}
                          onClick={() => addToCart(product.id)}
                        >
                          {cart[product.id] ? (
                            <span className="text-xs font-bold">{cart[product.id]}</span>
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="hidden lg:block lg:col-span-3">
            <MapPanel />
          </div>
        </div>
      </div>

      <FloatingCartButton />
    </div>
  );
}
