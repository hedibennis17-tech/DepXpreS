import { Plug } from "lucide-react";

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intégrations</h1>
        <p className="text-muted-foreground mt-1">Services tiers connectés à la plateforme</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Plug className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les intégrations avec les services externes.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Firebase</p>
            <span className="text-sm text-muted-foreground">Connecté</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Stripe</p>
            <span className="text-sm text-muted-foreground">Connecté</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Google Maps</p>
            <span className="text-sm text-muted-foreground">Connecté</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Twilio SMS</p>
            <span className="text-sm text-muted-foreground">Configuré</span>
          </div>
        </div>
      </div>
    </div>
  );
}
