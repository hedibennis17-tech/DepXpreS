"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";

interface Message {
  id: string;
  author?: string;
  role?: string;
  content?: string;
  createdAt?: string;
}

export default function TicketThreadPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (!ticketId) return;
    fetch(`/api/admin/support/${ticketId}/thread`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour au ticket
      </button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fil de discussion</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Ticket #{ticketId?.slice(0, 8)}</p>
      </div>
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
            Aucun message dans ce ticket
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${msg.role === "admin" ? "bg-orange-500 text-white" : "bg-card border"}`}>
                <p className={`font-semibold text-xs mb-1 ${msg.role === "admin" ? "text-orange-100" : "text-muted-foreground"}`}>
                  {msg.author || (msg.role === "admin" ? "Admin" : "Client")}
                </p>
                <p>{msg.content || "—"}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Répondre au client..."
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          disabled={!reply}
          className="px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
