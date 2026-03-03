"use client";
import { MessageSquare } from "lucide-react";

export default function SupportLiveChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat en direct</h1>
        <p className="text-muted-foreground mt-1">Support en temps réel avec les utilisateurs</p>
      </div>
      <div className="rounded-xl border bg-card p-8 flex flex-col items-center justify-center text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="font-semibold text-foreground">Chat en direct</p>
        <p className="text-sm text-muted-foreground mt-1">
          Intégration avec Intercom ou Crisp à configurer dans les paramètres d'intégrations.
        </p>
      </div>
    </div>
  );
}
