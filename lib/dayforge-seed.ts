import { addDays, startOfWeekMonday, toDateKey } from "@/lib/date-utils";
import type { DayForgeLocalState, FocusSession, Habit, HabitCompletion, PlannerBlock, Project, Task } from "@/types/dayforge";

const createdAt = "2026-07-06T09:00:00.000Z";

const projectSeed: Project[] = [
  { id: "project-dayforge", name: "DayForge", color: "purple", archived: false, createdAt },
  { id: "project-growth", name: "Wzrost", color: "blue", archived: false, createdAt },
  { id: "project-research", name: "Badania", color: "green", archived: false, createdAt },
  { id: "project-personal", name: "Osobiste", color: "yellow", archived: false, createdAt },
];

function isoAt(dateKey: string, hours: number, minutes = 0): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

function completedTask(id: string, title: string, projectId: string, dateKey: string, priority: Task["priority"] = "medium"): Task {
  const completedAt = isoAt(dateKey, 17, 15);
  return {
    id,
    title,
    description: "Zamknięte zadanie z lokalnej historii DayForge.",
    projectId,
    priority,
    status: "completed",
    dueDate: dateKey,
    plannedDate: dateKey,
    completedAt,
    createdAt: isoAt(dateKey, 9),
    updatedAt: completedAt,
  };
}

