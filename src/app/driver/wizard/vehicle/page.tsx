import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function VehicleInfoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 2: Informations sur le véhicule</CardTitle>
        <CardDescription>
          Décrivez le véhicule que vous utiliserez pour les livraisons.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="vehicle-type">Type de véhicule</Label>
             <Select>
                <SelectTrigger id="vehicle-type">
                    <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="car">Voiture</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="bike">Vélo</SelectItem>
                    <SelectItem value="e-bike">Vélo électrique</SelectItem>
                    <SelectItem value="walk">À pied</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="make">Marque</Label>
          <Input id="make" placeholder="Toyota" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modèle</Label>
          <Input id="model" placeholder="Corolla" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Année</Label>
          <Input id="year" type="number" placeholder="2022" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Couleur</Label>
          <Input id="color" placeholder="Gris" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license-plate">Plaque d'immatriculation</Label>
          <Input id="license-plate" placeholder="F12 345" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
         <Button variant="outline" asChild>
          <Link href="/driver/wizard/personal">Précédent</Link>
        </Button>
        <Button asChild>
          <Link href="/driver/wizard/documents">Suivant: Documents</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
