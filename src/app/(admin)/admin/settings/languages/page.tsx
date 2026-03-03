import { Globe } from "lucide-react";

export default function SettingsLanguagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Langues</h1>
        <p className="text-muted-foreground mt-1">Langues disponibles sur la plateforme</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Globe className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les langues disponibles pour les utilisateurs.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Langue principale</p>
            <span className="text-sm text-muted-foreground">Français (Canada)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Langue secondaire</p>
            <span className="text-sm text-muted-foreground">English</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Traduction automatique</p>
            <span className="text-sm text-muted-foreground">Désactivé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
