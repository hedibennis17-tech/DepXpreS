import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Clock, Hourglass, Route } from "lucide-react";
import Image from "next/image";

const mapImage = PlaceHolderImages.find(img => img.id === 'map-placeholder');

// Set this to `true` to see the approved driver view
const isApproved = true;

const PendingApproval = () => (
    <div className="text-center">
        <Hourglass className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold">Candidature en cours d'examen</h2>
        <p className="mt-2 text-muted-foreground">
            Merci d'avoir soumis vos informations. Nous examinons votre profil et vous informerons dès que votre compte sera approuvé.
        </p>
        <Button className="mt-6">Contacter le support</Button>
    </div>
);

const DriverActiveDashboard = () => (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Nouvelle Commande Disponible</CardTitle>
                    <CardDescription>Acceptez pour commencer la livraison.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Route className="h-5 w-5 text-muted-foreground" />
                        <span>Distance totale: 4.2 km</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>Temps estimé: 15 min</span>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                        <p className="font-semibold">Dépanneur de la Zone</p>
                        <p className="text-sm text-muted-foreground">123 Rue Chomedey, Laval</p>
                    </div>
                     <div className="p-3 bg-muted rounded-md">
                        <p className="font-semibold">Client</p>
                        <p className="text-sm text-muted-foreground">456 Av. du Parc, Laval</p>
                    </div>
                    <Button size="lg" className="w-full">Accepter (Gain estimé: 8.50$)</Button>
                    <Button variant="outline" className="w-full">Refuser</Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="overflow-hidden">
                <div className="relative h-[600px] w-full">
                     {mapImage && (
                    <Image 
                        src={mapImage.imageUrl} 
                        alt={mapImage.description} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={mapImage.imageHint}
                    />
                    )}
                    <div className="absolute top-4 left-4 bg-background/80 p-3 rounded-lg shadow-lg">
                        <p className="font-semibold">Vous êtes en ligne</p>
                        <p className="text-sm text-muted-foreground">En attente de commandes...</p>
                    </div>
                </div>
            </Card>
        </div>
    </div>
)


export default function DriverDashboardPage() {
  return (
    <div className="container py-8">
       {isApproved ? <DriverActiveDashboard /> : <PendingApproval />}
    </div>
  );
}
