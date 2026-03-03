import { Users, Shield, Mail, MoreVertical } from "lucide-react";

const ADMINS = [
  { name: "Hedi Bennis", email: "hedi@fastdep.ca", role: "super_admin", roleLabel: "Super Admin", color: "bg-red-100 text-red-800", lastLogin: "Aujourd'hui" },
  { name: "Admin 2", email: "admin2@fastdep.ca", role: "admin", roleLabel: "Admin", color: "bg-purple-100 text-purple-800", lastLogin: "Hier" },
  { name: "Support 1", email: "support@fastdep.ca", role: "support", roleLabel: "Support", color: "bg-green-100 text-green-800", lastLogin: "Il y a 3 jours" },
];

export default function PermissionsAdminsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrateurs</h1>
          <p className="text-muted-foreground mt-1">Liste des comptes administrateurs et leurs rôles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors">
          <Users className="h-4 w-4" /> Inviter un admin
        </button>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Rôle</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Dernière connexion</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ADMINS.map(admin => (
              <tr key={admin.email} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">{admin.name[0]}</span>
                    </div>
                    <span className="font-medium text-sm">{admin.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.color}`}>{admin.roleLabel}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{admin.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
