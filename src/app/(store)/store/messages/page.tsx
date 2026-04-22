"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Send, Loader2, MessageCircle, ShieldCheck } from "lucide-react";

interface Message {
  id: string; text: string;
  senderRole: "admin" | "store";
  senderName: string; createdAt: string;
}

export default function StoreMessages() {
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setLoading(false); return; }
      try {
        const d = await getDoc(doc(db, "app_users", u.uid));
        const sid = d.exists() ? (d.data().storeId || u.uid) : u.uid;
        const sname = d.exists() ? (d.data().storeName || "Commerce") : "Commerce";
        setStoreId(sid);
        setStoreName(sname);

        // Écouter messages temps réel
        const q = query(
          collection(db, "store_conversations", sid, "messages"),
          orderBy("createdAt", "asc")
        );
        const unsubMsg = onSnapshot(q, snap => {
          setMessages(snap.docs.map(d => ({
            id: d.id, ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Message)));
          setLoading(false);
        });
        return () => unsubMsg();
      } catch { setLoading(false); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !storeId || sending) return;
    setSending(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await fetch("/api/messages-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeId,
          text: text.trim(),
          senderName: storeName,
        }),
      });
      setText("");
    } catch(e) { console.error(e); }
    finally { setSending(false); }
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-t-2xl px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
          <ShieldCheck className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">FastDép Support Admin</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] text-gray-400">Équipe administrative</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0f0f0f] border-x border-white/5">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <MessageCircle className="h-12 w-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm font-medium">Aucun message</p>
            <p className="text-gray-600 text-xs mt-1">Contactez l&apos;équipe FastDép ici</p>
          </div>
        ) : messages.map(msg => {
          const isMe = msg.senderRole === "store";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1 border border-orange-500/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMe ? "bg-orange-500 text-white rounded-br-sm" : "bg-[#1a1a1a] text-white border border-white/5 rounded-bl-sm"
              }`}>
                {!isMe && <p className="text-[10px] text-orange-400 font-bold mb-1">{msg.senderName}</p>}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-orange-200" : "text-gray-500"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("fr-CA", { hour:"2-digit", minute:"2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-[#111] border border-white/5 border-t-0 rounded-b-2xl px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Écrire un message à l'admin..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
          <button onClick={sendMessage} disabled={!text.trim() || sending}
            className="w-10 h-10 bg-orange-500 hover:bg-orange-400 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
