import { Palette } from "lucide-react";

export default function SettingsBrandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personnalisation</h1>
        <p className="text-muted-foreground mt-1">Logo, couleurs et identité visuelle de la plateforme</p>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Palette className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-semibold text-foreground">Configuration disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalisez l'apparence de la plateforme.
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Couleur principale</p>
            </div>
            <input type="text" defaultValue="#F97316 (Orange)" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Nom affiché</p>
            </div>
            <input type="text" defaultValue="FastDép" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">Slogan</p>
            </div>
            <input type="text" defaultValue="Livraison express 24/7" className="border rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-0">
            <p className="text-sm font-medium">Logo</p>
            <span className="text-sm text-muted-foreground">fastdep-logo.svg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
