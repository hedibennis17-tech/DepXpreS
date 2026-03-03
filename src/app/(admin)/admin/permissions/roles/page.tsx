import { Shield, Users, Edit2, Trash2 } from "lucide-react";

const ROLES = [
  { name: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-800", desc: "Accès complet à toutes les fonctionnalités", count: 1 },
  { name: "admin", label: "Admin", color: "bg-purple-100 text-purple-800", desc: "Gestion des opérations quotidiennes", count: 2 },
  { name: "manager", label: "Manager", color: "bg-blue-100 text-blue-800", desc: "Supervision des commandes et chauffeurs", count: 3 },
  { name: "support", label: "Support", color: "bg-green-100 text-green-800", desc: "Gestion des tickets et litiges", count: 2 },
  { name: "viewer", label: "Lecteur", color: "bg-gray-100 text-gray-700", desc: "Accès lecture seule aux rapports", count: 1 },
];

export default function PermissionsRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rôles</h1>
          <p className="text-muted-foreground mt-1">Définissez les rôles et leurs permissions dans la plateforme.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors">
          <Shield className="h-4 w-4" /> Nouveau rôle
        </button>
      </div>
      <div className="space-y-3">
        {ROLES.map(role => (
          <div key={role.name} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-orange-200 transition-colors">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${role.color}`}>{role.label}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{role.desc}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{role.count} utilisateur(s) avec ce rôle</p>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
