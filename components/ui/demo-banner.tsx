"use client";

import { CheckCircle2, CloudOff, LoaderCircle, TriangleAlert } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

export function DemoBanner() {
  const { isCloudConfigured, syncStatus, syncMessage } = useAuth();

  if (!isCloudConfigured) {
    return <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#a98fff]/20 bg-[#8066ff]/10 px-3 py-2 text-xs text-[#c9c0ff]"><CloudOff className="size-3.5 shrink-0" /><span><strong className="font-semibold text-[#e7e4ff]">Tryb lokalny.</strong> Dane są bezpiecznie zapisane na tym komputerze. Podłącz Supabase w Ustawieniach, aby synchronizować je między urządzeniami.</span></div>;
  }

  const status = syncStatus === "synced" ? { icon: CheckCircle2, className: "border-[#42d7a5]/20 bg-[#42d7a5]/10 text-[#b7f1d7]", title: "Chmura zsynchronizowana.", message: "Twoje dane są dostępne także po zalogowaniu na drugim komputerze." }
    : syncStatus === "error" ? { icon: TriangleAlert, className: "border-[#ff718d]/20 bg-[#ff718d]/10 text-[#ffc1cc]", title: "Synchronizacja wymaga uwagi.", message: syncMessage ?? "Sprawdź połączenie internetowe i konfigurację Supabase." }
      : { icon: LoaderCircle, className: "border-[#4e9cff]/20 bg-[#4e9cff]/10 text-[#bcdcff]", title: "Synchronizujemy workspace…", message: "Lokalne zmiany pozostają zapisane i zostaną wysłane, gdy połączenie wróci." };
  const Icon = status.icon;
  return <div className={`mb-5 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${status.className}`}><Icon className={`size-3.5 shrink-0 ${syncStatus === "syncing" ? "animate-spin" : ""}`} /><span><strong className="font-semibold">{status.title}</strong> {status.message}</span></div>;
}
