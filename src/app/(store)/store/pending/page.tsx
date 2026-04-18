"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, Mail } from "lucide-react";

export default function StorePendingPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth).catch(() => {});
    await fetch("/api/auth/store/login", { method: "DELETE", credentials: "include" });
    localStorage.clear();
    router.push("/store-login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
      <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
        <Clock className="h-12 w-12 text-yellow-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Compte en attente d&apos;approbation</h1>
      <p className="text-gray-500 max-w-md mb-2">
        Votre demande d&apos;inscription a bien été reçue. Notre équipe va valider votre commerce sous peu.
      </p>
      <p className="text-gray-400 text-sm mb-8">
        Vous recevrez une notification dès que votre compte sera approuvé.
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 max-w-sm w-full mb-6">
        <div className="flex items-center gap-2 text-orange-700 font-medium mb-1">
          <Mail className="h-4 w-4" /> Une question ?
        </div>
        <p className="text-orange-600 text-sm">
          Contactez-nous à{" "}
          <a href="mailto:support@fastdep.ca" className="underline font-medium">
            support@fastdep.ca
          </a>
        </p>
      </div>

      <Button variant="outline" onClick={handleLogout} className="gap-2 text-gray-500">
        <LogOut className="h-4 w-4" /> Se déconnecter
      </Button>
    </div>
  );
}
