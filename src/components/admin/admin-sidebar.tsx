
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Box,
  Users,
  Car,
  Store,
  MapPin,
  Network,
  CreditCard,
  Tag,
  Bell,
  MessageSquare,
  BarChart2,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Search,
} from "lucide-react";
import { Logo } from "../logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    basePath: "/admin/dashboard",
    subItems: [
      { label: "Vue générale", href: "/admin/dashboard" },
      { label: "Activité en direct", href: "/admin/dashboard/live" },
      { label: "Carte opérationnelle", href: "/admin/dashboard/map" },
      { label: "Alertes système", href: "/admin/dashboard/alerts" },
    ],
  },
  {
    title: "Commandes",
    icon: Box,
    basePath: "/admin/orders",
    subItems: [
      { label: "Toutes les commandes", href: "/admin/orders" },
      { label: "Nouvelles", href: "/admin/orders/pending" },
      { label: "En préparation", href: "/admin/orders/preparing" },
      { label: "En livraison", href: "/admin/orders/delivering" },
      { label: "Terminées", href: "/admin/orders/completed" },
      { label: "Annulées", href: "/admin/orders/cancelled" },
      { label: "Litiges", href: "/admin/orders/disputes" },
    ],
  },
  {
    title: "Clients",
    icon: Users,
    basePath: "/admin/clients",
    subItems: [
      { label: "Tous les clients", href: "/admin/clients" },
      { label: "Actifs", href: "/admin/clients/active" },
      { label: "Bloqués", href: "/admin/clients/blocked" },
      { label: "Wallets", href: "/admin/clients/wallets" },
      { label: "Notes & support", href: "/admin/clients/notes" },
    ],
  },
  {
    title: "Chauffeurs",
    icon: Car,
    basePath: "/admin/drivers",
    subItems: [
        { label: "Tous les chauffeurs", href: "/admin/drivers" },
        { label: "Candidatures", href: "/admin/drivers/applications" },
        { label: "Actifs", href: "/admin/drivers/active" },
        { label: "En ligne / hors ligne", href: "/admin/drivers/online" },
        { label: "Vérification documents", href: "/admin/drivers/documents" },
        { label: "Véhicules", href: "/admin/drivers/vehicles" },
        { label: "Gains", href: "/admin/drivers/earnings" },
        { label: "Retraits", href: "/admin/drivers/payouts" },
    ]
  },
  {
    title: "Stores",
    icon: Store,
    basePath: "/admin/stores",
    subItems: [
        { label: "Tous les stores", href: "/admin/stores" },
        { label: "Actifs", href: "/admin/stores/active" },
        { label: "Horaires", href: "/admin/stores/schedules" },
        { label: "Catalogue global", href: "/admin/stores/catalog" },
        { label: "📦 Import Catalogue", href: "/admin/catalogue/import" },
        { label: "Stock & visibilité", href: "/admin/stores/stock" },
        { label: "Tarification", href: "/admin/stores/pricing" },
        { label: "Performance", href: "/admin/stores/performance" },
    ]
  },
  {
    title: "Zones",
    icon: MapPin,
    basePath: "/admin/zones",
    subItems: [
        { label: "Toutes les zones", href: "/admin/zones" },
        { label: "Actives", href: "/admin/zones/active" },
        { label: "Couverture GPS", href: "/admin/zones/coverage" },
        { label: "Tarification", href: "/admin/zones/pricing" },
        { label: "Dépanneur principal", href: "/admin/zones/stores" },
        { label: "Chauffeurs par zone", href: "/admin/zones/drivers" },
    ]
  },
  {
    title: "Dispatch",
    icon: Network,
    basePath: "/admin/dispatch",
    subItems: [
        { label: "File dispatch", href: "/admin/dispatch/queue" },
        { label: "Assignation auto", href: "/admin/dispatch/auto" },
        { label: "Assignation manuelle", href: "/admin/dispatch/manual" },
        { label: "Non assignées", href: "/admin/dispatch/unassigned" },
        { label: "Réassignations", href: "/admin/dispatch/reassignments" },
        { label: "Historique", href: "/admin/dispatch/history" },
        { label: "Carte live", href: "/admin/dispatch/live-map" },
        { label: "🔴 Suivi Live", href: "/admin/dispatch/live" },
    ]
  },
  {
    title: "Transactions",
    icon: CreditCard,
    basePath: "/admin/transactions",
    subItems: [
        { label: "Toutes", href: "/admin/transactions" },
        { label: "Paiements Stripe", href: "/admin/transactions/payments" },
        { label: "Remboursements", href: "/admin/transactions/refunds" },
        { label: "Wallets", href: "/admin/transactions/wallets" },
        { label: "Retraits chauffeurs", href: "/admin/transactions/payouts" },
        { label: "Frais plateforme", href: "/admin/transactions/fees" },
        { label: "Litiges paiement", href: "/admin/transactions/disputes" },
    ]
  },
  {
    title: "Promotions",
    icon: Tag,
    basePath: "/admin/promotions",
    subItems: [
        { label: "Toutes", href: "/admin/promotions" },
        { label: "Codes promo", href: "/admin/promotions/coupons" },
        { label: "Parrainage", href: "/admin/promotions/referrals" },
        { label: "Réductions zone", href: "/admin/promotions/zone-discounts" },
        { label: "Promotions produits", href: "/admin/promotions/product-promos" },
        { label: "Promotions store", href: "/admin/promotions/store-promos" },
        { label: "Utilisations", href: "/admin/promotions/usage" },
        { label: "Campagnes", href: "/admin/promotions/campaigns" },
    ]
  },
  {
    title: "Notifications",
    icon: Bell,
    basePath: "/admin/notifications",
    subItems: [
        { label: "Toutes", href: "/admin/notifications" },
        { label: "Push", href: "/admin/notifications/push"},
        { label: "SMS", href: "/admin/notifications/sms"},
        { label: "Email", href: "/admin/notifications/email"},
        { label: "Templates", href: "/admin/notifications/templates" },
        { label: "Système", href: "/admin/notifications/system" },
        { label: "Historique", href: "/admin/notifications/history" },
    ]
  },
  {
    title: "Support",
    icon: MessageSquare,
    basePath: "/admin/support",
    subItems: [
        { label: "Tous les tickets", href: "/admin/support" },
        { label: "Clients", href: "/admin/support/clients" },
        { label: "Chauffeurs", href: "/admin/support/drivers" },
        { label: "Dépanneurs", href: "/admin/support/stores" },
        { label: "Litiges", href: "/admin/support/disputes" },
        { label: "Chat support", href: "/admin/support/live-chat" },
        { label: "SLA", href: "/admin/support/sla" },
        { label: "Centre d'aide", href: "/admin/support/help-center" },
    ]
  },
  {
    title: "Rapports",
    icon: BarChart2,
    basePath: "/admin/reports",
    subItems: [
        { label: "Ventes", href: "/admin/reports/sales" },
        { label: "Commandes", href: "/admin/reports/orders" },
        { label: "Clients", href: "/admin/reports/clients" },
        { label: "Chauffeurs", href: "/admin/reports/drivers" },
        { label: "Dépanneurs", href: "/admin/reports/stores" },
        { label: "Zones", href: "/admin/reports/zones" },
        { label: "Produits", href: "/admin/reports/products" },
        { label: "Finances", href: "/admin/reports/finance" },
        { label: "Export", href: "/admin/reports/exports" },
    ]
  },
  {
    title: "Paramètres",
    icon: Settings,
    basePath: "/admin/settings",
    subItems: [
        { label: "Général", href: "/admin/settings/general" },
        { label: "Branding", href: "/admin/settings/branding" },
        { label: "Langues", href: "/admin/settings/languages" },
        { label: "Paiements", href: "/admin/settings/payments" },
        { label: "OTP / Auth", href: "/admin/settings/auth" },
        { label: "Cartes / GPS", href: "/admin/settings/maps" },
        { label: "Taxes", href: "/admin/settings/taxes" },
        { label: "Livraison", href: "/admin/settings/delivery" },
        { label: "Chauffeurs", href: "/admin/settings/drivers" },
        { label: "Dépanneurs", href: "/admin/settings/stores" },
        { label: "Notifications", href: "/admin/settings/notifications" },
        { label: "Intégrations", href: "/admin/settings/integrations" },
        { label: "Logs système", href: "/admin/settings/logs" },
    ]
  },
  {
    title: "Permissions",
    icon: Shield,
    basePath: "/admin/permissions",
    subItems: [
        { label: "Rôles", href: "/admin/permissions/roles" },
        { label: "Utilisateurs admin", href: "/admin/permissions/admins" },
        { label: "Matrice permissions", href: "/admin/permissions/matrix" },
        { label: "Journal d'audit", href: "/admin/permissions/audit" },
    ]
  },
];

