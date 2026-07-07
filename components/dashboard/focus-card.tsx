import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { FocusTimer } from "@/components/focus/focus-timer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayForgeLocalState } from "@/types/dayforge";

export function FocusCard({ state }: { state: DayForgeLocalState }) {
  const task = state.tasks.find((item) => item.status !== "completed") ?? null;
  return (
    <Card className="flex min-h-[334px] flex-col">
      <CardHeader>
        <CardTitle>Sesja skupienia</CardTitle>
        <Link className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#aa91ff] transition hover:text-[#c7bcff]" href="/focus">
          Otwórz <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <FocusTimer compact taskId={task?.id ?? null} taskTitle={task?.title ?? "Skupienie bez zadania"} />
    </Card>
  );
}
