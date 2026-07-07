export type Priority = "high" | "medium" | "low";
export type TaskStatus = "inbox" | "today" | "planned" | "completed";
export type ProjectColor = "purple" | "blue" | "green" | "yellow" | "pink";
export type PlannerCategory = "deep-work" | "meeting" | "personal" | "break";
export type HabitIconKey = "dumbbell" | "book" | "notebook" | "moon" | "sparkles";
export type FocusMode = "focus" | "short-break" | "long-break";

export type Project = {
  id: string;
  name: string;
  color: ProjectColor;
  archived: boolean;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  plannedDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlannerBlock = {
  id: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  title: string;
  category: PlannerCategory;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Habit = {
  id: string;
  name: string;
  weeklyTarget: number;
  icon: HabitIconKey;
  archived: boolean;
  createdAt: string;
};

export type HabitCompletion = {
  id: string;
  habitId: string;
  completedOn: string;
  createdAt: string;
};

export type FocusSession = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  mode: FocusMode;
  startedAt: string;
  endedAt: string;
  plannedSeconds: number;
  actualSeconds: number;
  status: "completed" | "cancelled";
  createdAt: string;
};

/**
 * The active timer is persisted locally. For a running timer `endsAt` is set;
 * for a paused timer the remaining time is stored and `endsAt` is null.
 */
export type ActiveFocusTimer = {
  mode: FocusMode;
  taskId: string | null;
  taskTitle: string;
  plannedSeconds: number;
  remainingSeconds: number;
  startedAt: string;
  endsAt: string | null;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  tone: "purple" | "blue" | "green" | "yellow";
};

export type DayForgeLocalState = {
  schemaVersion: 2;
  projects: Project[];
  tasks: Task[];
  plannerBlocks: PlannerBlock[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  focusSessions: FocusSession[];
  activeFocusTimer: ActiveFocusTimer | null;
};
