"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, Shield, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ClientSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifDriver, setNotifDriver] = useState(true);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/client/login"); return; }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setPwdLoading(true);
    setPwdMsg("");
    setPwdError("");
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPwd);
      setPwdMsg("Mot de passe modifié avec succès !");
      setCurrentPwd("");
      setNewPwd("");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password") setPwdError("Mot de passe actuel incorrect.");
      else if (code === "auth/weak-password") setPwdError("Le nouveau mot de passe doit avoir au moins 6 caractères.");
      else setPwdError("Erreur lors du changement de mot de passe.");
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Statut de commande", desc: "Mises à jour en temps réel", value: notifOrder, set: setNotifOrder },
            { label: "Promotions & offres", desc: "Codes promo et réductions", value: notifPromo, set: setNotifPromo },
            { label: "Position du chauffeur", desc: "Suivi en temps réel", value: notifDriver, set: setNotifDriver },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch checked={n.value} onCheckedChange={n.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" /> Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.providerData?.[0]?.providerId === "password" ? (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Mot de passe actuel</Label>
                <Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={6} />
              </div>
              {pwdMsg && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{pwdMsg}</p>}
              {pwdError && <p className="text-sm text-red-600">{pwdError}</p>}
              <Button type="submit" disabled={pwdLoading} className="w-full">
                {pwdLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Modification...</> : "Changer le mot de passe"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Vous utilisez la connexion Google. La gestion du mot de passe se fait via votre compte Google.</p>
          )}
        </CardContent>
      </Card>

      {/* Langue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Langue & Région
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Langue</p>
              <p className="text-xs text-muted-foreground">Français (Canada)</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Compte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Mon Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            {user?.emailVerified && <span className="text-xs text-green-600 font-medium">Vérifié</span>}
          </div>
          <Separator />
          <Button variant="outline" asChild className="w-full">
            <Link href="/client/profile">Modifier le profil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
