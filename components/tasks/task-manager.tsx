"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Filter, ListFilter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { taskProjectName, useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { toDateKey } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Priority, Task } from "@/types/dayforge";

type ViewFilter = "all" | "today" | "inbox" | "high" | "completed";

const filters: { id: ViewFilter; label: string; getCount: (tasks: Task[]) => number }[] = [
  { id: "all", label: "Wszystkie zadania", getCount: (tasks) => tasks.length },
  { id: "today", label: "Dzisiaj", getCount: (tasks) => tasks.filter((task) => task.status === "today").length },
  { id: "inbox", label: "Inbox", getCount: (tasks) => tasks.filter((task) => task.status === "inbox").length },
  { id: "high", label: "Wysoki priorytet", getCount: (tasks) => tasks.filter((task) => task.priority === "high" && task.status !== "completed").length },
  { id: "completed", label: "Ukończone", getCount: (tasks) => tasks.filter((task) => task.status === "completed").length },
];

export function TaskManager({ initialQuery = "", openNewTask = false }: { initialQuery?: string; openNewTask?: boolean }) {
  const router = useRouter();
  const { state, createTask, updateTask, deleteTask, toggleTask, scheduleTask } = useDayForgeStore();
  const [view, setView] = useState<ViewFilter>("all");
  const [search, setSearch] = useState(initialQuery);
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(openNewTask);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const filteredTasks = useMemo(() => {
    const normalizedQuery = search.toLocaleLowerCase("pl-PL").trim();
    return state.tasks.filter((task) => {
      const projectName = taskProjectName(task, state.projects);
      const queryMatches = !normalizedQuery || task.title.toLocaleLowerCase("pl-PL").includes(normalizedQuery) || task.description.toLocaleLowerCase("pl-PL").includes(normalizedQuery) || projectName.toLocaleLowerCase("pl-PL").includes(normalizedQuery);
      const priorityMatches = priority === "all" || task.priority === priority;
      const projectMatches = projectId === "all" || (projectId === "none" ? task.projectId === null : task.projectId === projectId);
      const viewMatches = view === "all" || (view === "today" && task.status === "today") || (view === "inbox" && task.status === "inbox") || (view === "high" && task.priority === "high" && task.status !== "completed") || (view === "completed" && task.status === "completed");
      return queryMatches && priorityMatches && projectMatches && viewMatches;
    });
  }, [priority, projectId, search, state.projects, state.tasks, view]);

  const openCreate = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const saveTask = (payload: Parameters<typeof createTask>[0]) => {
    if (editingTask) {
      updateTask(editingTask.id, payload);
      toast.success("Zmiany w zadaniu zapisane lokalnie.");
    } else {
      createTask(payload);
      toast.success("Dodano nowe zadanie.");
    }
  };

  const schedule = (task: Task) => {
    const block = scheduleTask(task.id, toDateKey(new Date()));
    if (!block) return;
    toast.success(`Dodano „${task.title}” do planera o ${String(Math.floor(block.startMinutes / 60)).padStart(2, "0")}:${String(block.startMinutes % 60).padStart(2, "0")}.`);
    router.push("/planner");
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="h-fit">
          <CardHeader><CardTitle>Widoki</CardTitle></CardHeader>
          <div className="grid gap-2">
            {filters.map((filter) => (
              <button className={cn("flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-xs font-medium transition", view === filter.id ? "border-[#8c75ff]/48 bg-[#8066ff]/10 text-white" : "border-white/10 bg-white/[0.02] text-[#cdd3e6] hover:bg-white/[0.05]")} key={filter.id} onClick={() => setView(filter.id)}>
                {filter.label}<span className="text-[10px] text-[#99a4c1]">{filter.getCount(state.tasks)}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[#8066ff]/20 bg-[#8066ff]/8 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#c0b2ff]">Szybki rytuał</p>
            <p className="mt-2 text-xs leading-5 text-[#b9c2d9]">Zamknij dziś jedno zadanie wysokiego priorytetu, zanim otworzysz kolejne.</p>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex-col items-stretch sm:flex-row sm:items-center">
            <CardTitle>Twoje zadania</CardTitle>
            <Button size="sm" onClick={openCreate}><Plus className="size-3.5" />Nowe zadanie</Button>
          </CardHeader>
          <div className="mb-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8490ad]" /><input className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#8290ad] focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="Szukaj zadań, opisów i projektów…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <label className="relative"><ListFilter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9ba7c3]" /><select className="h-10 w-full rounded-xl border border-white/10 bg-[#101629] py-0 pl-8 pr-3 text-xs text-[#d5dcef] outline-none focus:border-[#9479ff]/60" value={priority} onChange={(event) => setPriority(event.target.value as Priority | "all")}><option value="all">Wszystkie priorytety</option><option value="high">Wysoki priorytet</option><option value="medium">Średni priorytet</option><option value="low">Niski priorytet</option></select></label>
            <select aria-label="Filtruj po projekcie" className="h-10 w-full rounded-xl border border-white/10 bg-[#101629] px-3 text-xs text-[#d5dcef] outline-none focus:border-[#9479ff]/60" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="all">Wszystkie projekty</option><option value="none">Bez projektu</option>{state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
          </div>
          <div className="mb-3 flex items-center justify-between text-[10px] text-[#8e99b4]"><span>{filteredTasks.length} wyników</span><span className="inline-flex items-center gap-1"><Filter className="size-3" />{filters.find((filter) => filter.id === view)?.label}</span></div>
          <div className="grid gap-2">
            {filteredTasks.map((task) => <TaskRow key={task.id} task={task} projectName={taskProjectName(task, state.projects)} onDelete={(id) => { deleteTask(id); toast.success("Zadanie usunięte."); }} onToggle={(id) => { const taskToToggle = state.tasks.find((item) => item.id === id); toggleTask(id); toast.success(taskToToggle?.status === "completed" ? "Zadanie przywrócone." : "Zadanie ukończone."); }} onEdit={openEdit} onSchedule={schedule} />)}
            {filteredTasks.length === 0 ? <EmptyState title="Brak pasujących zadań" description="Spróbuj zmienić filtry albo dodaj nowe zadanie do dzisiejszego planu." actionLabel="Dodaj zadanie" onAction={openCreate} /> : null}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] px-3 py-2.5 text-xs text-[#9da8c0]"><CheckCircle2 className="size-4 text-[#61dfb5]" />Zmiany zapisują się lokalnie. Moduł Supabase później zsynchronizuje dokładnie ten sam model danych.</div>
        </Card>
      </div>
      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} projects={state.projects} task={editingTask} onSave={saveTask} />
    </>
  );
}
