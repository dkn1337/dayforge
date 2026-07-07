"use client";

import { Archive, ChevronLeft, ChevronRight, Flame, Plus, Target, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { HabitDialog } from "@/components/habits/habit-dialog";
import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { activeHabits, getHabitStreak, habitCompletionsInWeek, habitScoreForWeek, isHabitCompleted } from "@/lib/analytics";
import { addDays, dateKeysForWeek, formatWeekRange, fromDateKey, shortWeekdayLabel, startOfWeekMonday, toDateKey } from "@/lib/date-utils";
import { habitIconMap } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

export function HabitManager() {
  const { state, createHabit, archiveHabit, deleteHabit, toggleHabitCompletion } = useDayForgeStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [showArchived, setShowArchived] = useState(false);
  const weekDays = useMemo(() => dateKeysForWeek(weekStart), [weekStart]);
  const today = toDateKey(new Date());
  const visibleHabits = useMemo(() => state.habits.filter((habit) => showArchived ? habit.archived : !habit.archived), [showArchived, state.habits]);
  const score = habitScoreForWeek(state, weekStart);
  const isCurrentWeek = toDateKey(weekStart) === toDateKey(startOfWeekMonday(new Date()));

  const moveWeek = (direction: -1 | 1) => setWeekStart((current) => addDays(current, direction * 7));

  const toggleCompletion = (habitId: string, date: string) => {
    toggleHabitCompletion(habitId, date);
    const completed = isHabitCompleted(state, habitId, date);
    toast.success(completed ? "Cofnięto wykonanie nawyku." : "Nawyk został oznaczony jako wykonany.");
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card>
          <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div><CardTitle>Twoje nawyki</CardTitle><p className="mt-1 text-xs text-[#8f9bb7]">Klikaj konkretne dni. Wynik i streak są liczone z zapisanej historii.</p></div>
            <div className="flex items-center gap-2"><button className="text-[11px] font-semibold text-[#aa91ff] hover:text-white" onClick={() => setShowArchived((current) => !current)}>{showArchived ? "Pokaż aktywne" : "Archiwum"}</button><Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="size-3.5" />Nowy nawyk</Button></div>
          </CardHeader>

          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.018] p-2.5">
            <Button size="icon" variant="ghost" onClick={() => moveWeek(-1)} aria-label="Poprzedni tydzień"><ChevronLeft className="size-4" /></Button>
            <div className="text-center"><p className="text-xs font-semibold text-white">{formatWeekRange(weekStart)}</p><button className="mt-0.5 text-[10px] text-[#a98fff] hover:text-white" onClick={() => setWeekStart(startOfWeekMonday(new Date()))} disabled={isCurrentWeek}>Ten tydzień</button></div>
            <Button size="icon" variant="ghost" onClick={() => moveWeek(1)} aria-label="Następny tydzień"><ChevronRight className="size-4" /></Button>
          </div>

          {visibleHabits.length === 0 ? <EmptyState title={showArchived ? "Archiwum nawyków jest puste" : "Nie masz jeszcze nawyków"} description="Dodaj pierwszy prosty rytuał i buduj konsekwencję dzień po dniu." actionLabel="Dodaj nawyk" onAction={() => setDialogOpen(true)} /> : <div className="grid gap-3">{visibleHabits.map((habit) => {
            const Icon = habitIconMap[habit.icon];
            const completedThisWeek = habitCompletionsInWeek(state, habit.id, weekStart);
            const progress = Math.min(100, Math.round((completedThisWeek / habit.weeklyTarget) * 100));
            const streak = getHabitStreak(state, habit.id, today);
            return (
              <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5" key={habit.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#8066ff]/14 text-[#bdaaff]"><Icon className="size-4" /></span><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{habit.name}</h3><p className="mt-1 text-[10px] text-[#8e99b4]">{completedThisWeek} z {habit.weeklyTarget} dni w tym tygodniu</p></div></div>
                  <div className="flex items-center gap-1"><Button size="icon" variant="ghost" className="size-8" onClick={() => { archiveHabit(habit.id); toast.success(habit.archived ? "Nawyk przywrócony." : "Nawyk przeniesiony do archiwum."); }} aria-label={habit.archived ? `Przywróć ${habit.name}` : `Archiwizuj ${habit.name}`}><Archive className="size-3.5" /></Button><Button size="icon" variant="ghost" className="size-8" onClick={() => { deleteHabit(habit.id); toast.success("Nawyk usunięty."); }} aria-label={`Usuń ${habit.name}`}><Trash2 className="size-3.5 text-[#ffadbb]" /></Button></div>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {weekDays.map((date) => {
                    const done = isHabitCompleted(state, habit.id, date);
                    const label = shortWeekdayLabel(date);
                    const isToday = date === today;
                    return <button aria-pressed={done} className={cn("group grid aspect-[1/.9] place-items-center rounded-lg border text-[10px] font-semibold transition", done ? "border-transparent bg-[linear-gradient(135deg,#8066ff,#4e9cff)] text-white" : "border-white/10 bg-white/[0.018] text-[#9ba7c1] hover:border-[#9479ff]/45 hover:bg-[#8066ff]/10", isToday && !done ? "ring-1 ring-[#b09eff]/55" : "")} key={`${habit.id}-${date}`} onClick={() => toggleCompletion(habit.id, date)} title={`${label} · ${date}`}><span>{label}</span><span className="text-[8px] opacity-75">{fromDateKey(date).getDate()}</span></button>;
                  })}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="mb-1.5 flex items-center justify-between text-[10px] text-[#9da8c3]"><span>Postęp tygodnia</span><strong className="font-semibold text-[#dfe5f7]">{progress}%</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#8066ff,#4e9cff)]" style={{ width: `${progress}%` }} /></div></div><span className="inline-flex items-center gap-1 text-[11px] text-[#b4bed7]"><Flame className="size-3.5 text-[#ffcf72]" />seria {streak} dni</span></div>
              </article>
            );
          })}</div>}
        </Card>

        <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <span className="grid size-11 place-items-center rounded-xl border border-[#a98fff]/20 bg-[#8066ff]/12 text-[#c4b8ff]"><Target className="size-5" /></span>
          <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a98fff]">Wynik tygodnia</p>
          <strong className="mt-1 bg-[linear-gradient(135deg,#bdabff,#60a6ff)] bg-clip-text text-[76px] font-extrabold leading-none tracking-[-0.11em] text-transparent">{score}%</strong>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.055em] text-white">{score >= 80 ? "Budujesz rozpęd." : score >= 45 ? "Rytm już się buduje." : "Zacznij od jednego kroku."}</h2>
          <p className="mt-3 max-w-sm text-xs leading-5 text-[#aab4ca]">Wynik to suma rzeczywistych wykonań względem celów aktywnych nawyków w wybranym tygodniu.</p>
          <div className="mt-5 grid w-full max-w-sm grid-cols-7 gap-1.5">{weekDays.map((date) => { const done = activeHabits(state).some((habit) => isHabitCompleted(state, habit.id, date)); return <span className={cn("grid aspect-square place-items-center rounded-lg border text-[10px]", done ? "border-transparent bg-[linear-gradient(135deg,#8066ff,#4e9cff)] text-white" : "border-white/10 bg-white/[0.025] text-[#95a1bd]")} key={`week-overview-${date}`}>{fromDateKey(date).getDate()}</span>; })}</div>
        </Card>
      </div>
      <HabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={(input) => { createHabit(input); toast.success("Dodano nowy nawyk."); }} />
    </>
  );
}
