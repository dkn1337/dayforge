"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[255px_minmax(0,1fr)]">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <main className="relative min-w-0 px-4 pb-10 pt-5 sm:px-7 sm:pb-12 sm:pt-7 lg:col-start-2 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 app-grid-background opacity-40" />
        <div className="relative mx-auto w-full max-w-[1600px]">
          <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
          {children}
        </div>
      </main>
    </div>
  );
}
