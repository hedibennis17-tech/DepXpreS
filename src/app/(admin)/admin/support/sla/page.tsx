"use client";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";

export default function SupportSLAPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SLA & Performance</h1>
        <p className="text-muted-foreground mt-1">Indicateurs de niveau de service du support</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Temps réponse moyen", value: "< 2h", color: "text-green-600", icon: Clock },
          { label: "Tickets résolus", value: "94%", color: "text-blue-600", icon: TrendingUp },
          { label: "Tickets en attente", value: "—", color: "text-yellow-600", icon: AlertCircle },
          { label: "Satisfaction client", value: "4.7/5", color: "text-orange-600", icon: TrendingUp },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
              <Icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-bold mb-3">Objectifs SLA</h2>
        <div className="space-y-3">
          {[
            { label: "Réponse initiale", target: "< 2 heures", current: "1h 45min", ok: true },
            { label: "Résolution critique", target: "< 4 heures", current: "3h 20min", ok: true },
            { label: "Résolution standard", target: "< 24 heures", current: "18h", ok: true },
            { label: "Taux résolution 1er contact", target: "> 70%", current: "68%", ok: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Objectif: {item.target}</span>
                <span className={`font-semibold ${item.ok ? "text-green-600" : "text-red-500"}`}>{item.current}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
