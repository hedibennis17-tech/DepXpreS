import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Users, Clock, ShoppingBasket } from "lucide-react";

export function MapPanel() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-placeholder');

  return (
    <Card className="sticky top-20 overflow-hidden">
      <div className="relative h-64 w-full">
        {mapImage && (
          <Image 
            src={mapImage.imageUrl} 
            alt={mapImage.description} 
            fill
            className="object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-4">
            <ShoppingBasket className="w-6 h-6 text-primary"/>
            <div>
                <p className="font-semibold">Dépanneur de la Zone</p>
                <p className="text-sm text-muted-foreground">Chomedey, Laval</p>
            </div>
        </div>
        <Separator />
         <div className="flex items-center gap-4">
            <Users className="w-6 h-6 text-primary"/>
            <div>
                <p className="font-semibold">4 Chauffeurs en ligne</p>
                <p className="text-sm text-muted-foreground">Prêts pour votre commande</p>
            </div>
        </div>
        <Separator />
         <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-primary"/>
            <div>
                <p className="font-semibold">~25-35 min</p>
                <p className="text-sm text-muted-foreground">Temps de livraison estimé</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
