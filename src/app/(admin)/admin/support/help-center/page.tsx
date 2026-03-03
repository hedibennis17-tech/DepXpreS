"use client";
import { BookOpen, Plus } from "lucide-react";

const ARTICLES = [
  { title: "Comment passer une commande ?", category: "Clients", views: 245 },
  { title: "Comment devenir chauffeur ?", category: "Chauffeurs", views: 189 },
  { title: "Politique de remboursement", category: "Général", views: 156 },
  { title: "Comment ajouter un dépanneur partenaire ?", category: "Dépanneurs", views: 98 },
];

export default function SupportHelpCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre d'aide</h1>
          <p className="text-muted-foreground mt-1">Articles et FAQ pour les utilisateurs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors">
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>
      <div className="space-y-3">
        {ARTICLES.map((a, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-orange-200 transition-colors cursor-pointer">
            <BookOpen className="h-5 w-5 text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.category} · {a.views} vues</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
