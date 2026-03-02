import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { User, Car, FileText, Check } from "lucide-react";
import Link from "next/link";

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div>
        <div className="flex items-center gap-3 mb-3">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" size="sm" className="ml-auto text-primary">Modifier</Button>
        </div>
        <div className="pl-9 space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
);

export default function ConfirmationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 4: Confirmation</CardTitle>
        <CardDescription>
          Veuillez vérifier vos informations avant de soumettre votre candidature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section icon={User} title="Informations personnelles">
          <p><strong>Nom:</strong> Jean Tremblay</p>
          <p><strong>Email:</strong> jean.tremblay@example.com</p>
          <p><strong>Adresse:</strong> 123 rue de la Main, Montréal, H1H 1H1</p>
        </Section>
        <Separator />
        <Section icon={Car} title="Informations sur le véhicule">
          <p><strong>Type:</strong> Voiture</p>
          <p><strong>Véhicule:</strong> Toyota Corolla 2022 (Gris)</p>
          <p><strong>Plaque:</strong> F12 345</p>
        </Section>
        <Separator />
        <Section icon={FileText} title="Documents soumis">
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Permis de conduire</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Assurance auto</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Immatriculation</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Photo du véhicule</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Selfie de vérification</p>
        </Section>
        <Separator />
         <div className="items-top flex space-x-2 pt-4">
            <Checkbox id="terms" />
            <div className="grid gap-1.5 leading-none">
                <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                Accepter les termes et conditions
                </label>
                <p className="text-sm text-muted-foreground">
                J'accepte les termes de service et la politique de confidentialité de FastDép Connect.
                </p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
         <Button variant="outline" asChild>
          <Link href="/driver/wizard/documents">Précédent</Link>
        </Button>
        <Button asChild>
          <Link href="/driver/dashboard">Soumettre ma candidature</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
