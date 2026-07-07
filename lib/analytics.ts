import { addDays, dateKeyFromIso, dateKeysForWeek, fromDateKey, shortWeekdayLabel, startOfWeekMonday, toDateKey, weekdayLabel } from "@/lib/date-utils";
import type { DayForgeLocalState, FocusSession, Habit, Task } from "@/types/dayforge";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function completedDate(task: Task): string | null {
  return dateKeyFromIso(task.completedAt);
}

function sessionDate(session: FocusSession): string | null {
  return dateKeyFromIso(session.startedAt);
}

export function activeHabits(state: DayForgeLocalState): Habit[] {
  return state.habits.filter((habit) => !habit.archived);
}

export function isHabitCompleted(state: DayForgeLocalState, habitId: string, date: string): boolean {
  return state.habitCompletions.some((completion) => completion.habitId === habitId && completion.completedOn === date);
}

export function getHabitCompletedDates(state: DayForgeLocalState, habitId: string): string[] {
  return Array.from(new Set(state.habitCompletions.filter((completion) => completion.habitId === habitId).map((completion) => completion.completedOn))).sort();
}

export function getHabitStreak(state: DayForgeLocalState, habitId: string, today = toDateKey(new Date())): number {
  const completions = new Set(getHabitCompletedDates(state, habitId));
  const todayDate = fromDateKey(today);
  let cursor = completions.has(today) ? todayDate : addDays(todayDate, -1);
  let streak = 0;

  while (completions.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function habitCompletionsInWeek(state: DayForgeLocalState, habitId: string, weekStart = startOfWeekMonday(new Date())): number {
  const weekDates = new Set(dateKeysForWeek(weekStart));
  return state.habitCompletions.filter((completion) => completion.habitId === habitId && weekDates.has(completion.completedOn)).length;
}

export function habitScoreForWeek(state: DayForgeLocalState, weekStart = startOfWeekMonday(new Date())): number {
  const habits = activeHabits(state);
  if (habits.length === 0) return 0;
  const completed = habits.reduce((sum, habit) => sum + Math.min(habit.weeklyTarget, habitCompletionsInWeek(state, habit.id, weekStart)), 0);
  const target = habits.reduce((sum, habit) => sum + habit.weeklyTarget, 0);
  return target === 0 ? 0 : Math.round((completed / target) * 100);
}

export function focusSecondsForDate(state: DayForgeLocalState, date: string): number {
  return state.focusSessions
    .filter((session) => session.status === "completed" && session.mode === "focus" && sessionDate(session) === date)
    .reduce((sum, session) => sum + session.actualSeconds, 0);
}

export function focusSecondsForDateRange(state: DayForgeLocalState, start: string, end: string): number {
  return state.focusSessions
    .filter((session) => {
      const date = sessionDate(session);
      return session.status === "completed" && session.mode === "focus" && date !== null && date >= start && date <= end;
    })
    .reduce((sum, session) => sum + session.actualSeconds, 0);
}

export function completedTasksForDate(state: DayForgeLocalState, date: string): Task[] {
  return state.tasks.filter((task) => task.status === "completed" && completedDate(task) === date);
}

export function plannedTasksForDate(state: DayForgeLocalState, date: string): Task[] {
  return state.tasks.filter((task) => task.plannedDate === date || (task.status === "today" && date === toDateKey(new Date())));
}

export function completedHabitCountForDate(state: DayForgeLocalState, date: string): number {
  const habitIds = new Set(activeHabits(state).map((habit) => habit.id));
  return state.habitCompletions.filter((completion) => completion.completedOn === date && habitIds.has(completion.habitId)).length;
}

export type DailyMetrics = {
  date: string;
  completedTasks: number;
  plannedTasks: number;
  focusSeconds: number;
  plannedFocusMinutes: number;
  completedHabits: number;
  activeHabits: number;
  score: number;
  activityLevel: number;
};

/**
 * Transparent day score (0–100): 40% planned-task completion, 35% focus,
 * and 25% habit completion. A component with no data is worth 0 rather than
 * showing an invented result.
 */
export function getDailyMetrics(state: DayForgeLocalState, date: string): DailyMetrics {
  const completedTasks = completedTasksForDate(state, date).length;
  const plannedTasks = plannedTasksForDate(state, date).length;
  const focusSeconds = focusSecondsForDate(state, date);
  const plannedFocusMinutes = state.plannerBlocks.filter((block) => block.date === date && block.category === "deep-work").reduce((sum, block) => sum + block.durationMinutes, 0);
  const completedHabits = completedHabitCountForDate(state, date);
  const habitTotal = activeHabits(state).length;

  const taskRatio = plannedTasks > 0 ? Math.min(1, completedTasks / plannedTasks) : completedTasks > 0 ? 1 : 0;
  const focusTargetSeconds = Math.max(60 * 60, plannedFocusMinutes * 60);
  const focusRatio = Math.min(1, focusSeconds / focusTargetSeconds);
  const habitRatio = habitTotal > 0 ? Math.min(1, completedHabits / habitTotal) : 0;
  const score = Math.round((taskRatio * 40 + focusRatio * 35 + habitRatio * 25));

  const activityWeight = completedTasks + completedHabits + Math.floor(focusSeconds / (25 * 60));
  const activityLevel = activityWeight === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(activityWeight / 2)));

  return {
    date,
    completedTasks,
    plannedTasks,
    focusSeconds,
    plannedFocusMinutes,
    completedHabits,
    activeHabits: habitTotal,
    score,
    activityLevel,
  };
}

