"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { User, Mail, Shield, Edit2, Check, X, RefreshCw } from "lucide-react";

export default function AdminProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ name: u.displayName || "Admin", email: u.email || "", role: "super_admin" });
        setName(u.displayName || "Admin");
      }
    });
    return () => unsub();
  }, []);

  const saveName = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser(u => u ? { ...u, name } : u);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground mt-1">Informations de votre compte administrateur</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <Check className="h-4 w-4" /> Profil mis à jour avec succès !
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-orange-600">{user.name[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Super Admin</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Nom affiché</label>
            {editing ? (
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button onClick={saveName} disabled={saving} className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600">
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg border text-sm hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm py-2 border-t">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm py-2 border-t">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Rôle : Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
