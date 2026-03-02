'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { ticketId } = useParams() as { ticketId: string };
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/admin/support/${ticketId}`).then(r => r.json()),
      fetch(`/api/admin/support/${ticketId}/messages`).then(r => r.json()),
    ]).then(([td, md]) => {
      setTicket(td.ticket);
      setMessages(md.messages || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { if (ticketId) load(); }, [ticketId]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await fetch(`/api/admin/support/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: reply, senderType: 'admin', senderName: 'Admin DepXpreS' }),
    });
    setReply('');
    load();
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ticket #{ticketId?.slice(0, 8)}</h1>
        <p className="text-muted-foreground mt-1">{ticket?.subject}</p>
      </div>
      {ticket && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Statut', value: ticket.status },
            { label: 'Priorité', value: ticket.priority },
            { label: 'Catégorie', value: ticket.category?.replace(/_/g, ' ') },
            { label: 'Type utilisateur', value: ticket.userType },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border bg-card flex flex-col" style={{height: '400px'}}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun message dans ce ticket.</p>
          ) : messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${msg.senderType === 'admin' ? 'bg-orange-500 text-white' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex gap-2">
          <input type="text" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="Répondre au ticket..." className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={sendReply} disabled={sending} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
