"use client";
import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Bell, CheckCircle2, XCircle, Info } from "lucide-react";

interface Alert {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  severity?: string;
  isRead?: boolean;
  createdAt?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "border-red-200 bg-red-50",
  warning:  "border-yellow-200 bg-yellow-50",
  info:     "border-blue-200 bg-blue-50",
  success:  "border-green-200 bg-green-50",
};

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: <XCircle className="h-5 w-5 text-red-500" />,
  warning:  <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info:     <Info className="h-5 w-5 text-blue-500" />,
  success:  <CheckCircle2 className="h-5 w-5 text-green-500" />,
};

export default function DashboardAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard/alerts")
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertes système</h1>
          <p className="text-muted-foreground mt-1">Alertes et notifications importantes de la plateforme</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetch("/api/admin/dashboard/alerts").then(r => r.json()).then(d => setAlerts(d.alerts || [])).finally(() => setLoading(false)); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">Aucune alerte active</p>
          <p className="text-sm mt-1">La plateforme fonctionne normalement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${SEVERITY_COLORS[alert.severity || "info"] || "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {SEVERITY_ICONS[alert.severity || "info"] || <Bell className="h-5 w-5 text-gray-400" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{alert.title || "Alerte"}</p>
                {alert.message && <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>}
                {alert.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleString("fr-CA")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
