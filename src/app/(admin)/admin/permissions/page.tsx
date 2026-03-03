import Link from "next/link";
import { Shield, Users, LayoutGrid, FileText, ChevronRight } from "lucide-react";

const SECTIONS = [
  { href: "/admin/permissions/roles", icon: Shield, title: "Rôles", description: "Gérer les rôles administrateurs (super_admin, manager, support...)", color: "bg-purple-50 text-purple-600" },
  { href: "/admin/permissions/admins", icon: Users, title: "Administrateurs", description: "Liste des comptes admin et leurs rôles assignés", color: "bg-blue-50 text-blue-600" },
  { href: "/admin/permissions/matrix", icon: LayoutGrid, title: "Matrice des droits", description: "Tableau des permissions par rôle et module", color: "bg-green-50 text-green-600" },
  { href: "/admin/permissions/audit", icon: FileText, title: "Journal d'audit", description: "Historique des actions administratives", color: "bg-orange-50 text-orange-600" },
];

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions & Accès</h1>
        <p className="text-muted-foreground mt-1">Gérez les rôles, droits et accès des administrateurs de la plateforme.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:"Rôles définis",value:"5",color:"text-purple-600"},{label:"Admins actifs",value:"3",color:"text-blue-600"},{label:"Modules protégés",value:"12",color:"text-green-600"},{label:"Actions aujourd'hui",value:"—",color:"text-orange-600"}].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:border-orange-300 hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}><Icon className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{section.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
