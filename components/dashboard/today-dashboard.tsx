"use client";

import { CheckCircle2, Flame, Plus, Timer, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FocusCard } from "@/components/dashboard/focus-card";
import { HabitsCard } from "@/components/dashboard/habits-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { ScheduleCard } from "@/components/dashboard/schedule-card";
import { taskProjectName, useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { bestProductiveDay, focusSecondsForDate, getDailyMetrics, habitScoreForWeek, weeklyProductivityData } from "@/lib/analytics";
import { formatLongDate, formatTime, startOfWeekMonday, toDateKey } from "@/lib/date-utils";
import { formatDuration } from "@/lib/utils";
import type { ScheduleEvent } from "@/types/dayforge";

const scheduleTones = {
  "deep-work": "purple",
  meeting: "green",
  personal: "blue",
  break: "yellow",
} as const;

export function TodayDashboard() {
  const { state, createTask, toggleTask } = useDayForgeStore();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const todayKey = toDateKey(new Date());
  const todayMetrics = getDailyMetrics(state, todayKey);
  const habitScore = habitScoreForWeek(state);
  const todayFocusSeconds = focusSecondsForDate(state, todayKey);
  const completedTasks = todayMetrics.completedTasks;
  const topTasks = state.tasks.filter((task) => task.status !== "completed").sort((left, right) => ({ high: 0, medium: 1, low: 2 }[left.priority] - { high: 0, medium: 1, low: 2 }[right.priority])).slice(0, 4);
  const schedule: ScheduleEvent[] = state.plannerBlocks.filter((block) => block.date === todayKey).sort((left, right) => left.startMinutes - right.startMinutes).slice(0, 4).map((block) => ({ id: block.id, time: formatTime(block.startMinutes), title: block.title, subtitle: block.taskId ? state.tasks.find((task) => task.id === block.taskId)?.title ?? "Powiązane zadanie" : "Blok czasu", duration: `${block.durationMinutes} min`, tone: scheduleTones[block.category] }));
  const productivityData = weeklyProductivityData(state, startOfWeekMonday(new Date()));
  const weekFocusSeconds = useMemo(() => {
    const monday = toDateKey(startOfWeekMonday(new Date()));
    const sunday = toDateKey(new Date(startOfWeekMonday(new Date()).getFullYear(), startOfWeekMonday(new Date()).getMonth(), startOfWeekMonday(new Date()).getDate() + 6));
    return state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus" && toDateKey(new Date(session.startedAt)) >= monday && toDateKey(new Date(session.startedAt)) <= sunday).reduce((sum, session) => sum + session.actualSeconds, 0);
  }, [state.focusSessions]);

  const toggle = (id: string) => {
    const task = state.tasks.find((item) => item.id === id);
    toggleTask(id);
    toast.success(task?.status === "completed" ? "Zadanie wróciło do listy." : "Zadanie ukończone.");
  };

  return (
    <>
      <PageHeader eyebrow="Centrum dowodzenia" title="Dzień dobry, Karol" description={`${formatLongDate(todayKey)} — jasny plan to już wygrana.`} actions={<><span className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-[#c7cde2]">{formatLongDate(todayKey)}</span><Button onClick={() => setTaskDialogOpen(true)}><Plus className="size-4" />Dodaj zadanie</Button></>} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ukończone zadania" value={`${completedTasks}/${todayMetrics.plannedTasks}`} caption={todayMetrics.plannedTasks ? "z dzisiejszego planu" : "brak zadań w planie"} icon={CheckCircle2} tone="purple" />
        <KpiCard label="Czas skupienia" value={formatDuration(Math.round(todayFocusSeconds / 60))} caption={todayFocusSeconds ? "z zapisanych sesji dzisiaj" : "brak ukończonej sesji"} icon={Timer} tone="blue" />
        <KpiCard label="Wynik nawyków" value={`${habitScore}%`} caption="realizacja celów tego tygodnia" icon={Flame} tone="green" />
        <KpiCard label="Ocena dnia" value={`${todayMetrics.score}/100`} caption="zadania 40% · focus 35% · nawyki 25%" icon={TrendingUp} tone="yellow" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr_.78fr]">
        <ScheduleCard events={schedule} />
        <Card>
          <CardHeader><CardTitle>Priorytetowe zadania</CardTitle><a className="text-[11px] font-semibold text-[#aa91ff] transition hover:text-[#c7bcff]" href="/tasks">Zobacz wszystkie →</a></CardHeader>
          <div className="grid gap-1">{topTasks.map((task) => <TaskRow dense key={task.id} task={task} projectName={taskProjectName(task, state.projects)} onToggle={toggle} />)}{topTasks.length === 0 ? <p className="py-8 text-center text-xs text-[#97a3bf]">Wszystko ukończone. Dobry rytm.</p> : null}</div>
        </Card>
        <FocusCard state={state} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <ProductivityChart data={productivityData} highlights={[{ label: "Najlepszy dzień", value: bestProductiveDay(state) }, { label: "Wynik dziś", value: `${todayMetrics.score}/100` }, { label: "Focus w tygodniu", value: formatDuration(Math.round(weekFocusSeconds / 60)) }]} />
        <HabitsCard state={state} />
      </div>
      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} projects={state.projects} onSave={(payload) => { createTask(payload); toast.success("Dodano zadanie."); }} />
    </>
  );
}
