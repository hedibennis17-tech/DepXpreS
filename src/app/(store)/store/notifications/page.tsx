"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, ShoppingBag, DollarSign, AlertCircle, Info, RefreshCw, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  orderId?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  new_order:    <ShoppingBag className="h-4 w-4 text-orange-500" />,
  payment:      <DollarSign className="h-4 w-4 text-green-500" />,
  alert:        <AlertCircle className="h-4 w-4 text-red-500" />,
  info:         <Info className="h-4 w-4 text-blue-500" />,
};

export default function StoreNotificationsPage() {
  const [storeId, setStoreId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = localStorage.getItem("storeId") || "";
    setStoreId(sid);
  }, []);

  useEffect(() => {
    if (!storeId) return;

    const q = query(
      collection(db, "notifications"),
      where("storeId", "==", storeId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
      })) as Notification[]);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [storeId]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n =>
      updateDoc(doc(db, "notifications", n.id), { isRead: true })
    ));
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { isRead: true });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Tout est lu"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-700"
          >
            <CheckCheck className="h-4 w-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Aucune notification</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                "flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors",
                i < notifications.length - 1 && "border-b",
                !n.isRead ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"
              )}
            >
              {/* Icône */}
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                !n.isRead ? "bg-orange-100" : "bg-gray-100"
              )}>
                {TYPE_ICONS[n.type || "info"] || <Bell className="h-4 w-4 text-gray-400" />}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm", !n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
                    {n.title || "Notification"}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  )}
                </div>
                {n.body && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString("fr-CA", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                  }) : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
