"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { habitIconOptions } from "@/lib/habit-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { HabitIconKey } from "@/types/dayforge";

const habitSchema = z.object({
  name: z.string().trim().min(3, "Wpisz co najmniej 3 znaki.").max(60, "Nazwa może mieć maksymalnie 60 znaków."),
  weeklyTarget: z.number().int().min(1, "Minimalny cel to 1 dzień.").max(7, "Maksymalny cel to 7 dni."),
  icon: z.enum(["dumbbell", "book", "notebook", "moon", "sparkles"]),
});

type HabitFormValues = z.infer<typeof habitSchema>;

export function HabitDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (habit: { name: string; weeklyTarget: number; icon: HabitIconKey }) => void;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: "", weeklyTarget: 5, icon: "dumbbell" },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const submit = (values: HabitFormValues) => {
    onCreate(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nowy nawyk</DialogTitle>
          <DialogDescription>Wybierz mały rytuał, który chcesz wykonywać regularnie. Historia wykonania i streak będą liczone z prawdziwych dni.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
            Nazwa nawyku
            <input autoFocus className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60 focus:ring-2 focus:ring-[#8066ff]/15" placeholder="np. Czytanie 20 min" {...register("name")} />
            {errors.name ? <span className="text-[11px] text-[#ff9cad]">{errors.name.message}</span> : null}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Cel tygodniowy
              <select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("weeklyTarget", { valueAsNumber: true })}>
                {[1, 2, 3, 4, 5, 6, 7].map((target) => <option key={target} value={target}>{target} dni</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-medium text-[#b5bfd5]">
              Ikona
              <select className="h-11 rounded-xl border border-white/10 bg-[#0d1326] px-3 text-sm text-white outline-none focus:border-[#9479ff]/60" {...register("icon")}>
                {habitIconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Anuluj</Button><Button disabled={isSubmitting} type="submit"><Sparkles className="size-4" />Dodaj nawyk</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
