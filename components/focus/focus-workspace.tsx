"use client";

import { CheckCircle2, Coffee, Flame, PlayCircle, Timer, TreePine, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FocusTimer } from "@/components/focus/focus-timer";
import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { focusSecondsForDate, getHabitStreak, totalFocusSeconds } from "@/lib/analytics";
import { formatClockFromIso, startOfWeekMonday, toDateKey } from "@/lib/date-utils";
import { formatDuration } from "@/lib/utils";
import type { FocusMode } from "@/types/dayforge";

const modes: { id: FocusMode; label: string; minutes: number; icon: typeof Timer }[] = [
  { id: "focus", label: "Skupienie", minutes: 25, icon: Timer },
  { id: "short-break", label: "Krótka przerwa", minutes: 5, icon: Coffee },
  { id: "long-break", label: "Długa przerwa", minutes: 15, icon: TreePine },
];

export function FocusWorkspace() {
  const { state, cancelFocusTimer, completeFocusTimer } = useDayForgeStore();
  const [mode, setMode] = useState<FocusMode>("focus");
  const [duration, setDuration] = useState(25);
  const openTasks = state.tasks.filter((task) => task.status !== "completed");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => openTasks[0]?.id ?? null);
  const selectedTask = openTasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedMode = modes.find((item) => item.id === mode) ?? modes[0];
  const today = toDateKey(new Date());
  const weekStart = startOfWeekMonday(new Date());
  const weekEnd = toDateKey(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6));
  const todayFocusSeconds = focusSecondsForDate(state, today);
  const weekFocusSeconds = state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus" && toDateKey(new Date(session.startedAt)) >= toDateKey(weekStart) && toDateKey(new Date(session.startedAt)) <= weekEnd).reduce((sum, session) => sum + session.actualSeconds, 0);
  const longestStreak = useMemo(() => state.habits.reduce((best, habit) => Math.max(best, getHabitStreak(state, habit.id)), 0), [state]);
  const recentSessions = state.focusSessions.slice(0, 5);

  const changeMode = (nextMode: FocusMode) => {
    if (state.activeFocusTimer) {
      toast.info("Najpierw zakończ albo anuluj aktywną sesję.");
      return;
    }
    const config = modes.find((item) => item.id === nextMode) ?? modes[0];
    setMode(nextMode);
    setDuration(config.minutes);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_.72fr]">
      <Card className="flex min-h-[500px] flex-col items-center justify-center px-5 py-8">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {modes.map((item) => {
            const Icon = item.icon;
            return <button className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${mode === item.id ? "border-[#9479ff]/45 bg-[#8066ff]/12 text-white" : "border-white/10 bg-white/[0.02] text-[#aeb8d0] hover:bg-white/[0.06]"}`} key={item.id} onClick={() => changeMode(item.id)}><Icon className="size-3.5" />{item.label}</button>;
          })}
        </div>
        <FocusTimer minutes={duration} mode={mode} taskId={selectedTask?.id ?? null} taskTitle={selectedTask?.title ?? "Skupienie bez zadania"} label={selectedMode.label} />
        {state.activeFocusTimer ? <div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="secondary" size="sm" onClick={() => { completeFocusTimer(); toast.success("Sesja została zakończona i zapisana."); }}><CheckCircle2 className="size-3.5" />Zakończ teraz</Button><Button variant="ghost" size="sm" onClick={() => { cancelFocusTimer(); toast.info("Sesja została anulowana."); }}><XCircle className="size-3.5" />Anuluj sesję</Button></div> : null}
      </Card>
      <Card>
        <CardHeader><CardTitle>Szczegóły sesji</CardTitle></CardHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-[11px] font-medium text-[#9da8c0]">Aktualne zadanie<select className="h-10 rounded-xl border border-white/10 bg-[#0e1427] px-3 text-xs text-white outline-none focus:border-[#9479ff]/60" value={selectedTaskId ?? ""} onChange={(event) => setSelectedTaskId(event.target.value || null)} disabled={Boolean(state.activeFocusTimer)}><option value="">Bez przypisanego zadania</option>{openTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
          <label className="grid gap-2 text-[11px] font-medium text-[#9da8c0]">Długość sesji (min)<input className="h-10 rounded-xl border border-white/10 bg-[#0e1427] px-3 text-xs text-white outline-none focus:border-[#9479ff]/60 disabled:cursor-not-allowed disabled:opacity-50" min="1" max="120" type="number" value={duration} disabled={Boolean(state.activeFocusTimer)} onChange={(event) => setDuration(Math.min(120, Math.max(1, Number(event.target.value) || 25)))} /></label>
          <div className="rounded-xl border border-[#8066ff]/20 bg-[#8066ff]/[0.07] p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#bcaaff]">Jak działa timer</p><p className="mt-1.5 text-[11px] leading-5 text-[#c7cfe4]">Stan timera zapisuje się z czasem końca. Możesz przejść na inną zakładkę albo odświeżyć aplikację bez utraty sesji; po podłączeniu chmury zostanie także zsynchronizowany.</p></div>
        </div>
        <div className="mt-5 grid gap-2.5">
          <Metric icon={Timer} label="Dzisiaj" value={`${state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus" && toDateKey(new Date(session.startedAt)) === today).length} sesje · ${formatDuration(Math.round(todayFocusSeconds / 60))}`} tone="blue" />
          <Metric icon={CheckCircle2} label="Ten tydzień" value={`${state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus" && toDateKey(new Date(session.startedAt)) >= toDateKey(weekStart) && toDateKey(new Date(session.startedAt)) <= weekEnd).length} sesji · ${formatDuration(Math.round(weekFocusSeconds / 60))}`} tone="green" />
          <Metric icon={Flame} label="Najdłuższa seria" value={`${longestStreak} dni`} tone="yellow" />
        </div>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7f8ba8]">Ostatnie sesje</p>{recentSessions.length === 0 ? <p className="py-4 text-xs text-[#8f9bb7]">Zakończ pierwszą sesję, aby zobaczyć historię.</p> : <div className="grid gap-2">{recentSessions.map((session) => <div className="flex items-center justify-between gap-3 text-xs" key={session.id}><span className="min-w-0 truncate text-[#dbe0f1]">{session.taskTitle}</span><span className="shrink-0 text-[#8f9bb7]">{formatClockFromIso(session.startedAt)} · {formatDuration(Math.round(session.actualSeconds / 60))}</span></div>)}</div>}</div>
        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs"><span className="flex items-center gap-2 text-[#b9c3da]"><PlayCircle className="size-4 text-[#c3b4ff]" />Łączny focus</span><strong className="text-white">{formatDuration(Math.round(totalFocusSeconds(state) / 60))}</strong></div>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Timer; label: string; value: string; tone: "blue" | "green" | "yellow" }) {
  const className = { blue: "text-[#88c0ff]", green: "text-[#61dfb5]", yellow: "text-[#ffcf72]" }[tone];
  return <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs"><span className="flex items-center gap-2 text-white"><Icon className={`size-4 ${className}`} />{label}</span><strong className="text-[#b9c3da]">{value}</strong></div>;
}
