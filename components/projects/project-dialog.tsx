"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Project, ProjectColor } from "@/types/dayforge";

const projectSchema = z.object({
  name: z.string().trim().min(2, "Wpisz co najmniej 2 znaki.").max(60, "Nazwa projektu może mieć maksymalnie 60 znaków."),
  color: z.enum(["purple", "blue", "green", "yellow", "pink"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const colors: { id: ProjectColor; label: string; className: string }[] = [
  { id: "purple", label: "Fiolet", className: "bg-[#8066ff]" },
  { id: "blue", label: "Niebieski", className: "bg-[#4e9cff]" },
  { id: "green", label: "Zielony", className: "bg-[#42d7a5]" },
  { id: "yellow", label: "Żółty", className: "bg-[#ffcb62]" },
  { id: "pink", label: "Różowy", className: "bg-[#ff718d]" },
];

export function ProjectDialog({ open, onOpenChange, project, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; project?: Project; onSave: (values: ProjectFormValues) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema), defaultValues: { name: project?.name ?? "", color: project?.color ?? "purple" } });

  useEffect(() => {
    if (open) reset({ name: project?.name ?? "", color: project?.color ?? "purple" });
  }, [open, project, reset]);

  const isEditing = Boolean(project);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edytuj projekt" : "Nowy projekt"}</DialogTitle>
          <DialogDescription>Projekty porządkują zadania. W tej wersji zapisują się lokalnie na tym komputerze.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit((values) => { onSave(values); onOpenChange(false); })}>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">Nazwa projektu<input autoFocus className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="np. DayForge" {...register("name")} />{errors.name ? <span className="text-[11px] text-[#ff9cad]">{errors.name.message}</span> : null}</label>
          <fieldset className="grid gap-2"><legend className="text-xs font-medium text-[#b5bfd5]">Kolor projektu</legend><div className="flex flex-wrap gap-2">{colors.map((color) => <label className="cursor-pointer" key={color.id} title={color.label}><input className="peer sr-only" type="radio" value={color.id} {...register("color")} /><span className="grid size-10 place-items-center rounded-xl border border-white/10 transition peer-checked:border-white peer-checked:ring-2 peer-checked:ring-[#a98fff] peer-checked:ring-offset-2 peer-checked:ring-offset-[#12182a] hover:border-white/40"><span className={`size-5 rounded-full ${color.className}`} /></span></label>)}</div></fieldset>
          <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Anuluj</Button><Button disabled={isSubmitting} type="submit">{isEditing ? <Save className="size-4" /> : <Plus className="size-4" />}{isEditing ? "Zapisz projekt" : "Dodaj projekt"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
