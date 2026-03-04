"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Star, TrendingUp, TrendingDown, Loader2, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

export default function ClientWalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/client/login"); return; }
      setUser(u);
      try {
        const res = await fetch(`/api/client/wallet?uid=${u.uid}`);
        const data = await res.json();
        setBalance(data.balance || 0);
        setLoyaltyPoints(data.loyalty_points || 0);
        setTransactions(data.transactions || []);
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Portefeuille</h1>

      {/* Balance principale */}
      <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Solde disponible</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 w-fit">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-semibold">{loyaltyPoints} points de fidélité</span>
          </div>
        </CardContent>
      </Card>

      {/* Infos points */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Points de fidélité</p>
              <p className="text-xs text-muted-foreground">1 point = 0,01 $ de rabais</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-600">{loyaltyPoints} pts</p>
              <p className="text-xs text-muted-foreground">= ${(loyaltyPoints * 0.01).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Aucune transaction pour le moment</p>
              <p className="text-xs text-muted-foreground mt-1">Vos transactions apparaîtront ici après votre première commande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={tx.id || i}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                        {tx.type === "credit"
                          ? <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          : <ArrowUpRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
