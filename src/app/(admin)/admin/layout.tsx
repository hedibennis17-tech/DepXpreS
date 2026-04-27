"use client";
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {/* ── HEADER MOBILE avec bouton hamburger ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-30 md:hidden">
          <SidebarTrigger className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="h-5 w-5 text-gray-600" />
          </SidebarTrigger>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="font-bold text-sm text-gray-900">FastDép Admin</span>
          </div>
        </div>
        {/* ── CONTENU ── */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
