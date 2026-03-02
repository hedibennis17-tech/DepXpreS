'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { orderId } = useParams() as { orderId: string };
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = () => {
    fetch(`/api/admin/orders/${orderId}/messages`).then(r => r.json()).then(d => setMessages(d.messages || [])).finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, [orderId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    await fetch(`/api/admin/orders/${orderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMsg, senderType: 'admin', senderName: 'Admin' }),
    });
    setNewMsg('');
    loadMessages();
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages de la commande</h1>
        <p className="text-muted-foreground mt-1">Conversation client ↔ chauffeur ↔ admin</p>
      </div>
      <div className="rounded-xl border bg-card flex flex-col" style={{height: '500px'}}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucun message pour cette commande.</p>
          ) : messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${msg.senderType === 'admin' ? 'bg-orange-500 text-white' : msg.senderType === 'driver' ? 'bg-blue-100 text-blue-900' : 'bg-muted text-foreground'}`}>
                <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">{msg.createdAt ? new Date(msg.createdAt._seconds ? msg.createdAt._seconds * 1000 : msg.createdAt).toLocaleTimeString('fr-CA') : ''}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Écrire un message admin..." className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={sendMessage} disabled={sending} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
