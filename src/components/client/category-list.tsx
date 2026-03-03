'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  productCount?: number;
}

export function CategoryList({ className }: { className?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={cn('pb-4', className)}>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Categories</h2>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={cn('pb-4', className)}>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Categories</h2>
        <p className="text-muted-foreground text-sm">
          Aucune categorie disponible. Creez des categories depuis le tableau de bord admin.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('pb-4', className)}>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link href={`/client/category/${category.slug || category.id}`} key={category.id}>
            <Card className="group hover:bg-primary/5 transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <Package className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-center">{category.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
