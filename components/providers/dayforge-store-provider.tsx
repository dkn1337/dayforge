"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { formatTime, toDateKey } from "@/lib/date-utils";
import { createId } from "@/lib/id";
import { createSeedState } from "@/lib/dayforge-seed";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { useAuth } from "@/components/providers/auth-provider";
import type {
  ActiveFocusTimer,
  DayForgeLocalState,
  FocusMode,
  FocusSession,
  Habit,
  HabitCompletion,
  HabitIconKey,
  PlannerBlock,
  PlannerCategory,
  Priority,
  Project,
  ProjectColor,
  Task,
  TaskStatus,
} from "@/types/dayforge";

const STORAGE_KEY = "dayforge.local-core.v0.6";
const LEGACY_STORAGE_KEYS = ["dayforge.local-core.v0.4", "dayforge.local-core.v0.2"];
const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 20 * 60;

type TaskInput = {
  title: string;
  description: string;
  projectId: string | null;
  priority: Priority;
  status: Exclude<TaskStatus, "completed">;
  dueDate: string | null;
  plannedDate: string | null;
};

type ProjectInput = {
  name: string;
  color: ProjectColor;
};

type PlannerBlockInput = {
  title: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  category: PlannerCategory;
  taskId: string | null;
};

type HabitInput = {
  name: string;
  weeklyTarget: number;
  icon: HabitIconKey;
};

type FocusStartInput = {
  mode: FocusMode;
  taskId: string | null;
  taskTitle: string;
  plannedSeconds: number;
};

type DayForgeStore = {
  state: DayForgeLocalState;
  hydrated: boolean;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  createProject: (input: ProjectInput) => void;
  updateProject: (id: string, input: ProjectInput) => void;
  archiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
  createPlannerBlock: (input: PlannerBlockInput) => void;
  updatePlannerBlock: (id: string, input: PlannerBlockInput) => void;
  deletePlannerBlock: (id: string) => void;
  movePlannerBlock: (id: string, date: string, startMinutes: number) => void;
  scheduleTask: (taskId: string, date?: string) => PlannerBlock | null;
  createHabit: (input: HabitInput) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date?: string) => void;
  startFocusTimer: (input: FocusStartInput) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  resetFocusTimer: () => void;
  cancelFocusTimer: () => void;
  completeFocusTimer: () => void;
  syncFocusTimer: () => void;
  resetLocalData: () => void;
  exportLocalBackup: () => string;
  importLocalBackup: (raw: string) => { ok: boolean; message: string };
};

const DayForgeStoreContext = createContext<DayForgeStore | null>(null);

type LegacyV1State = {
  schemaVersion: 1;
  projects: Project[];
  tasks: Task[];
  plannerBlocks: PlannerBlock[];
};

export function isDayForgeState(value: unknown): value is DayForgeLocalState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DayForgeLocalState>;
  return candidate.schemaVersion === 2
    && Array.isArray(candidate.projects)
    && Array.isArray(candidate.tasks)
    && Array.isArray(candidate.plannerBlocks)
    && Array.isArray(candidate.habits)
    && Array.isArray(candidate.habitCompletions)
    && Array.isArray(candidate.focusSessions);
}

function isLegacyV1State(value: unknown): value is LegacyV1State {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LegacyV1State>;
  return candidate.schemaVersion === 1
    && Array.isArray(candidate.projects)
    && Array.isArray(candidate.tasks)
    && Array.isArray(candidate.plannerBlocks);
}

function migrateV1State(legacy: LegacyV1State): DayForgeLocalState {
  const seed = createSeedState();
  return {
    schemaVersion: 2,
    projects: legacy.projects,
    tasks: legacy.tasks,
    plannerBlocks: legacy.plannerBlocks,
    habits: seed.habits,
    habitCompletions: seed.habitCompletions,
    focusSessions: seed.focusSessions,
    activeFocusTimer: null,
  };
}

function safeReadState(): DayForgeLocalState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isDayForgeState(parsed)) return parsed;
      if (isLegacyV1State(parsed)) return migrateV1State(parsed);
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (!legacyRaw) continue;
      const parsed: unknown = JSON.parse(legacyRaw);
      if (isLegacyV1State(parsed)) return migrateV1State(parsed);
    }
  } catch {
    return null;
  }
  return null;
}

