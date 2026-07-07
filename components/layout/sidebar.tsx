"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleHelp,
  Crown,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Settings,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

const mainNavigation = [
  { href: "/today", label: "Dzisiaj", icon: LayoutDashboard },
  { href: "/planner", label: "Planer", icon: CalendarDays },
  { href: "/tasks", label: "Zadania", icon: ListTodo },
  { href: "/projects", label: "Projekty", icon: FolderKanban },
  { href: "/habits", label: "Nawyki", icon: Sparkles },
  { href: "/focus", label: "Skupienie", icon: TimerReset },
  { href: "/analytics", label: "Analityka", icon: BarChart3 },
];

const accountNavigation = [
  { href: "/settings", label: "Ustawienia", icon: Settings },
  { href: "/help", label: "Pomoc i wsparcie", icon: CircleHelp, disabled: true },
];

type NavigationItem = (typeof mainNavigation)[number] | (typeof accountNavigation)[number];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { displayName, initials, isCloudConfigured, syncStatus } = useAuth();
  const workspaceSubtitle = !isCloudConfigured ? "Plan lokalny" : syncStatus === "synced" ? "Chmura zsynchronizowana" : "Trwa synchronizacja";

  const navigationLink = (item: NavigationItem) => {
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      key={`${item.href}-${item.label}`}
      href={item.href}
      onClick={onClose}
      className={cn(
        "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[linear-gradient(90deg,rgba(128,102,255,.28),rgba(78,156,255,.08))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
          : "text-[#aeb8d0] hover:bg-white/[0.045] hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "size-[18px]",
          isActive ? "text-[#c0afff]" : "text-[#a58cff]",
        )}
        strokeWidth={1.8}
      />
      <span>{item.label}</span>
    </Link>
  );
};

  return (
    <>
      <button
        aria-label="Zamknij menu"
        className={cn("fixed inset-0 z-30 bg-[#03050c]/65 backdrop-blur-sm lg:hidden", mobileOpen ? "block" : "hidden")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(11,14,27,.98),rgba(9,12,23,.96))] px-3.5 py-5 shadow-[30px_0_60px_rgba(0,0,0,.24)] transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-[105%]",
        )}
      >
        <div className="mb-7 flex items-center justify-between px-2">
          <Link className="flex items-center gap-2.5" href="/today" onClick={onClose}>
            <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#a177ff,#4e9cff)] text-base font-black text-white shadow-[0_10px_25px_rgba(105,80,255,.3)]">
              D
            </span>
            <span className="text-xl font-extrabold tracking-[-0.07em] text-white">
              Day<span className="text-[#a78aff]">Forge</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 text-[#aeb8d0] hover:bg-white/5 hover:text-white lg:hidden" onClick={onClose} aria-label="Zamknij menu">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#f1f3ff]">Przestrzeń {displayName}</p>
            <p className="mt-0.5 text-[10px] text-[#7e89a5]">{workspaceSubtitle}</p>
          </div>
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#ff9b70,#dd5ee0)] text-[10px] font-extrabold text-white">{initials}</span>
        </div>

        <p className="mb-2 mt-4 px-2.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#65708e]">Przestrzeń</p>
        <nav className="grid gap-1" aria-label="Główna nawigacja">
          {mainNavigation.map(navigationLink)}
        </nav>

        <p className="mb-2 mt-6 px-2.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#65708e]">Konto</p>
        <nav className="grid gap-1" aria-label="Nawigacja konta">
          {accountNavigation.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <button
                  className="flex h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[#aeb8d0] transition hover:bg-white/[0.045] hover:text-white"
                  key={item.label}
                  onClick={() => toast.info("Centrum pomocy zostanie dodane w kolejnej fazie.")}
                >
                  <Icon className="size-[18px] text-[#a58cff]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            }
            return navigationLink(item);
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-[#9479ff]/25 bg-[linear-gradient(145deg,rgba(132,103,255,.16),rgba(40,53,109,.11))] p-4">
          <Crown className="mb-3 size-4 text-[#c7bcff]" />
          <h2 className="text-sm font-semibold tracking-[-0.03em] text-white">Odblokuj swoje najlepsze dni.</h2>
          <p className="mt-2 text-[11px] leading-[1.55] text-[#adb6cc]">Nielimitowane projekty, pogłębiona analityka i inteligentne sesje focus.</p>
          <Button className="mt-3 w-full" size="sm" onClick={() => toast.info("Moduł Pro pojawi się po stabilnym core produktu.") }>
            Przejdź na Pro
          </Button>
        </div>
      </aside>
    </>
  );
}
