"use client";

import { CalendarPlus, Check, Circle, Pencil, Trash2 } from "lucide-react";

import { PriorityBadge } from "@/components/tasks/priority-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/dayforge";

export function TaskRow({
  task,
  projectName,
  dense = false,
  onToggle,
  onDelete,
  onEdit,
  onSchedule,
}: {
  task: Task;
  projectName: string;
  dense?: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onSchedule?: (task: Task) => void;
}) {
  const isCompleted = task.status === "completed";
  const secondaryLabel = isCompleted ? "Ukończone" : task.status === "today" ? "Dzisiaj" : task.status === "planned" ? "Zaplanowane" : "Inbox";

  return (
    <article className={cn("group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-white/[0.07] hover:bg-white/[0.026]", !dense && "border-white/10 bg-white/[0.018] p-3") }>
      <button
        aria-label={isCompleted ? `Oznacz zadanie ${task.title} jako otwarte` : `Oznacz zadanie ${task.title} jako ukończone`}
        className={cn("mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98fff]", isCompleted ? "border-transparent bg-[linear-gradient(135deg,#8066ff,#4e9cff)] text-white" : "border-[#64708e] text-transparent hover:border-[#a98fff]")}
        onClick={() => onToggle(task.id)}
      >
        {isCompleted ? <Check className="size-3" strokeWidth={3} /> : <Circle className="size-0" />}
      </button>
      <div className="min-w-0 flex-1">
        <h3 className={cn("truncate text-xs font-semibold text-[#f4f5ff]", isCompleted && "text-[#7d88a3] line-through")}>{task.title}</h3>
        <p className="mt-1 truncate text-[10px] text-[#8894b0]">{projectName} · {secondaryLabel}</p>
        {task.description && !dense ? <p className="mt-1 line-clamp-1 text-[10px] text-[#71809e]">{task.description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {!dense && onSchedule && !isCompleted ? <Button className="hidden size-7 rounded-lg group-hover:inline-flex" variant="ghost" size="icon" onClick={() => onSchedule(task)} aria-label={`Dodaj zadanie ${task.title} do planera`}><CalendarPlus className="size-3.5 text-[#8dbdff]" /></Button> : null}
        {!dense && onEdit ? <Button className="hidden size-7 rounded-lg group-hover:inline-flex" variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label={`Edytuj zadanie ${task.title}`}><Pencil className="size-3.5 text-[#c9c0ff]" /></Button> : null}
        {!dense && onDelete ? <Button className="hidden size-7 rounded-lg group-hover:inline-flex" variant="ghost" size="icon" onClick={() => onDelete(task.id)} aria-label={`Usuń zadanie ${task.title}`}><Trash2 className="size-3.5 text-[#ff9cad]" /></Button> : null}
      </div>
    </article>
  );
}
