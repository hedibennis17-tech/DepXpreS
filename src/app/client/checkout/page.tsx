"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard, MapPin, Clock, ChevronLeft, Lock, Tag, Truck, CheckCircle2, Loader2,
} from "lucide-react";
import Link from "next/link";
import { AddressAutocompleteInput, type AddressValue } from "@/components/address/AddressAutocompleteInput";

// Taux de taxes Québec
const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;
const DELIVERY_FEE = 4.99;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  storeId?: string;
  storeName?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressValue | null>(null);
  const [apt, setApt] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/client/login"); return; }
      setUser(u);
    });
    // Charger le panier depuis localStorage
    try {
      const saved = localStorage.getItem("depxpres_cart");
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch {}
    return () => unsub();
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const taxableAmount = subtotal - discount + DELIVERY_FEE;
  const tps = taxableAmount * TPS_RATE;
  const tvq = taxableAmount * TVQ_RATE;
  const total = taxableAmount + tps + tvq;

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
    if (!user) {
      router.push("/client/login");
      return;
    }
    if (cartItems.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
    setIsProcessing(true);
    try {
      const storeId = cartItems[0]?.storeId || "default_store";
      const storeName = cartItems[0]?.storeName || "Dépanneur";
      const fullAddress = deliveryAddress.fullLabel || deliveryAddress.line1 || "";
      const addressWithApt = apt ? `${fullAddress}, Apt ${apt}` : fullAddress;

      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.uid,
          clientName: user.displayName || "",
          clientEmail: user.email || "",
          storeId,
          storeName,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryFee: DELIVERY_FEE,
          tps: Math.round(tps * 100) / 100,
          tvq: Math.round(tvq * 100) / 100,
          total: Math.round(total * 100) / 100,
          deliveryAddress: addressWithApt,
          deliveryLat: deliveryAddress.lat || null,
          deliveryLng: deliveryAddress.lng || null,
          notes: notes || deliveryInstructions || "",
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success && data.order_id) {
        // Vider le panier
        localStorage.removeItem("depxpres_cart");
        // Rediriger vers le suivi
        router.push(`/client/orders/${data.order_id}`);
      } else {
        alert("Erreur lors de la commande. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
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

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/client">Commander</Link>
          </Button>
        </div>
      ) : (
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
              <CardContent className="space-y-3">
                <AddressAutocompleteInput
                  value={deliveryAddress}
                  onChange={setDeliveryAddress}
                  placeholder="Entrez votre adresse..."
                />
                <Input
                  placeholder="Appartement, suite, bureau (optionnel)"
                  value={apt}
                  onChange={(e) => setApt(e.target.value)}
                />
                <Input
                  placeholder="Instructions de livraison (optionnel)"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Délai de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-700">Express — 20 à 45 min</p>
                    <p className="text-xs text-orange-600">Livraison à votre porte</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 border-0">
                    Disponible
                  </Badge>
                </div>
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
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer flex-1">
                      <div className="font-medium">Comptant à la livraison</div>
                      <div className="text-sm text-muted-foreground">Payer en espèces au chauffeur</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="cursor-pointer flex-1">
                      <div className="font-medium">Carte de crédit / débit</div>
                      <div className="text-sm text-muted-foreground">Paiement sécurisé en ligne</div>
                    </Label>
                  </div>
                </RadioGroup>
                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-3 p-3 bg-secondary/30 rounded-lg">
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
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes supplémentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Instructions spéciales pour votre commande..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabais (10%)</span>
                    <span>-${(subtotal * 0.1).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TPS (5%)</span>
                  <span>${tps.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVQ (9,975%)</span>
                  <span>${tvq.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
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
                    Code DEPXPRES1 appliqué !
                  </div>
                )}
                {/* Address summary */}
                {deliveryAddress && (
                  <div className="p-2 bg-orange-50 rounded text-xs text-orange-700 border border-orange-200">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {deliveryAddress.fullLabel || deliveryAddress.line1}
                    {apt ? `, Apt ${apt}` : ""}
                  </div>
                )}
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleOrder}
                  disabled={isProcessing || !deliveryAddress}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Confirmer la commande — ${total.toFixed(2)}
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
      )}
    </div>
  );
}
