import { Car } from "lucide-react";

export default function SettingsDriversPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres chauffeurs</h1>
        <p className="text-muted-foreground mt-1">Configuration des chauffeurs, documents requis et rémunération</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Définissez les exigences pour les chauffeurs et leur rémunération.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Tarif de base par livraison</p>
            </div>
            <input type="text" defaultValue="$5.00" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Bonus distance (par km)</p>
            </div>
            <input type="text" defaultValue="$0.50" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Documents requis</p>
            <span className="text-sm text-muted-foreground">Permis, assurance</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Vérification antécédents</p>
            <span className="text-sm text-muted-foreground">Obligatoire</span>
          </div>
        </div>
      </div>
    </div>
  );
}
