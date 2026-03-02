import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import Link from "next/link";

const DocumentUpload = ({ label, id, description }: { label: string, id: string, description: string }) => (
    <div className="p-4 border-2 border-dashed rounded-lg">
        <Label htmlFor={id} className="cursor-pointer">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center sm:text-left">
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="sm:ml-auto mt-2 sm:mt-0">
                    <div>Téléverser</div>
                </Button>
                <Input id={id} type="file" className="hidden" />
            </div>
        </Label>
    </div>
);


export default function DocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Étape 3: Documents Requis</CardTitle>
        <CardDescription>
          Veuillez téléverser les documents suivants pour vérification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DocumentUpload 
            id="license" 
            label="Permis de conduire" 
            description="Recto et verso, clairement lisible." 
        />
        <DocumentUpload 
            id="insurance" 
            label="Assurance auto" 
            description="Preuve d'assurance commerciale valide." 
        />
        <DocumentUpload 
            id="registration" 
            label="Immatriculation" 
            description="Certificat d'immatriculation du véhicule." 
        />
        <DocumentUpload 
            id="vehicle-photo" 
            label="Photo du véhicule" 
            description="Photo claire de l'extérieur de votre véhicule." 
        />
         <DocumentUpload 
            id="selfie" 
            label="Selfie de vérification" 
            description="Une photo de vous tenant une pièce d'identité." 
        />
      </CardContent>
      <CardFooter className="flex justify-between">
         <Button variant="outline" asChild>
          <Link href="/driver/wizard/vehicle">Précédent</Link>
        </Button>
        <Button asChild>
          <Link href="/driver/wizard/confirmation">Suivant: Confirmation</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
