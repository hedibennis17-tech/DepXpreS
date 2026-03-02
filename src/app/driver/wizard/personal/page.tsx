import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function PersonalInfoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 1: Informations personnelles</CardTitle>
        <CardDescription>
          Commençons par vos informations de base.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first-name">Prénom</Label>
          <Input id="first-name" placeholder="Jean" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Nom</Label>
          <Input id="last-name" placeholder="Tremblay" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="jean.tremblay@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" placeholder="(514) 123-4567" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" placeholder="123 rue de la Main" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" placeholder="Montréal" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal-code">Code postal</Label>
          <Input id="postal-code" placeholder="H1H 1H1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date de naissance</Label>
          <Input id="dob" type="date" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild>
          <Link href="/driver/wizard/vehicle">Suivant: Véhicule</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
