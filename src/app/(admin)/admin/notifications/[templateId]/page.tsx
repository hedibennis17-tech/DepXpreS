"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function NotificationTemplatePage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId) return;
    fetch(`/api/admin/notifications/${templateId}`)
      .then(r => r.json())
      .then(d => setTemplate(d.template || d))
      .finally(() => setLoading(false));
  }, [templateId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modèle de notification</h1>
        <p className="text-muted-foreground mt-1">ID: {templateId}</p>
      </div>
      {template ? (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          {Object.entries(template).map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
              <span className="font-medium">{typeof v === "object" ? JSON.stringify(v).slice(0, 60) : String(v ?? "—")}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
          Modèle introuvable
        </div>
      )}
    </div>
  );
}
