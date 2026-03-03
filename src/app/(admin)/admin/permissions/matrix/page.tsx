import { LayoutGrid, Check, X } from "lucide-react";

const MODULES = ["Commandes", "Clients", "Chauffeurs", "Dépanneurs", "Zones", "Transactions", "Rapports", "Paramètres", "Permissions"];
const ROLES = [
  { name: "Super Admin", perms: [true, true, true, true, true, true, true, true, true] },
  { name: "Admin", perms: [true, true, true, true, true, true, true, false, false] },
  { name: "Manager", perms: [true, true, true, true, false, false, true, false, false] },
  { name: "Support", perms: [true, true, false, false, false, false, false, false, false] },
  { name: "Lecteur", perms: [false, false, false, false, false, false, true, false, false] },
];

export default function PermissionsMatrixPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matrice des permissions</h1>
        <p className="text-muted-foreground mt-1">Tableau des droits d'accès par rôle et module.</p>
      </div>
      <div className="rounded-xl border bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground sticky left-0 bg-muted/50">Module</th>
              {ROLES.map(r => <th key={r.name} className="px-4 py-3 font-semibold text-muted-foreground text-center">{r.name}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {MODULES.map((mod, mi) => (
              <tr key={mod} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium sticky left-0 bg-card">{mod}</td>
                {ROLES.map(role => (
                  <td key={role.name} className="px-4 py-3 text-center">
                    {role.perms[mi]
                      ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                      : <X className="h-4 w-4 text-red-300 mx-auto" />
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
