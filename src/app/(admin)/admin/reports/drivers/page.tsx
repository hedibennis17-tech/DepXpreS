import Link from "next/link";
import { BarChart2, TrendingUp, Download, Calendar } from "lucide-react";

export default function ReportDriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapport des chauffeurs</h1>
          <p className="text-muted-foreground mt-1">Performance des chauffeurs, livraisons et revenus</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm hover:bg-muted transition-colors">
            <Calendar className="h-4 w-4" /> Cette semaine
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">—</p>
          <p className="text-xs text-muted-foreground mt-1">Chauffeurs actifs</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">—</p>
          <p className="text-xs text-muted-foreground mt-1">Livraisons totales</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">—</p>
          <p className="text-xs text-muted-foreground mt-1">Temps moyen</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">—</p>
          <p className="text-xs text-muted-foreground mt-1">Note moyenne</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-8 flex flex-col items-center justify-center text-center">
        <BarChart2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="font-semibold text-foreground">Graphiques en cours de développement</p>
        <p className="text-sm text-muted-foreground mt-1">Les données sont disponibles via l'export CSV</p>
        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors">
          <Download className="h-4 w-4" /> Télécharger le rapport
        </button>
      </div>
    </div>
  );
}
