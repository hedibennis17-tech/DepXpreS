"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  Star,
  Truck,
  Store,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { MOCK_ORDERS } from "@/lib/data";

const ORDER_STEPS = [
  { id: "confirmed", label: "Commande confirmée", icon: CheckCircle2 },
  { id: "preparing", label: "En préparation", icon: Store },
  { id: "en_route", label: "En route", icon: Truck },
  { id: "delivered", label: "Livré", icon: Package },
];

export default function OrderTrackingPage() {
  const order = MOCK_ORDERS[0];
  const [currentStep] = useState(2);
  const [eta, setEta] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const progressValue = ((currentStep + 1) / ORDER_STEPS.length) * 100;

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/client">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au catalogue
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Suivi de commande</h1>
            <p className="text-muted-foreground text-sm">Commande #{order.id}</p>
          </div>
          <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
            <Truck className="h-3 w-3 mr-1" />
            En route
          </Badge>
        </div>
      </div>

      {/* ETA Card */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Arrivée estimée</p>
              <p className="text-4xl font-bold text-primary">{eta} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Adresse de livraison</p>
              <div className="flex items-center gap-1 text-sm font-medium">
                <MapPin className="h-3 w-3 text-primary" />
                Chomedey, Laval
              </div>
            </div>
          </div>
          <Progress value={progressValue} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Progression de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ORDER_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDone
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrent ? "text-primary" : isDone ? "text-green-600" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        En cours...
                      </p>
                    )}
                    {isDone && <p className="text-xs text-green-600">Terminé</p>}
                  </div>
                  {isDone && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Votre chauffeur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={order.driver?.avatarUrl} />
              <AvatarFallback>{order.driver?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg">{order.driver?.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.9 · 234 livraisons</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <Phone className="h-4 w-4" />
              Appeler
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sous-total</span>
              <span>${(order.total - 6.99 - 2.76).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Livraison</span>
              <span>$6.99</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxes (TPS+TVQ)</span>
              <span>$2.76</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
