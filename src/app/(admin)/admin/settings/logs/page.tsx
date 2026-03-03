import { FileText } from "lucide-react";

export default function SettingsLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journaux système</h1>
        <p className="text-muted-foreground mt-1">Logs d'erreurs, d'accès et d'activité système</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les journaux système pour diagnostiquer les problèmes.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Niveau de log</p>
            <span className="text-sm text-muted-foreground">INFO</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Rétention logs</p>
            </div>
            <input type="text" defaultValue="30 jours" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Logs d'erreurs</p>
            <span className="text-sm text-muted-foreground">Activé</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Logs d'accès</p>
            <span className="text-sm text-muted-foreground">Activé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
