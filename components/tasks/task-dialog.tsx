"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toDateKey } from "@/lib/date-utils";
import type { Priority, Project, Task, TaskStatus } from "@/types/dayforge";

const taskSchema = z.object({
  title: z.string().trim().min(3, "Wpisz co najmniej 3 znaki.").max(120, "Tytuł nie może mieć więcej niż 120 znaków."),
  description: z.string().trim().max(600, "Opis nie może mieć więcej niż 600 znaków."),
  projectId: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["inbox", "today", "planned"]),
  plannedDate: z.string(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type TaskPayload = {
  title: string;
  description: string;
  projectId: string | null;
  priority: Priority;
  status: Exclude<TaskStatus, "completed">;
  dueDate: string | null;
  plannedDate: string | null;
};

function toFormValues(task?: Task): TaskFormValues {
  const today = toDateKey(new Date());
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    projectId: task?.projectId ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status === "completed" ? "today" : task?.status ?? "today",
    plannedDate: task?.plannedDate ?? task?.dueDate ?? today,
  };
}

export function TaskDialog({
  open,
  onOpenChange,
  projects,
  task,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  task?: Task;
  onSave: (payload: TaskPayload) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({ resolver: zodResolver(taskSchema), defaultValues: toFormValues(task) });


  useEffect(() => {
    if (open) reset(toFormValues(task));
  }, [open, reset, task]);

  const submit = (values: TaskFormValues) => {
    const usesDate = values.status === "today" || values.status === "planned";
    onSave({
      title: values.title,
      description: values.description,
      projectId: values.projectId || null,
      priority: values.priority,
      status: values.status,
      dueDate: usesDate ? values.plannedDate : null,
      plannedDate: usesDate ? values.plannedDate : null,
    });
    onOpenChange(false);
  };

  const isEditing = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edytuj zadanie" : "Dodaj nowe zadanie"}</DialogTitle>
          <DialogDescription>To lokalny core DayForge: dane zapisują się na tym komputerze i później przejdą do Supabase bez zmiany interfejsu.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
            Tytuł zadania
            <input autoFocus className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none transition placeholder:text-[#6f7c99] focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="np. Przygotuj plan premiery produktu" {...register("title")} />
            {errors.title ? <span className="text-[11px] text-[#ff9cad]">{errors.title.message}</span> : null}
          </label>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
            Krótki opis <span className="font-normal text-[#77839d]">(opcjonalnie)</span>
            <textarea className="min-h-22 resize-y rounded-xl border border-white/10 bg-[#0d1326] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#6f7c99] focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="Jaki konkretny rezultat ma powstać?" {...register("description")} />
            {errors.description ? <span className="text-[11px] text-[#ff9cad]">{errors.description.message}</span> : null}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Projekt
              <select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" {...register("projectId")}>
                <option value="">Bez projektu</option>
                {projects.filter((project) => !project.archived || project.id === task?.projectId).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Priorytet
              <select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" {...register("priority")}>
                <option value="high">Wysoki priorytet</option>
                <option value="medium">Średni priorytet</option>
                <option value="low">Niski priorytet</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Gdzie ma trafić?
              <select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" {...register("status")}>
                <option value="inbox">Inbox — później zdecyduję</option>
                <option value="today">Dzisiaj</option>
                <option value="planned">Zaplanowane</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Data <span className="font-normal text-[#77839d]">(używana dla Dzisiaj i Zaplanowane)</span>
              <input type="date" className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" {...register("plannedDate")} />
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Anuluj</Button>
            <Button disabled={isSubmitting} type="submit">{isEditing ? <Save className="size-4" /> : <Plus className="size-4" />}{isEditing ? "Zapisz zmiany" : "Dodaj zadanie"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
