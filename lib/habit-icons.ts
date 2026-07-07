import { BookOpen, Dumbbell, MoonStar, NotebookPen, Sparkles, type LucideIcon } from "lucide-react";

import type { HabitIconKey } from "@/types/dayforge";

export const habitIconMap: Record<HabitIconKey, LucideIcon> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  notebook: NotebookPen,
  moon: MoonStar,
  sparkles: Sparkles,
};

export const habitIconOptions: { value: HabitIconKey; label: string }[] = [
  { value: "dumbbell", label: "Trening" },
  { value: "book", label: "Czytanie" },
  { value: "notebook", label: "Notatki" },
  { value: "moon", label: "Sen" },
  { value: "sparkles", label: "Rytuał" },
];