export function weeklyProductivityData(state: DayForgeLocalState, weekStart = startOfWeekMonday(new Date())) {
  return dateKeysForWeek(weekStart).map((date) => ({ day: shortWeekdayLabel(date), score: getDailyMetrics(state, date).score, date }));
}

export function lastThirtyDaysActivity(state: DayForgeLocalState, today = new Date()) {
  return Array.from({ length: 30 }, (_, index) => {
    const date = toDateKey(addDays(today, -(29 - index)));
    const metrics = getDailyMetrics(state, date);
    return { date, level: metrics.activityLevel, score: metrics.score };
  });
}

export function focusLastFourWeeks(state: DayForgeLocalState, currentWeekStart = startOfWeekMonday(new Date())) {
  return Array.from({ length: 4 }, (_, index) => {
    const start = toDateKey(addDays(currentWeekStart, -(3 - index) * 7));
    const end = toDateKey(addDays(fromDateKey(start), 6));
    return { week: `Tydz. ${index + 1}`, minutes: Math.round(focusSecondsForDateRange(state, start, end) / 60), start, end };
  });
}

export function totalFocusSeconds(state: DayForgeLocalState): number {
  return state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus").reduce((sum, session) => sum + session.actualSeconds, 0);
}

export function bestFocusSessionSeconds(state: DayForgeLocalState): number {
  return state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus").reduce((best, session) => Math.max(best, session.actualSeconds), 0);
}

export function averageFocusSecondsPerActiveDay(state: DayForgeLocalState): number {
  const activeDates = new Set(state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus").map(sessionDate).filter((date): date is string => Boolean(date)));
  return activeDates.size === 0 ? 0 : Math.round(totalFocusSeconds(state) / activeDates.size);
}

export function bestProductiveDay(state: DayForgeLocalState): string {
  const dates = lastThirtyDaysActivity(state);
  const best = dates.reduce((winner, candidate) => candidate.score > winner.score ? candidate : winner, dates[0]);
  if (!best || best.score === 0) return "Brak danych";
  return weekdayLabel(fromDateKey(best.date));
}

export function bestFocusHour(state: DayForgeLocalState): string {
  const byHour = new Map<number, number>();
  state.focusSessions.filter((session) => session.status === "completed" && session.mode === "focus").forEach((session) => {
    const hour = new Date(session.startedAt).getHours();
    byHour.set(hour, (byHour.get(hour) ?? 0) + session.actualSeconds);
  });
  let bestHour: number | null = null;
  let highest = 0;
  byHour.forEach((seconds, hour) => {
    if (seconds > highest) {
      highest = seconds;
      bestHour = hour;
    }
  });
  if (bestHour === null) return "Brak danych";
  return `${String(bestHour).padStart(2, "0")}:00–${String((bestHour + 1) % 24).padStart(2, "0")}:00`;
}

export function longestHabitStreak(state: DayForgeLocalState): { habitName: string; days: number } {
  const habits = activeHabits(state);
  if (habits.length === 0) return { habitName: "Brak nawyków", days: 0 };
  return habits.reduce((winner, habit) => {
    const current = getHabitStreak(state, habit.id);
    return current > winner.days ? { habitName: habit.name, days: current } : winner;
  }, { habitName: habits[0]?.name ?? "Brak nawyków", days: getHabitStreak(state, habits[0]?.id ?? "") });
}

export function weeklyPlanCompletion(state: DayForgeLocalState, weekStart = startOfWeekMonday(new Date())): number {
  const dates = new Set(dateKeysForWeek(weekStart));
  const planned = state.tasks.filter((task) => task.plannedDate && dates.has(task.plannedDate));
  if (planned.length === 0) return 0;
  const done = planned.filter((task) => task.status === "completed").length;
  return Math.round((done / planned.length) * 100);
}

export function activeDaysInLastThirtyDays(state: DayForgeLocalState): number {
  return lastThirtyDaysActivity(state).filter((day) => day.level > 0).length;
}

export function daysBetween(first: string, second: string): number {
  return Math.round((fromDateKey(first).getTime() - fromDateKey(second).getTime()) / MS_PER_DAY);
}
