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
import { AddressAutocompleteInput, type AddressValue } from "@/components/address/AddressAutocompleteInput";

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
  const [deliveryAddress, setDeliveryAddress] = useState<AddressValue | null>(null);
  const [apt, setApt] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

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
    if (!deliveryAddress) {
      alert("Veuillez entrer votre adresse de livraison.");
      return;
    }
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
              {/* Autocomplete BDOA */}
              <AddressAutocompleteInput
                label="Adresse"
                placeholder="Commencez à taper votre adresse..."
                value={deliveryAddress || undefined}
                onChange={setDeliveryAddress}
                province="QC"
                showCurrentLocationButton={true}
                required
              />

              {/* Afficher les champs remplis automatiquement */}
              {deliveryAddress && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-xs text-gray-500">Ville</p>
                    <p className="text-sm font-medium">{deliveryAddress.city || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Code postal</p>
                    <p className="text-sm font-medium">{deliveryAddress.postalCode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Province</p>
                    <p className="text-sm font-medium">{deliveryAddress.provinceCode || "QC"}</p>
                  </div>
                  {deliveryAddress.latitude && deliveryAddress.longitude && (
                    <div>
                      <p className="text-xs text-gray-500">GPS</p>
                      <p className="text-xs font-mono text-gray-600">
                        {deliveryAddress.latitude.toFixed(4)}, {deliveryAddress.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apt">Apt / Suite</Label>
                  <Input
                    id="apt"
                    placeholder="Apt 4B"
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instructions de livraison</Label>
                <Input
                  id="instructions"
                  placeholder="Ex: Sonner à la porte 2"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                />
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
                      <Input placeholder="Jean Tremblay" />
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <div className="font-medium">Comptant à la livraison</div>
                    <div className="text-sm text-muted-foreground">Payer en espèces</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Résumé de commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {product.name} × {quantity}
                  </span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>${delivery.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabais (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TPS + TVQ (14.975%)</span>
                <span>${taxes.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <Input
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={handlePromo}>
                  <Tag className="h-3.5 w-3.5" />
                </Button>
              </div>
              {promoApplied && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Code DEPXPRES1 appliqué!
                </div>
              )}

              {/* Address summary */}
              {deliveryAddress && (
                <div className="p-2 bg-orange-50 rounded text-xs text-orange-700 border border-orange-200">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {deliveryAddress.fullLabel || deliveryAddress.line1}
                  {apt ? `, ${apt}` : ""}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleOrder}
                disabled={isProcessing || !deliveryAddress}
              >
                {isProcessing ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Confirmer la commande
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Paiement sécurisé SSL 256-bit
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
