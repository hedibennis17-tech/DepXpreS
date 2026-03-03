"use client";
import { useState } from "react";
import { Send, Users, Store, Car, RefreshCw, Check } from "lucide-react";

const AUDIENCES = [
  { value: "all", label: "Tous les utilisateurs", icon: Users },
  { value: "clients", label: "Clients uniquement", icon: Users },
  { value: "drivers", label: "Chauffeurs uniquement", icon: Car },
  { value: "stores", label: "Dépanneurs uniquement", icon: Store },
];

export default function NotificationsComposePage() {
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title || !body) return;
    setSending(true);
    try {
      await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, title, body }),
      });
      setSent(true);
      setTitle(""); setBody("");
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Composer une notification</h1>
        <p className="text-muted-foreground mt-1">Envoyez une notification push à vos utilisateurs</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <Check className="h-4 w-4" /> Notification envoyée avec succès !
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Audience cible</label>
          <div className="grid grid-cols-2 gap-2">
            {AUDIENCES.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${audience === a.value ? "border-orange-400 bg-orange-50 text-orange-700 font-medium" : "border-border hover:border-orange-200"}`}
                >
                  <Icon className="h-4 w-4" /> {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Nouvelle promotion disponible !"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Message *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Rédigez votre message ici..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{body.length}/200 caractères</p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !title || !body}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Envoi en cours..." : "Envoyer la notification"}
        </button>
      </div>
    </div>
  );
}