const SidebarCollapsibleItem = ({
  item,
  pathname,
}: {
  item: (typeof menuItems)[0];
  pathname: string;
}) => {
  const isParentActive = pathname.startsWith(item.basePath);

  const defaultOpen = isParentActive;

  let primaryActionHref = item.subItems[0]?.href || item.basePath;


  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            asChild
            variant="default"
            className="w-full justify-start"
            isActive={isParentActive && !item.subItems.some(sub => sub.href === pathname && sub.href !== primaryActionHref)}
          >
            <Link href={primaryActionHref}>
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]:rotate-90" />
            </Link>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <Link href={subItem.href}>
                  <SidebarMenuSubButton
                    isActive={pathname === subItem.href}
                    className="w-full justify-start"
                  >
                    {subItem.label}
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};


export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/login", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_role");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    // nettoyage défensif pour vieux cookies hérités
    document.cookie = "admin_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = "admin_session_mw=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = "admin_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="items-center justify-center text-center p-4">
        <Logo className="h-10 w-10" />
        <div className="group-data-[collapsible=icon]:hidden">
          <h2 className="text-lg font-semibold tracking-tight text-sidebar-primary-foreground">FastDép</h2>
          <p className="text-xs text-sidebar-foreground/70">Admin Panel</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="default"
              className="w-full justify-start"
              isActive={pathname === "/admin/search"}
            >
              <Link href="/admin/search">
                <Search />
                <span>Recherche</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {menuItems.map((item) => (
            <SidebarCollapsibleItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 transition-all">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/hedi/200/200" data-ai-hint="man face" />
            <AvatarFallback>HB</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground">Hedi Bennis</p>
            <p className="text-xs text-sidebar-foreground/70">Super Admin</p>
          </div>
          <Button
            variant="default"
            size="icon"
            className="group-data-[collapsible=icon]:hidden"
            onClick={handleLogout}
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
