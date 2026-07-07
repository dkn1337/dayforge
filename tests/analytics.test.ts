import { describe, expect, it } from "vitest";

import { getDailyMetrics, getHabitStreak, habitScoreForWeek } from "@/lib/analytics";
import type { DayForgeLocalState } from "@/types/dayforge";

const state: DayForgeLocalState = {
  schemaVersion: 2,
  projects: [],
  tasks: [
    { id: "task-1", title: "Plan", description: "", projectId: null, priority: "high", status: "completed", dueDate: null, plannedDate: "2026-07-06", completedAt: "2026-07-06T10:00:00.000Z", createdAt: "2026-07-06T08:00:00.000Z", updatedAt: "2026-07-06T10:00:00.000Z" },
  ],
  plannerBlocks: [{ id: "block-1", title: "Plan", date: "2026-07-06", startMinutes: 540, durationMinutes: 60, category: "deep-work", taskId: "task-1", createdAt: "2026-07-06T08:00:00.000Z", updatedAt: "2026-07-06T08:00:00.000Z" }],
  habits: [{ id: "habit-1", name: "Czytanie", weeklyTarget: 2, icon: "book", archived: false, createdAt: "2026-07-01T08:00:00.000Z" }],
  habitCompletions: [
    { id: "c-0", habitId: "habit-1", completedOn: "2026-07-03", createdAt: "2026-07-03T20:00:00.000Z" },
    { id: "c-1", habitId: "habit-1", completedOn: "2026-07-04", createdAt: "2026-07-04T20:00:00.000Z" },
    { id: "c-2", habitId: "habit-1", completedOn: "2026-07-05", createdAt: "2026-07-05T20:00:00.000Z" },
    { id: "c-3", habitId: "habit-1", completedOn: "2026-07-06", createdAt: "2026-07-06T20:00:00.000Z" },
  ],
  focusSessions: [{ id: "focus-1", taskId: "task-1", taskTitle: "Plan", mode: "focus", startedAt: "2026-07-06T08:00:00.000Z", endedAt: "2026-07-06T09:00:00.000Z", plannedSeconds: 3600, actualSeconds: 3600, status: "completed", createdAt: "2026-07-06T09:00:00.000Z" }],
  activeFocusTimer: null,
};

describe("DayForge analytics", () => {
  it("counts a consecutive habit streak from the current day", () => {
    expect(getHabitStreak(state, "habit-1", "2026-07-06")).toBe(4);
  });

  it("calculates a complete daily score from real activity", () => {
    const metrics = getDailyMetrics(state, "2026-07-06");
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.focusSeconds).toBe(3600);
    expect(metrics.score).toBe(100);
  });

  it("caps weekly habit score at each habit target", () => {
    expect(habitScoreForWeek(state, new Date("2026-06-29T12:00:00.000Z"))).toBe(100);
  });
});
