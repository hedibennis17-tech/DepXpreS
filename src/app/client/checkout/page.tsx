"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  MapPin,
  Clock,
  ChevronLeft,
  Lock,
  Tag,
  Truck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/data";

const cartItems = [
  { product: PRODUCTS[4], quantity: 2 },
  { product: PRODUCTS[6], quantity: 4 },
  { product: PRODUCTS[0], quantity: 1 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = 6.99;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const taxes = (subtotal - discount) * 0.14975;
  const total = subtotal + delivery - discount + taxes;

  const handlePromo = () => {
    if (promoCode.toUpperCase() === "DEPXPRES1") {
      setPromoApplied(true);
    }
  };

  const handleOrder = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    router.push("/client/order");
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/client">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au catalogue
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Delivery & Payment */}
        <div className="lg:col-span-3 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Rue</Label>
                  <Input id="street" placeholder="123 Rue Principale" defaultValue="456 Boul. St-Martin" />
                </div>
                <div>
                  <Label htmlFor="apt">Apt / Suite</Label>
                  <Input id="apt" placeholder="Apt 4B" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue="Laval" />
                </div>
                <div>
                  <Label htmlFor="postal">Code postal</Label>
                  <Input id="postal" defaultValue="H7W 1A1" />
                </div>
              </div>
              <div>
                <Label htmlFor="instructions">Instructions de livraison</Label>
                <Input id="instructions" placeholder="Ex: Sonner à la porte 2" />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Heure de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="now" className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="cursor-pointer flex-1">
                    <div className="font-medium">Livraison immédiate</div>
                    <div className="text-sm text-muted-foreground">Estimé dans 25–35 min</div>
                  </Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Disponible</Badge>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="cursor-pointer flex-1">
                    <div className="font-medium">Planifier</div>
                    <div className="text-sm text-muted-foreground">Choisir une heure</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Mode de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-1">
                    <div className="font-medium">Carte de crédit / débit</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, Interac</div>
                  </Label>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                    <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <div className="ml-8 space-y-3 p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <Label>Numéro de carte</Label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Expiration</Label>
                        <Input placeholder="MM/AA" />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label>Nom sur la carte</Label>
                      <Input placeholder="Prénom Nom" />
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <div className="font-medium">Paiement à la livraison</div>
                    <div className="text-sm text-muted-foreground">Espèces uniquement</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Votre commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Promo Code */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Code promo
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="DEPXPRES1"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="text-sm"
                    disabled={promoApplied}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromo}
                    disabled={promoApplied}
                  >
                    {promoApplied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : "Appliquer"}
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Réduction de 10% appliquée !
                  </p>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction (10%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Livraison
                  </span>
                  <span>${delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (TPS+TVQ)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Confirmer la commande
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Paiement sécurisé par Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
