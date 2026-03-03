import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FastDép — Espace Dépanneur",
  description: "Gérez vos commandes, catalogue et paiements",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
