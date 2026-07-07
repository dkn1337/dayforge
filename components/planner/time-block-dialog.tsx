"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTime, timeToMinutes, toDateKey } from "@/lib/date-utils";
import type { PlannerBlock, PlannerCategory, Task } from "@/types/dayforge";

const blockSchema = z.object({
  title: z.string().trim().min(3, "Wpisz co najmniej 3 znaki.").max(80, "Maksymalnie 80 znaków."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Wybierz poprawną datę."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Wybierz godzinę startu."),
  durationMinutes: z.number().int().min(30).max(240),
  category: z.enum(["deep-work", "meeting", "personal", "break"]),
  taskId: z.string(),
});

type BlockFormValues = z.infer<typeof blockSchema>;

type PlannerPayload = {
  title: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  category: PlannerCategory;
  taskId: string | null;
};

function initialValues(block?: PlannerBlock, preset?: { date: string; startMinutes: number }): BlockFormValues {
  return {
    title: block?.title ?? "",
    date: block?.date ?? preset?.date ?? toDateKey(new Date()),
    startTime: formatTime(block?.startMinutes ?? preset?.startMinutes ?? 9 * 60),
    durationMinutes: block?.durationMinutes ?? 60,
    category: block?.category ?? "deep-work",
    taskId: block?.taskId ?? "",
  };
}

export function TimeBlockDialog({
  open,
  onOpenChange,
  tasks,
  block,
  preset,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  block?: PlannerBlock;
  preset?: { date: string; startMinutes: number };
  onSave: (payload: PlannerPayload) => void;
  onDelete?: () => void;
}) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<BlockFormValues>({ resolver: zodResolver(blockSchema), defaultValues: initialValues(block, preset) });
  const taskField = register("taskId");

  useEffect(() => {
    if (open) reset(initialValues(block, preset));
  }, [block, open, preset, reset]);

  const submit = (values: BlockFormValues) => {
    onSave({
      title: values.title,
      date: values.date,
      startMinutes: timeToMinutes(values.startTime),
      durationMinutes: values.durationMinutes,
      category: values.category,
      taskId: values.taskId || null,
    });
    onOpenChange(false);
  };

  const isEditing = Boolean(block);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edytuj blok czasu" : "Dodaj blok czasu"}</DialogTitle>
          <DialogDescription>Przeciągaj bloki po planerze, edytuj czas oraz wiąż je z konkretnymi zadaniami.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Nazwa bloku<input autoFocus className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="np. Głęboka praca" {...register("title")} />{errors.title ? <span className="text-[11px] text-[#ff9cad]">{errors.title.message}</span> : null}</label>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Powiązane zadanie <span className="font-normal text-[#77839d]">(opcjonalnie)</span><select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...taskField} onChange={(event) => { taskField.onChange(event); const selected = tasks.find((task) => task.id === event.target.value); if (selected) setValue("title", selected.title, { shouldDirty: true }); }}><option value="">Bez powiązanego zadania</option>{tasks.filter((task) => task.status !== "completed").map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Data<input type="date" className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("date")} /></label>
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Godzina startu<input type="time" step="1800" className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("startTime")} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Długość<select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("durationMinutes", { valueAsNumber: true })}>{[30, 60, 90, 120, 150, 180, 210, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}</select></label>
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Typ<select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("category")}><option value="deep-work">Głęboka praca</option><option value="meeting">Spotkanie</option><option value="personal">Osobiste</option><option value="break">Przerwa</option></select></label>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2"><div>{isEditing && onDelete ? <Button type="button" variant="ghost" className="text-[#ffb1bf] hover:bg-[#ff718d]/10 hover:text-[#ffd7df]" onClick={onDelete}><Trash2 className="size-4" />Usuń</Button> : null}</div><div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Anuluj</Button><Button disabled={isSubmitting} type="submit">{isEditing ? <Save className="size-4" /> : <CalendarPlus className="size-4" />}{isEditing ? "Zapisz zmiany" : "Dodaj blok"}</Button></div></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
