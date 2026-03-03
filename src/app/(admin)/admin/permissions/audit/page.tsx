import { FileText, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PermissionsAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal d'audit</h1>
          <p className="text-muted-foreground mt-1">Historique des actions administratives sur la plateforme.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>
      <div className="rounded-xl border bg-card p-8 flex flex-col items-center justify-center text-center">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="font-semibold text-foreground">Journal d'audit</p>
        <p className="text-sm text-muted-foreground mt-1">
          Les logs d'audit sont enregistrés dans Firebase. Consultez la console Firebase pour l'historique complet.
        </p>
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors"
        >
          Ouvrir Firebase Console →
        </a>
      </div>
    </div>
  );
}
