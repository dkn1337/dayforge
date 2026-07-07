"use client";

import { Bell, Command, Menu, Plus, Search, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();
  const { displayName, initials, isCloudConfigured, syncStatus } = useAuth();
  const workspaceLabel = !isCloudConfigured ? "Tryb lokalny" : syncStatus === "synced" ? "Chmura aktywna" : "Synchronizacja";

  return (
    <header className="mb-6 flex items-center justify-between gap-3 sm:mb-7">
      <button
        className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white transition hover:bg-white/[0.08] lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Otwórz menu"
      >
        <Menu className="size-5" />
      </button>

      <label className="relative hidden max-w-[390px] flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490ad]" />
        <input
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-9 pr-20 text-xs text-[#e9ecf8] outline-none transition placeholder:text-[#8490ad] focus:border-[#9479ff]/55 focus:ring-2 focus:ring-[#8066ff]/15"
          placeholder="Szukaj zadań, projektów i nawyków…"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const query = event.currentTarget.value.trim();
              router.push(query ? `/tasks?q=${encodeURIComponent(query)}` : "/tasks");
            }
          }}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[9px] text-[#8995b0] md:flex">
          <Command className="size-3" />K
        </span>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <Button className="hidden md:inline-flex" size="sm" onClick={() => router.push("/tasks?new=1")}>
          <Plus className="size-3.5" />
          Nowe zadanie
        </Button>
        <Button variant="secondary" size="icon" className="size-10" onClick={() => toast("Brak nowych powiadomień.") } aria-label="Powiadomienia">
          <Bell className="size-4" />
        </Button>
        <Button variant="secondary" size="icon" className="hidden size-10 sm:inline-flex" onClick={() => router.push("/settings")} aria-label="Ustawienia">
          <Settings2 className="size-4" />
        </Button>
        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.026] py-1.5 pl-2.5 pr-1.5 text-left transition hover:bg-white/[0.06]" onClick={() => router.push("/settings")}>
          <span className="hidden sm:block">
            <span className="block text-[11px] font-semibold text-[#f3f4ff]">{displayName}</span>
            <span className="mt-0.5 block text-[9px] text-[#8490ae]">{workspaceLabel}</span>
          </span>
          <span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,#f1a365,#d768e8)] text-[10px] font-extrabold text-white">{initials}</span>
        </button>
      </div>
    </header>
  );
}
