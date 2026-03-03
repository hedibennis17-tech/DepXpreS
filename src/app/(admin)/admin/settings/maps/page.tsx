import { Map } from "lucide-react";

export default function SettingsMapsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres cartographie</h1>
        <p className="text-muted-foreground mt-1">Configuration Google Maps et géolocalisation</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Map className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les API de cartographie et les paramètres de géolocalisation.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Fournisseur cartes</p>
            <span className="text-sm text-muted-foreground">Google Maps</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">API Key</p>
            <span className="text-sm text-muted-foreground">Configurée</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Précision GPS (m)</p>
            </div>
            <input type="text" defaultValue="50" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Mise à jour position (s)</p>
            </div>
            <input type="text" defaultValue="10" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