export function createSeedState(): DayForgeLocalState {
  const today = toDateKey(new Date());
  const monday = startOfWeekMonday(new Date());
  const days = Array.from({ length: 7 }, (_, index) => toDateKey(addDays(monday, index)));
  const historicalDays = Array.from({ length: 16 }, (_, index) => toDateKey(addDays(new Date(), -(index + 1))));

  const tasks: Task[] = [
    {
      id: "task-strategy",
      title: "Dopracuj strategię produktu",
      description: "Ustal trzy najważniejsze decyzje dla kolejnej wersji DayForge.",
      projectId: "project-dayforge",
      priority: "high",
      status: "today",
      dueDate: today,
      plannedDate: today,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "task-design",
      title: "Aktualizuj design system",
      description: "Dopnij stany hover, focus i puste widoki dla głównych modułów.",
      projectId: "project-dayforge",
      priority: "high",
      status: "today",
      dueDate: today,
      plannedDate: today,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "task-interviews",
      title: "Notatki z wywiadów z klientami",
      description: "Zapisz najczęściej powtarzające się problemy użytkowników.",
      projectId: "project-research",
      priority: "medium",
      status: "today",
      dueDate: today,
      plannedDate: today,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "task-email",
      title: "Napisz sekwencję maili startowych",
      description: "Pierwsze trzy wiadomości dla nowych użytkowników produktu.",
      projectId: "project-growth",
      priority: "medium",
      status: "planned",
      dueDate: days[3],
      plannedDate: days[3],
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "task-tomorrow",
      title: "Zaplanuj jutro",
      description: "Zamknij dzień przez wybór trzech priorytetów na jutro.",
      projectId: "project-personal",
      priority: "low",
      status: "inbox",
      dueDate: null,
      plannedDate: null,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    completedTask("task-completed", "Zdefiniuj kierunek DayForge", "project-dayforge", historicalDays[0], "high"),
    completedTask("task-history-1", "Przygotuj brief dla klienta", "project-growth", historicalDays[1]),
    completedTask("task-history-2", "Przejrzyj backlog produktu", "project-dayforge", historicalDays[3], "high"),
    completedTask("task-history-3", "Podsumuj rozmowy badawcze", "project-research", historicalDays[5]),
    completedTask("task-history-4", "Zamknij sprint designu", "project-dayforge", historicalDays[8], "high"),
    completedTask("task-history-5", "Zaplanuj cele tygodnia", "project-personal", historicalDays[10]),
  ];

  const plannerBlocks: PlannerBlock[] = [
    {
      id: "block-strategy",
      date: days[0],
      startMinutes: 9 * 60,
      durationMinutes: 90,
      title: "Głęboka praca: strategia",
      category: "deep-work",
      taskId: "task-strategy",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "block-design",
      date: days[0],
      startMinutes: 11 * 60,
      durationMinutes: 60,
      title: "Design system",
      category: "personal",
      taskId: "task-design",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "block-team",
      date: days[0],
      startMinutes: 13 * 60,
      durationMinutes: 30,
      title: "Spotkanie zespołu",
      category: "meeting",
      taskId: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "block-research",
      date: days[2],
      startMinutes: 14 * 60,
      durationMinutes: 90,
      title: "Analiza wywiadów",
      category: "deep-work",
      taskId: "task-interviews",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "block-client",
      date: days[4],
      startMinutes: 12 * 60,
      durationMinutes: 60,
      title: "Rozmowa z klientem",
      category: "personal",
      taskId: null,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const habits: Habit[] = [
    { id: "habit-training", name: "Trening", weeklyTarget: 4, icon: "dumbbell", archived: false, createdAt },
    { id: "habit-reading", name: "Czytanie 20 min", weeklyTarget: 5, icon: "book", archived: false, createdAt },
    { id: "habit-review", name: "Przegląd dnia", weeklyTarget: 5, icon: "notebook", archived: false, createdAt },
    { id: "habit-phone", name: "Bez telefonu po 22:00", weeklyTarget: 5, icon: "moon", archived: false, createdAt },
  ];

  const habitCompletions: HabitCompletion[] = [];
  const completionPlan: Record<string, number[]> = {
    "habit-training": [0, 1, 3, 6, 8, 11],
    "habit-reading": [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
    "habit-review": [0, 2, 3, 5, 8, 10],
    "habit-phone": [1, 2, 4, 5, 6, 8, 9],
  };

  for (const [habitId, offsets] of Object.entries(completionPlan)) {
    offsets.forEach((offset) => {
      const completedOn = toDateKey(addDays(new Date(), -offset));
      habitCompletions.push({ id: `completion-${habitId}-${completedOn}`, habitId, completedOn, createdAt: isoAt(completedOn, 21, 30) });
    });
  }

  const focusSessions: FocusSession[] = [
    { id: "focus-1", taskId: "task-history-1", taskTitle: "Brief dla klienta", mode: "focus", startedAt: isoAt(historicalDays[0], 9), endedAt: isoAt(historicalDays[0], 9, 50), plannedSeconds: 3000, actualSeconds: 3000, status: "completed", createdAt: isoAt(historicalDays[0], 9) },
    { id: "focus-2", taskId: "task-history-2", taskTitle: "Przegląd backlogu", mode: "focus", startedAt: isoAt(historicalDays[1], 10), endedAt: isoAt(historicalDays[1], 10, 25), plannedSeconds: 1500, actualSeconds: 1500, status: "completed", createdAt: isoAt(historicalDays[1], 10) },
    { id: "focus-3", taskId: "task-history-3", taskTitle: "Rozmowy badawcze", mode: "focus", startedAt: isoAt(historicalDays[3], 9, 15), endedAt: isoAt(historicalDays[3], 10, 15), plannedSeconds: 3600, actualSeconds: 3600, status: "completed", createdAt: isoAt(historicalDays[3], 9, 15) },
    { id: "focus-4", taskId: "task-history-4", taskTitle: "Sprint designu", mode: "focus", startedAt: isoAt(historicalDays[5], 8, 30), endedAt: isoAt(historicalDays[5], 9, 20), plannedSeconds: 3000, actualSeconds: 3000, status: "completed", createdAt: isoAt(historicalDays[5], 8, 30) },
    { id: "focus-5", taskId: null, taskTitle: "Plan tygodnia", mode: "focus", startedAt: isoAt(historicalDays[8], 9), endedAt: isoAt(historicalDays[8], 9, 45), plannedSeconds: 2700, actualSeconds: 2700, status: "completed", createdAt: isoAt(historicalDays[8], 9) },
    { id: "focus-6", taskId: "task-history-5", taskTitle: "Cele tygodnia", mode: "focus", startedAt: isoAt(historicalDays[10], 11), endedAt: isoAt(historicalDays[10], 11, 25), plannedSeconds: 1500, actualSeconds: 1500, status: "completed", createdAt: isoAt(historicalDays[10], 11) },
    { id: "focus-7", taskId: null, taskTitle: "Przegląd sprintu", mode: "focus", startedAt: isoAt(historicalDays[12], 9), endedAt: isoAt(historicalDays[12], 9, 30), plannedSeconds: 1800, actualSeconds: 1800, status: "completed", createdAt: isoAt(historicalDays[12], 9) },
  ];

  return {
    schemaVersion: 2,
    projects: projectSeed,
    tasks,
    plannerBlocks,
    habits,
    habitCompletions,
    focusSessions,
    activeFocusTimer: null,
  };
}
