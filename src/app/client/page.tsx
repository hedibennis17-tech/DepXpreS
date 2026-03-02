"use client";

import { useState } from "react";
import { DeliveryInfoPanel } from "@/components/client/delivery-info-panel";
import { CategoryList } from "@/components/client/category-list";
import { ProductGrid } from "@/components/client/product-grid";
import { MapPanel } from "@/components/client/map-panel";
import { FloatingCartButton } from "@/components/client/floating-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ClientHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-3 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
            <span className="font-semibold text-sm md:text-base">
              Livraison express en 30 min — Montréal & Laval
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Ouvert 24h/7j</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 ml-2">
              <Star className="h-3 w-3 fill-yellow-300 text-yellow-300 mr-1" />
              4.9 / 5
            </Badge>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-secondary/50 border-b py-2 px-4">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            🎉 <strong>Première commande :</strong> Livraison gratuite avec le code{" "}
            <span className="font-mono font-bold text-primary">DEPXPRES1</span>
          </p>
          <Button variant="link" size="sm" className="text-primary p-0 h-auto" asChild>
            <Link href="/auth/signup">
              S&apos;inscrire <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
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
          <div className="lg:col-span-6 space-y-8">
            <CategoryList />
            <ProductGrid />
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