function normalizePlannerInput(input: PlannerBlockInput): PlannerBlockInput {
  const safeStart = Math.max(DAY_START_MINUTES, Math.min(input.startMinutes, DAY_END_MINUTES - 30));
  const safeDuration = Math.max(30, Math.min(input.durationMinutes, DAY_END_MINUTES - safeStart));
  const roundedDuration = Math.ceil(safeDuration / 30) * 30;
  return { ...input, startMinutes: safeStart, durationMinutes: roundedDuration };
}

function findFirstOpenSlot(blocks: PlannerBlock[], date: string, durationMinutes = 60): number {
  for (let start = 9 * 60; start <= DAY_END_MINUTES - durationMinutes; start += 30) {
    const overlaps = blocks.some((block) => block.date === date && start < block.startMinutes + block.durationMinutes && start + durationMinutes > block.startMinutes);
    if (!overlaps) return start;
  }
  return DAY_START_MINUTES;
}

export function getFocusSecondsLeft(timer: ActiveFocusTimer | null, now = Date.now()): number {
  if (!timer) return 0;
  if (!timer.endsAt) return Math.max(0, timer.remainingSeconds);
  return Math.max(0, Math.ceil((new Date(timer.endsAt).getTime() - now) / 1000));
}

function toFocusSession(timer: ActiveFocusTimer, status: FocusSession["status"], remainingSeconds: number): FocusSession {
  const now = new Date().toISOString();
  return {
    id: createId("focus"),
    taskId: timer.taskId,
    taskTitle: timer.taskTitle,
    mode: timer.mode,
    startedAt: timer.startedAt,
    endedAt: now,
    plannedSeconds: timer.plannedSeconds,
    actualSeconds: Math.max(0, timer.plannedSeconds - Math.max(0, remainingSeconds)),
    status,
    createdAt: now,
  };
}

async function resolveWorkspaceId(userId: string): Promise<{ workspaceId: string | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { workspaceId: null, error: "Brak konfiguracji Supabase." };

  const initial = await client.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1).maybeSingle();
  if (initial.error) return { workspaceId: null, error: initial.error.message };
  if (initial.data?.workspace_id) return { workspaceId: initial.data.workspace_id, error: null };

  const created = await client.rpc("ensure_personal_workspace", {});
  if (created.error) return { workspaceId: null, error: created.error.message };
  return { workspaceId: created.data, error: null };
}

