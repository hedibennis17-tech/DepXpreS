import { Lock } from "lucide-react";

export default function SettingsAuthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authentification</h1>
        <p className="text-muted-foreground mt-1">Configuration de la sécurité et des méthodes de connexion</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les méthodes d'authentification et les politiques de sécurité.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Fournisseur auth</p>
            <span className="text-sm text-muted-foreground">Firebase Auth</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">2FA admin</p>
            <span className="text-sm text-muted-foreground">Recommandé</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Durée session</p>
            </div>
            <input type="text" defaultValue="7 jours" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Tentatives max</p>
            </div>
            <input type="text" defaultValue="5" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
