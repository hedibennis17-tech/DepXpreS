import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, PersonStanding, ShoppingBag, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function DeliveryInfoPanel() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Livrer à</p>
            <p className="font-semibold">Chomedey, Laval</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">Modifier</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button variant="secondary" className="w-full justify-start gap-2 bg-primary/10 text-primary border border-primary/20">
            <Clock className="h-4 w-4"/>
            Livraison immédiate
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Clock className="h-4 w-4"/>
            Planifier
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <PersonStanding className="h-4 w-4"/>
            Pour moi
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Users className="h-4 w-4"/>
            Quelqu'un d'autre
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Votre commande</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>18.28$</span>
                </div>
                <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>6.99$</span>
                </div>
                <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>3.78$</span>
                </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>29.05$</span>
            </div>
        </div>

        <Button size="lg" className="w-full">
            Passer la commande
        </Button>
      </CardContent>
    </Card>
  );
}
