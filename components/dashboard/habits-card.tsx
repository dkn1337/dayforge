import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { activeHabits, habitCompletionsInWeek, isHabitCompleted } from "@/lib/analytics";
import { dateKeysForWeek, startOfWeekMonday, shortWeekdayLabel } from "@/lib/date-utils";
import { habitIconMap } from "@/lib/habit-icons";
import type { DayForgeLocalState } from "@/types/dayforge";

export function HabitsCard({ state }: { state: DayForgeLocalState }) {
  const weekDays = dateKeysForWeek(startOfWeekMonday(new Date())).slice(0, 5);
  const habits = activeHabits(state).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nawyki</CardTitle>
        <Link className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#aa91ff] transition hover:text-[#c7bcff]" href="/habits">
          Zarządzaj <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      {habits.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-[#8f9bb7]">Dodaj pierwszy nawyk, aby zobaczyć postęp.</p> : <div className="grid gap-2.5">
        {habits.map((habit) => {
          const Icon = habitIconMap[habit.icon];
          const completed = habitCompletionsInWeek(state, habit.id);
          return (
            <article className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-2.5" key={habit.id}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#8066ff]/14 text-[#bdaaff]"><Icon className="size-4" /></span>
                <div className="min-w-0"><h3 className="truncate text-[11px] font-semibold text-white">{habit.name}</h3><p className="mt-0.5 text-[9px] text-[#8f9bb7]">{completed} z {habit.weeklyTarget} dni</p></div>
              </div>
              <div className="flex gap-1">
                {weekDays.map((date) => { const done = isHabitCompleted(state, habit.id, date); return <span className={`grid size-[18px] place-items-center rounded-full border text-[8px] ${done ? "border-transparent bg-[linear-gradient(135deg,#8066ff,#4e9cff)] text-white" : "border-[#4b5774] text-[#9aa6c0]"}`} key={`${habit.id}-${date}`}>{shortWeekdayLabel(date).charAt(0)}</span>; })}
              </div>
            </article>
          );
        })}
      </div>}
    </Card>
  );
}
