"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Star, ShoppingBag, Wallet, Loader2, CheckCircle2, Edit2, Save } from "lucide-react";
import Link from "next/link";

interface ClientProfile {
  display_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  default_address?: string;
  total_orders?: number;
  total_spent?: number;
  loyalty_points?: number;
  walletBalance?: number;
  status?: string;
  email?: string;
  photoURL?: string;
  createdAt?: string;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<ClientProfile>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ displayName: "", phone: "", defaultAddress: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/client/login"); return; }
      setUser(u);
      setForm({ displayName: u.displayName || "", phone: "", defaultAddress: "" });
      try {
        const res = await fetch(`/api/client/profile?uid=${u.uid}`);
        const data = await res.json();
        setProfile(data);
        setForm({
          displayName: u.displayName || data.display_name || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "",
          phone: data.phone || "",
          defaultAddress: data.default_address || "",
        });
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: form.displayName });
      await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          display_name: form.displayName,
          firstName: form.displayName.split(" ")[0] || "",
          lastName: form.displayName.split(" ").slice(1).join(" ") || "",
          phone: form.phone,
          default_address: form.defaultAddress,
          email: user.email,
          photoURL: user.photoURL,
          updatedAt: new Date().toISOString(),
        }),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.displayName || profile.display_name || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Client";

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        {saved && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Sauvegardé
          </Badge>
        )}
      </div>

      {/* Avatar + nom */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
              <AvatarFallback className="text-2xl bg-orange-100 text-orange-700">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {profile.status === "active" ? "Compte actif" : "Client"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="gap-1">
              <Edit2 className="h-3 w-3" />
              {editing ? "Annuler" : "Modifier"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ShoppingBag, label: "Commandes", value: profile.total_orders || 0, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Wallet, label: "Portefeuille", value: `$${(profile.walletBalance || 0).toFixed(2)}`, color: "text-green-600", bg: "bg-green-50" },
          { icon: Star, label: "Points", value: profile.loyalty_points || 0, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s) => (
          <Card key={s.label} className={`border-0 ${s.bg}`}>
            <CardContent className="pt-4 pb-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Infos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <Label>Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Prénom Nom" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="514-555-0000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Adresse par défaut</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={form.defaultAddress} onChange={(e) => setForm({ ...form, defaultAddress: e.target.value })} placeholder="123 rue Principale, Montréal" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde...</> : <><Save className="h-4 w-4 mr-2" />Sauvegarder</>}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              {[
                { icon: User, label: "Nom", value: displayName },
                { icon: Mail, label: "Email", value: user?.email || "" },
                { icon: Phone, label: "Téléphone", value: profile.phone || "Non renseigné" },
                { icon: MapPin, label: "Adresse", value: profile.default_address || "Non renseignée" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/client/orders">Mes commandes</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/client/wallet">Portefeuille</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/client/settings">Paramètres</Link>
        </Button>
      </div>
    </div>
  );
}
