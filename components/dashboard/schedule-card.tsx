import { ArrowUpRight, CalendarClock } from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ScheduleEvent } from "@/types/dayforge";

const eventTone = {
  purple: "border-[#8066ff] bg-[#8066ff]/15",
  blue: "border-[#4e9cff] bg-[#4e9cff]/12",
  green: "border-[#42d7a5] bg-[#42d7a5]/11",
  yellow: "border-[#ffcb62] bg-[#ffcb62]/10",
};

export function ScheduleCard({ events }: { events: ScheduleEvent[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Plan dnia</CardTitle><Link className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#aa91ff] transition hover:text-[#c7bcff]" href="/planner">Otwórz planer <ArrowUpRight className="size-3" /></Link></CardHeader>
      {events.length === 0 ? <div className="grid min-h-46 place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-6 text-center"><div><CalendarClock className="mx-auto size-5 text-[#9e8cff]" /><p className="mt-3 text-xs font-semibold text-white">Brak bloków na dziś</p><p className="mt-1 text-[11px] leading-5 text-[#8f9bb7]">Otwórz planer i zarezerwuj czas na najważniejsze zadanie.</p></div></div> : <div className="grid gap-2">{events.map((event) => <div className="grid grid-cols-[46px_minmax(0,1fr)] gap-2.5" key={event.id}><time className="pt-2.5 text-[10px] text-[#8590ad]">{event.time}</time><div className={cn("flex min-w-0 justify-between gap-3 rounded-r-lg border-l-[3px] px-2.5 py-2", eventTone[event.tone])}><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-white">{event.title}</p><p className="mt-0.5 truncate text-[9px] text-[#b7c0d6]">{event.subtitle}</p></div><span className="shrink-0 text-[9px] text-[#bdc6df]">{event.duration}</span></div></div>)}</div>}
    </Card>
  );
}
