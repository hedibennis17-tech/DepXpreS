import { Store } from "lucide-react";

export default function SettingsStoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres dépanneurs</h1>
        <p className="text-muted-foreground mt-1">Configuration des dépanneurs partenaires</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Store className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Définissez les exigences et paramètres pour les dépanneurs partenaires.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Commission dépanneur</p>
            </div>
            <input type="text" defaultValue="12%" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Commande minimum</p>
            </div>
            <input type="text" defaultValue="$10.00" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Délai paiement</p>
            </div>
            <input type="text" defaultValue="7 jours" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Vérification requise</p>
            <span className="text-sm text-muted-foreground">Oui</span>
          </div>
        </div>
      </div>
    </div>
  );
}
