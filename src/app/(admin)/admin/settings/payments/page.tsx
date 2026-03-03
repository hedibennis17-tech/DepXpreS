import { CreditCard } from "lucide-react";

export default function SettingsPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de paiement</h1>
        <p className="text-muted-foreground mt-1">Méthodes de paiement acceptées et configuration Stripe</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les méthodes de paiement, les commissions et les virements.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Stripe</p>
            <span className="text-sm text-muted-foreground">Configuré</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Interac</p>
            <span className="text-sm text-muted-foreground">Activé</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Commission plateforme</p>
            </div>
            <input type="text" defaultValue="15%" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Délai virement dépanneurs</p>
            </div>
            <input type="text" defaultValue="7 jours" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
