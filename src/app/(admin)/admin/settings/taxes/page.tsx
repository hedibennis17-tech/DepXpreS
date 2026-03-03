import { Receipt } from "lucide-react";

export default function SettingsTaxesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Taxes et fiscalité</h1>
        <p className="text-muted-foreground mt-1">Configuration des taxes applicables (TPS, TVQ)</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les taux de taxes applicables selon la province.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">TPS (fédérale)</p>
            </div>
            <input type="text" defaultValue="5%" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">TVQ (Québec)</p>
            </div>
            <input type="text" defaultValue="9.975%" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Taxes sur livraison</p>
            <span className="text-sm text-muted-foreground">Oui</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Numéro TPS</p>
            </div>
            <input type="text" defaultValue="À configurer" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
