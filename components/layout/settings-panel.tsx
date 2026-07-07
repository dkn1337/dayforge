"use client";

import { CheckCircle2, Cloud, CloudOff, Download, FileUp, Globe2, LogIn, LogOut, Palette, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseSetupHint } from "@/lib/supabase/config";

export function SettingsPanel() {
  const { displayName, isCloudConfigured, syncMessage, syncStatus, updateDisplayName, signOut, user } = useAuth();
  const { exportLocalBackup, importLocalBackup, resetLocalData } = useDayForgeStore();
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveName = async () => {
    setSaving(true);
    const result = await updateDisplayName(name);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success("Nazwa profilu została zapisana.");
  };

  const exportData = () => {
    const backup = exportLocalBackup();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dayforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Backup został pobrany.");
  };

  const importData = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      const result = importLocalBackup(raw);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    };
    reader.onerror = () => toast.error("Nie udało się odczytać pliku backupu.");
    reader.readAsText(file);
  };

  const statusText = !isCloudConfigured ? "Tryb lokalny" : syncStatus === "synced" ? "Chmura zsynchronizowana" : syncStatus === "error" ? "Błąd synchronizacji" : "Synchronizacja";
  const StatusIcon = !isCloudConfigured ? CloudOff : syncStatus === "synced" ? CheckCircle2 : Cloud;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2 text-[11px] font-medium text-[#9da8c0]"><span>Wyświetlana nazwa</span><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490ad]" /><input className="h-10 w-full rounded-xl border border-white/10 bg-[#0e1427] pl-10 pr-3 text-sm text-white outline-none focus:border-[#9479ff]/60" minLength={2} value={name} onChange={(event) => setName(event.target.value)} /></div></label>
            <Button disabled={saving || name.trim() === displayName} onClick={saveName}>{saving ? "Zapisywanie…" : "Zapisz profil"}</Button>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[#8e99b4]">W trybie lokalnym nazwa zostaje na tym komputerze. Po włączeniu chmury zapisujemy ją w profilu Supabase.</p>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dane i backup</CardTitle></CardHeader>
          <div className="grid gap-2.5 sm:grid-cols-2"><Button variant="secondary" onClick={exportData}><Download className="size-4" />Pobierz backup JSON</Button><Button variant="secondary" onClick={() => fileInputRef.current?.click()}><FileUp className="size-4" />Przywróć backup</Button></div>
          <input accept="application/json,.json" className="hidden" ref={fileInputRef} type="file" onChange={(event) => importData(event.target.files?.[0])} />
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3"><p className="flex items-center gap-2 text-xs font-semibold text-white"><ShieldCheck className="size-4 text-[#70edbd]" />Twoje dane pozostają pod kontrolą</p><p className="mt-1.5 text-[11px] leading-5 text-[#96a2bf]">Backup obejmuje projekty, zadania, planner, nawyki, historię focus i aktywny timer. Możesz go przywrócić na drugim komputerze także bez chmury.</p></div>
          {!confirmReset ? <Button className="mt-4" variant="danger" onClick={() => setConfirmReset(true)}><RotateCcw className="size-4" />Przywróć dane demonstracyjne</Button> : <div className="mt-4 rounded-xl border border-[#ff718d]/25 bg-[#ff718d]/10 p-3"><p className="text-xs font-semibold text-[#ffd0d8]">Ta operacja nadpisze aktualne dane lokalne.</p><div className="mt-3 flex gap-2"><Button size="sm" variant="danger" onClick={() => { resetLocalData(); setConfirmReset(false); toast.success("Przywrócono dane demonstracyjne."); }}>Potwierdzam reset</Button><Button size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>Anuluj</Button></div></div>}
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>DayForge Cloud</CardTitle></CardHeader>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="flex items-start gap-3"><span className={`grid size-9 place-items-center rounded-lg ${!isCloudConfigured ? "bg-[#8066ff]/13 text-[#c3b4ff]" : syncStatus === "synced" ? "bg-[#42d7a5]/13 text-[#70edbd]" : "bg-[#4e9cff]/13 text-[#88c0ff]"}`}><StatusIcon className={`size-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} /></span><span className="min-w-0"><strong className="block text-xs text-white">{statusText}</strong><span className="mt-1 block text-[11px] leading-5 text-[#95a1bc]">{!isCloudConfigured ? getSupabaseSetupHint() : syncStatus === "error" ? syncMessage ?? "Sprawdź połączenie i polityki RLS." : user ? `Zalogowano jako ${user.email ?? displayName}.` : "Zaloguj się, aby pobrać workspace."}</span></span></div></div>
          {!isCloudConfigured ? <Link className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.035] px-4 text-sm font-semibold text-[#e7eaff] transition hover:bg-white/[0.075]" href="/auth"><Cloud className="size-4" />Otwórz konfigurację konta</Link> : user ? <Button className="mt-4 w-full" variant="secondary" onClick={() => void signOut()}><LogOut className="size-4" />Wyloguj się</Button> : <Link className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#8066ff,#4e9cff)] px-4 text-sm font-semibold text-white" href="/auth"><LogIn className="size-4" />Zaloguj się</Link>}
        </Card>
        <Card>
          <CardHeader><CardTitle>Preferencje</CardTitle></CardHeader>
          <div className="grid gap-2.5"><Preference icon={Globe2} label="Język interfejsu" value="Polski" /><Preference icon={Palette} label="Wygląd" value="Ciemny · DayForge" /></div><p className="mt-4 text-[11px] leading-5 text-[#8e99b4]">DayForge v1.0 startuje w ciemnym motywie. Kolejne motywy i ustawienia powiadomień dodamy bez zmiany Twoich danych.</p>
        </Card>
      </div>
    </div>
  );
}

function Preference({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#8066ff]/13 text-[#bdaaff]"><Icon className="size-4" /></span><span><span className="block text-xs font-semibold text-white">{label}</span><span className="mt-1 block text-[10px] text-[#8e99b4]">{value}</span></span></div>; }
