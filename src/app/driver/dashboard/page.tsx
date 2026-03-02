"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Clock, Route, DollarSign, Star, Package, MapPin, Phone,
  CheckCircle2, XCircle, Hourglass, TrendingUp, Navigation, Bell,
} from "lucide-react";

const isApproved = true;

const PendingApproval = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center max-w-md">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Hourglass className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Candidature en cours d&apos;examen</h2>
      <p className="text-muted-foreground mb-6">
        Merci d&apos;avoir soumis vos informations. Notre équipe examine votre profil et vous contactera sous 24-48h.
      </p>
      <Button>Contacter le support</Button>
    </div>
  </div>
);

type OrderState = "waiting" | "accepted" | "delivering" | "done";

const DriverActiveDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [orderState, setOrderState] = useState<OrderState>("waiting");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://picsum.photos/seed/driver-marc/200/200" />
            <AvatarFallback>MA</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg">Marc-Andre</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>4.9 - Honda Civic 2020</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="online-toggle" checked={isOnline} onCheckedChange={setIsOnline} />
            <Label htmlFor="online-toggle" className={`font-semibold ${isOnline ? "text-green-600" : "text-muted-foreground"}`}>
              {isOnline ? "En ligne" : "Hors ligne"}
            </Label>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Gains aujourd'hui", value: "$87.50", color: "text-primary" },
          { icon: Package, label: "Livraisons", value: "8", color: "" },
          { icon: Star, label: "Note", value: "4.9", color: "" },
          { icon: Clock, label: "Temps en ligne", value: "4h 32min", color: "" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {orderState === "waiting" && (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Nouvelle commande</CardTitle>
                  <Badge className="bg-orange-500 text-white animate-pulse">Nouveau</Badge>
                </div>
                <CardDescription>Acceptez dans les 30 secondes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />Ramassage
                  </div>
                  <p className="text-sm font-semibold">Depanneur Chomedey</p>
                  <p className="text-xs text-muted-foreground">123 Boul. Chomedey, Laval</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Navigation className="h-4 w-4 text-blue-600" />Livraison
                  </div>
                  <p className="text-sm font-semibold">Client : Sophie M.</p>
                  <p className="text-xs text-muted-foreground">456 Av. du Parc, Laval</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Route className="h-4 w-4" />4.2 km</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />~15 min</span>
                  <span className="flex items-center gap-1 font-semibold text-primary"><DollarSign className="h-4 w-4" />8.50$</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setOrderState("accepted")} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />Accepter
                  </Button>
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/30">
                    <XCircle className="h-4 w-4" />Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {orderState === "accepted" && (
            <Card className="border-blue-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />Aller au depanneur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold">Depanneur Chomedey</p>
                  <p className="text-sm text-muted-foreground">123 Boul. Chomedey, Laval</p>
                  <div className="flex items-center gap-2 mt-2"><Phone className="h-3 w-3" /><span className="text-xs">514-555-0123</span></div>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Articles a ramasser :</p>
                  <p className="text-muted-foreground">- 2x Doritos 255g</p>
                  <p className="text-muted-foreground">- 4x Coca-Cola 355ml</p>
                  <p className="text-muted-foreground">- 1x Heineken 6 pack</p>
                </div>
                <Button onClick={() => setOrderState("delivering")} className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />Commande recuperee
                </Button>
              </CardContent>
            </Card>
          )}

          {orderState === "delivering" && (
            <Card className="border-green-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-green-600" />En route vers le client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold">Sophie M.</p>
                  <p className="text-sm text-muted-foreground">456 Av. du Parc, Laval</p>
                  <div className="flex items-center gap-2 mt-2"><Phone className="h-3 w-3" /><span className="text-xs">514-555-9876</span></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance restante</span>
                    <span className="font-medium">2.1 km</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="gap-1"><Phone className="h-3 w-3" />Appeler</Button>
                  <Button onClick={() => setOrderState("done")} size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-3 w-3" />Livre !
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {orderState === "done" && (
            <Card className="border-green-400 bg-green-50">
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <div>
                  <p className="text-xl font-bold text-green-700">Livraison reussie !</p>
                  <p className="text-sm text-muted-foreground">+$8.50 ajoute a vos gains</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground">Le client vous a note 5 etoiles !</p>
                <Button onClick={() => setOrderState("waiting")} className="w-full">Pret pour la prochaine</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />Gains cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">$342.75</p>
              <p className="text-sm text-muted-foreground mt-1">+12% vs semaine derniere</p>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                {[["Lundi","$45.00"],["Mardi","$62.50"],["Mercredi","$38.25"],["Jeudi","$109.50"]].map(([day, amt]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium">{amt}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-primary">
                  <span>Aujourd&apos;hui</span><span>$87.50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-full min-h-[500px]">
            <div className="relative h-full min-h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <div className="relative z-10 text-center space-y-4">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Navigation className="h-8 w-8 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg">
                  <p className="font-bold text-lg">Vous etes ici</p>
                  <p className="text-sm text-muted-foreground">Chomedey, Laval</p>
                  <Badge className={`mt-2 ${isOnline ? "bg-green-600" : "bg-gray-500"} text-white`}>
                    {isOnline ? "En ligne - En attente" : "Hors ligne"}
                  </Badge>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">GPS actif</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Derniere mise a jour: maintenant</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function DriverDashboardPage() {
  return (
    <div className="container py-6">
      {isApproved ? <DriverActiveDashboard /> : <PendingApproval />}
    </div>
  );
}