export function DayForgeStoreProvider({ children }: { children: React.ReactNode }) {
  const { isCloudConfigured, isLoading: authLoading, setSyncStatus, user } = useAuth();
  const [state, setState] = useState<DayForgeLocalState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const workspaceIdRef = useRef<string | null>(null);
  const userId = user?.id ?? null;
  const stateRef = useRef(state);
  const suppressNextCloudWrite = useRef(false);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = safeReadState();
      if (stored) setState(stored);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (!isCloudConfigured || !userId) {
      workspaceIdRef.current = null;
      window.queueMicrotask(() => setCloudReady(false));
      return;
    }

    let cancelled = false;
    const connect = async () => {
      setSyncStatus("syncing");
      const resolved = await resolveWorkspaceId(userId);
      if (cancelled) return;
      if (resolved.error || !resolved.workspaceId) {
        setCloudReady(false);
        setSyncStatus("error", resolved.error ?? "Nie udało się przygotować workspace.");
        return;
      }

      workspaceIdRef.current = resolved.workspaceId;
      const client = getSupabaseClient();
      if (!client) return;
      const snapshotResult = await client.from("workspace_state_snapshots").select("state").eq("workspace_id", resolved.workspaceId).maybeSingle();
      if (cancelled) return;
      if (snapshotResult.error) {
        setCloudReady(false);
        setSyncStatus("error", snapshotResult.error.message);
        return;
      }

      const remoteState = snapshotResult.data?.state;
      if (remoteState && isDayForgeState(remoteState)) {
        suppressNextCloudWrite.current = true;
        setState(remoteState);
      } else {
        const { error } = await client.from("workspace_state_snapshots").upsert({
          workspace_id: resolved.workspaceId,
          state: stateRef.current as unknown as Json,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        }, { onConflict: "workspace_id" });
        if (error) {
          setCloudReady(false);
          setSyncStatus("error", error.message);
          return;
        }
      }
      setCloudReady(true);
      setSyncStatus("synced");
    };

    void connect();
    return () => { cancelled = true; };
  }, [authLoading, hydrated, isCloudConfigured, setSyncStatus, userId]);

  useEffect(() => {
    if (!hydrated || !cloudReady || !isCloudConfigured || !userId || !workspaceIdRef.current) return;
    if (suppressNextCloudWrite.current) {
      suppressNextCloudWrite.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      const client = getSupabaseClient();
      const workspaceId = workspaceIdRef.current;
      if (!client || !workspaceId) return;
      setSyncStatus("syncing");
      void client.from("workspace_state_snapshots").upsert({
        workspace_id: workspaceId,
        state: state as unknown as Json,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      }, { onConflict: "workspace_id" }).then(({ error }) => {
        setSyncStatus(error ? "error" : "synced", error?.message ?? null);
      });
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [cloudReady, hydrated, isCloudConfigured, setSyncStatus, state, userId]);

  const createTask = useCallback((input: TaskInput) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId("task"),
      title: input.title.trim(),
      description: input.description.trim(),
      projectId: input.projectId,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate,
      plannedDate: input.plannedDate,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    setState((current) => ({ ...current, tasks: [task, ...current.tasks] }));
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput) => {
    const now = new Date().toISOString();
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === id ? {
        ...task,
        title: input.title.trim(),
        description: input.description.trim(),
        projectId: input.projectId,
        priority: input.priority,
        status: input.status,
        dueDate: input.dueDate,
        plannedDate: input.plannedDate,
        completedAt: null,
        updatedAt: now,
      } : task),
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    const now = new Date().toISOString();
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== id) return task;
        const isCompleted = task.status === "completed";
        return {
          ...task,
          status: isCompleted ? (task.plannedDate ? "planned" : "today") : "completed",
          completedAt: isCompleted ? null : now,
          updatedAt: now,
        };
      }),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
      plannerBlocks: current.plannerBlocks.map((block) => block.taskId === id ? { ...block, taskId: null } : block),
      activeFocusTimer: current.activeFocusTimer?.taskId === id ? { ...current.activeFocusTimer, taskId: null, taskTitle: "Skupienie bez zadania" } : current.activeFocusTimer,
    }));
  }, []);

  const createProject = useCallback((input: ProjectInput) => {
    const project: Project = {
      id: createId("project"),
      name: input.name.trim(),
      color: input.color,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, projects: [project, ...current.projects] }));
  }, []);

  const updateProject = useCallback((id: string, input: ProjectInput) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === id ? { ...project, name: input.name.trim(), color: input.color } : project),
    }));
  }, []);

  const archiveProject = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === id ? { ...project, archived: !project.archived } : project),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
      tasks: current.tasks.map((task) => task.projectId === id ? { ...task, projectId: null } : task),
    }));
  }, []);

  const createPlannerBlock = useCallback((input: PlannerBlockInput) => {
    const now = new Date().toISOString();
    const normalized = normalizePlannerInput(input);
    const block: PlannerBlock = {
      id: createId("block"),
      ...normalized,
      title: normalized.title.trim(),
      createdAt: now,
      updatedAt: now,
    };
    setState((current) => ({ ...current, plannerBlocks: [...current.plannerBlocks, block] }));
  }, []);

  const updatePlannerBlock = useCallback((id: string, input: PlannerBlockInput) => {
    const normalized = normalizePlannerInput(input);
    const now = new Date().toISOString();
    setState((current) => ({
      ...current,
      plannerBlocks: current.plannerBlocks.map((block) => block.id === id ? { ...block, ...normalized, title: normalized.title.trim(), updatedAt: now } : block),
    }));
  }, []);

  const deletePlannerBlock = useCallback((id: string) => {
    setState((current) => ({ ...current, plannerBlocks: current.plannerBlocks.filter((block) => block.id !== id) }));
  }, []);

  const movePlannerBlock = useCallback((id: string, date: string, startMinutes: number) => {
    const now = new Date().toISOString();
    setState((current) => ({
      ...current,
      plannerBlocks: current.plannerBlocks.map((block) => block.id === id ? {
        ...block,
        date,
        startMinutes: Math.max(DAY_START_MINUTES, Math.min(startMinutes, DAY_END_MINUTES - block.durationMinutes)),
        updatedAt: now,
      } : block),
    }));
  }, []);

  const scheduleTask = useCallback((taskId: string, date = toDateKey(new Date())) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const now = new Date().toISOString();
    const block: PlannerBlock = {
      id: createId("block"),
      date,
      startMinutes: findFirstOpenSlot(state.plannerBlocks, date),
      durationMinutes: 60,
      title: task.title,
      category: "deep-work",
      taskId,
      createdAt: now,
      updatedAt: now,
    };

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((item) => item.id === taskId ? { ...item, status: "planned", plannedDate: date, updatedAt: now } : item),
      plannerBlocks: [...current.plannerBlocks, block],
    }));
    return block;
  }, [state.plannerBlocks, state.tasks]);

  const createHabit = useCallback((input: HabitInput) => {
    const habit: Habit = {
      id: createId("habit"),
      name: input.name.trim(),
      weeklyTarget: input.weeklyTarget,
      icon: input.icon,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, habits: [habit, ...current.habits] }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      habits: current.habits.map((habit) => habit.id === id ? { ...habit, archived: !habit.archived } : habit),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      habits: current.habits.filter((habit) => habit.id !== id),
      habitCompletions: current.habitCompletions.filter((completion) => completion.habitId !== id),
    }));
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string, date = toDateKey(new Date())) => {
    setState((current) => {
      const exists = current.habitCompletions.some((completion) => completion.habitId === habitId && completion.completedOn === date);
      if (exists) {
        return {
          ...current,
          habitCompletions: current.habitCompletions.filter((completion) => !(completion.habitId === habitId && completion.completedOn === date)),
        };
      }
      const completion: HabitCompletion = { id: createId("habit-completion"), habitId, completedOn: date, createdAt: new Date().toISOString() };
      return { ...current, habitCompletions: [...current.habitCompletions, completion] };
    });
  }, []);

  const syncFocusTimer = useCallback(() => {
    setState((current) => {
      const timer = current.activeFocusTimer;
      if (!timer?.endsAt) return current;
      const remainingSeconds = getFocusSecondsLeft(timer);
      if (remainingSeconds > 0) return current;
      const session = toFocusSession(timer, "completed", 0);
      return {
        ...current,
        activeFocusTimer: null,
        focusSessions: [session, ...current.focusSessions],
      };
    });
  }, []);

  const startFocusTimer = useCallback((input: FocusStartInput) => {
    setState((current) => {
      if (current.activeFocusTimer) return current;
      const plannedSeconds = Math.max(60, Math.min(120 * 60, Math.floor(input.plannedSeconds)));
      const now = new Date();
      return {
        ...current,
        activeFocusTimer: {
          mode: input.mode,
          taskId: input.taskId,
          taskTitle: input.taskTitle.trim() || "Skupienie bez zadania",
          plannedSeconds,
          remainingSeconds: plannedSeconds,
          startedAt: now.toISOString(),
          endsAt: new Date(now.getTime() + plannedSeconds * 1000).toISOString(),
        },
      };
    });
  }, []);

  const pauseFocusTimer = useCallback(() => {
    setState((current) => {
      const timer = current.activeFocusTimer;
      if (!timer) return current;
      const remainingSeconds = getFocusSecondsLeft(timer);
      if (remainingSeconds <= 0) {
        const session = toFocusSession(timer, "completed", 0);
        return { ...current, activeFocusTimer: null, focusSessions: [session, ...current.focusSessions] };
      }
      return { ...current, activeFocusTimer: { ...timer, remainingSeconds, endsAt: null } };
    });
  }, []);

  const resumeFocusTimer = useCallback(() => {
    setState((current) => {
      const timer = current.activeFocusTimer;
      if (!timer || timer.endsAt) return current;
      const now = Date.now();
      return {
        ...current,
        activeFocusTimer: { ...timer, endsAt: new Date(now + timer.remainingSeconds * 1000).toISOString() },
      };
    });
  }, []);

  const resetFocusTimer = useCallback(() => {
    setState((current) => ({ ...current, activeFocusTimer: null }));
  }, []);

  const cancelFocusTimer = useCallback(() => {
    setState((current) => {
      const timer = current.activeFocusTimer;
      if (!timer) return current;
      const remainingSeconds = getFocusSecondsLeft(timer);
      const session = toFocusSession(timer, "cancelled", remainingSeconds);
      return {
        ...current,
        activeFocusTimer: null,
        focusSessions: session.actualSeconds >= 60 ? [session, ...current.focusSessions] : current.focusSessions,
      };
    });
  }, []);

  const completeFocusTimer = useCallback(() => {
    setState((current) => {
      const timer = current.activeFocusTimer;
      if (!timer) return current;
      const remainingSeconds = getFocusSecondsLeft(timer);
      const session = toFocusSession(timer, "completed", remainingSeconds);
      return {
        ...current,
        activeFocusTimer: null,
        focusSessions: [session, ...current.focusSessions],
      };
    });
  }, []);

  const resetLocalData = useCallback(() => {
    const seeded = createSeedState();
    setState(seeded);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  }, []);

  const exportLocalBackup = useCallback(() => JSON.stringify({
    product: "DayForge",
    schemaVersion: state.schemaVersion,
    exportedAt: new Date().toISOString(),
    state,
  }, null, 2), [state]);

  const importLocalBackup = useCallback((raw: string) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      const candidate = parsed && typeof parsed === "object" && "state" in parsed ? (parsed as { state: unknown }).state : parsed;
      if (!isDayForgeState(candidate)) return { ok: false, message: "Ten plik nie wygląda jak backup DayForge v1.0." };
      setState(candidate);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return { ok: true, message: "Backup został przywrócony." };
    } catch {
      return { ok: false, message: "Nie udało się odczytać pliku backupu." };
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const initialSync = window.setTimeout(syncFocusTimer, 0);
    const timer = window.setInterval(syncFocusTimer, 1000);
    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(timer);
    };
  }, [hydrated, syncFocusTimer]);

  const value = useMemo<DayForgeStore>(() => ({
    state,
    hydrated,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
    createPlannerBlock,
    updatePlannerBlock,
    deletePlannerBlock,
    movePlannerBlock,
    scheduleTask,
    createHabit,
    archiveHabit,
    deleteHabit,
    toggleHabitCompletion,
    startFocusTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    resetFocusTimer,
    cancelFocusTimer,
    completeFocusTimer,
    syncFocusTimer,
    resetLocalData,
    exportLocalBackup,
    importLocalBackup,
  }), [archiveHabit, archiveProject, cancelFocusTimer, completeFocusTimer, createHabit, createPlannerBlock, createProject, createTask, deleteHabit, deletePlannerBlock, deleteProject, deleteTask, hydrated, movePlannerBlock, pauseFocusTimer, resetFocusTimer, resumeFocusTimer, scheduleTask, startFocusTimer, state, syncFocusTimer, toggleHabitCompletion, toggleTask, updatePlannerBlock, updateProject, updateTask, resetLocalData, exportLocalBackup, importLocalBackup]);

  return <DayForgeStoreContext.Provider value={value}>{children}</DayForgeStoreContext.Provider>;
}

export function useDayForgeStore(): DayForgeStore {
  const context = useContext(DayForgeStoreContext);
  if (!context) throw new Error("useDayForgeStore must be used inside DayForgeStoreProvider.");
  return context;
}

export function taskProjectName(task: Task, projects: Project[]): string {
  return projects.find((project) => project.id === task.projectId)?.name ?? "Bez projektu";
}

export function statusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    inbox: "Inbox",
    today: "Dzisiaj",
    planned: "Zaplanowane",
    completed: "Ukończone",
  };
  return labels[status];
}

export function blockTimeLabel(block: PlannerBlock): string {
  return `${formatTime(block.startMinutes)} · ${block.durationMinutes} min`;
}
