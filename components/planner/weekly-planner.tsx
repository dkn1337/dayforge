"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, GripVertical, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { TimeBlockDialog } from "@/components/planner/time-block-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addDays, dateKeysForWeek, formatTime, formatWeekRange, fromDateKey, startOfWeekMonday, toDateKey, weekdayLabel } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { PlannerBlock } from "@/types/dayforge";

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 34;
const SLOT_COUNT = (DAY_END - DAY_START) / SLOT_MINUTES;
const hours = Array.from({ length: SLOT_COUNT }, (_, index) => DAY_START + index * SLOT_MINUTES);

const blockColors: Record<PlannerBlock["category"], string> = {
  "deep-work": "border-[#8066ff] bg-[#8066ff]/15 text-[#efeaff] hover:bg-[#8066ff]/24",
  meeting: "border-[#42d7a5] bg-[#42d7a5]/11 text-[#dcfff3] hover:bg-[#42d7a5]/20",
  personal: "border-[#4e9cff] bg-[#4e9cff]/12 text-[#e5f2ff] hover:bg-[#4e9cff]/20",
  break: "border-[#ffcb62] bg-[#ffcb62]/10 text-[#fff2ce] hover:bg-[#ffcb62]/18",
};

function slotRow(minutes: number): number {
  return Math.round((minutes - DAY_START) / SLOT_MINUTES) + 2;
}

export function WeeklyPlanner() {
  const { state, createPlannerBlock, updatePlannerBlock, deletePlannerBlock, movePlannerBlock } = useDayForgeStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PlannerBlock | undefined>();
  const [preset, setPreset] = useState<{ date: string; startMinutes: number } | undefined>();
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  const dates = useMemo(() => dateKeysForWeek(weekStart), [weekStart]);
  const todayKey = toDateKey(new Date());
  const blocks = useMemo(() => state.plannerBlocks.filter((block) => dates.includes(block.date)).filter((block) => block.startMinutes >= DAY_START && block.startMinutes < DAY_END), [dates, state.plannerBlocks]);

  const openCreate = (nextPreset?: { date: string; startMinutes: number }) => {
    setEditingBlock(undefined);
    setPreset(nextPreset);
    setDialogOpen(true);
  };

  const openEdit = (block: PlannerBlock) => {
    setEditingBlock(block);
    setPreset(undefined);
    setDialogOpen(true);
  };

  const currentTimeLine = useMemo(() => {
    if (!dates.includes(todayKey)) return null;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < DAY_START || minutes > DAY_END) return null;
    return { date: todayKey, minutes };
  }, [dates, todayKey]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="size-9" onClick={() => setWeekStart((current) => addDays(current, -7))} aria-label="Poprzedni tydzień"><ChevronLeft className="size-4" /></Button>
          <button className="min-w-48 rounded-xl px-2 py-1.5 text-center transition hover:bg-white/[0.05]" onClick={() => setWeekStart(startOfWeekMonday(new Date()))}><p className="text-xs font-semibold text-white">{formatWeekRange(weekStart)}</p><p className="mt-0.5 text-[10px] text-[#8590ad]">Kliknij, aby wrócić do bieżącego tygodnia</p></button>
          <Button variant="secondary" size="icon" className="size-9" onClick={() => setWeekStart((current) => addDays(current, 7))} aria-label="Następny tydzień"><ChevronRight className="size-4" /></Button>
        </div>
        <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setWeekStart(startOfWeekMonday(new Date()))}><RotateCcw className="size-3.5" />Dzisiaj</Button><Button size="sm" onClick={() => openCreate()}><Plus className="size-4" />Dodaj blok</Button></div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="scrollbar-thin overflow-x-auto">
          <div className="relative grid min-w-[1020px]" style={{ gridTemplateColumns: "96px repeat(7, minmax(132px, 1fr))", gridTemplateRows: `54px repeat(${SLOT_COUNT}, ${SLOT_HEIGHT}px)` }}>
            <div className="sticky left-0 z-30 border-b border-r border-white/10 bg-[#12182a]/95 p-3 text-[10px] font-semibold text-[#8e99b4] backdrop-blur">Godzina</div>
            {dates.map((date) => {
              const day = fromDateKey(date);
              return <div className={cn("border-b border-r border-white/10 bg-white/[0.024] p-2 text-center", date === todayKey && "bg-[#8066ff]/8")} key={date}><span className="text-[10px] text-[#aeb8d0]">{weekdayLabel(day)}</span><strong className="mt-1 block text-sm tracking-[-0.04em] text-white">{day.getDate()}</strong></div>;
            })}
            {hours.flatMap((minutes) => [
              <div className="sticky left-0 z-20 border-b border-r border-white/10 bg-[#12182a]/95 px-3 pt-1 text-[10px] text-[#7f8ba8] backdrop-blur" key={`hour-${minutes}`}>{minutes % 60 === 0 ? formatTime(minutes) : ""}</div>,
              ...dates.map((date, index) => <button type="button" aria-label={`Dodaj blok ${date} o ${formatTime(minutes)}`} onDoubleClick={() => openCreate({ date, startMinutes: minutes })} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const blockId = event.dataTransfer.getData("text/dayforge-block"); if (!blockId) return; movePlannerBlock(blockId, date, minutes); setDraggingBlockId(null); toast.success(`Blok przeniesiony na ${formatTime(minutes)}.`); }} className={cn("border-b border-r border-white/[0.075] bg-white/[0.008] transition hover:bg-white/[0.028] focus-visible:bg-white/[0.04] focus-visible:outline-none", index === 0 && "bg-[#8066ff]/[0.025]")} key={`${date}-${minutes}`} />),
            ])}
            {currentTimeLine ? <div className="pointer-events-none z-20 h-px bg-[#ff718d] shadow-[0_0_10px_rgba(255,113,141,.8)]" style={{ gridColumn: dates.indexOf(currentTimeLine.date) + 2, gridRow: slotRow(currentTimeLine.minutes) }}><span className="absolute -ml-1 -mt-1 size-2 rounded-full bg-[#ff718d]" /></div> : null}
            {blocks.map((block) => {
              const dayIndex = dates.indexOf(block.date);
              const span = Math.max(1, Math.ceil(block.durationMinutes / SLOT_MINUTES));
              return <button draggable key={block.id} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/dayforge-block", block.id); setDraggingBlockId(block.id); }} onDragEnd={() => setDraggingBlockId(null)} onClick={() => openEdit(block)} className={cn("group z-10 m-1 overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5 text-left shadow-[0_5px_16px_rgba(0,0,0,.12)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98fff]", blockColors[block.category], draggingBlockId === block.id && "opacity-40")} style={{ gridColumn: dayIndex + 2, gridRow: `${slotRow(block.startMinutes)} / span ${span}` }}>
                <span className="flex items-center gap-1"><GripVertical className="size-3 shrink-0 opacity-55" /><span className="truncate text-[10px] font-semibold">{block.title}</span></span><span className="mt-0.5 block truncate pl-4 text-[9px] opacity-70">{formatTime(block.startMinutes)} · {block.durationMinutes} min</span>
              </button>;
            })}
          </div>
        </div>
      </Card>
      <div className="mt-3 flex flex-col gap-1 text-xs leading-5 text-[#7f8ba8] sm:flex-row sm:items-center sm:justify-between"><p>Przeciągnij blok na inny dzień lub godzinę. Dwuklik na siatce tworzy nowy blok w wybranym miejscu.</p><p className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Edytuj długość i powiązanie z zadaniem po kliknięciu bloku.</p></div>
      <TimeBlockDialog open={dialogOpen} onOpenChange={setDialogOpen} tasks={state.tasks} block={editingBlock} preset={preset} onSave={(payload) => { if (editingBlock) { updatePlannerBlock(editingBlock.id, payload); toast.success("Blok czasu zaktualizowany."); } else { createPlannerBlock(payload); toast.success("Dodano blok czasu."); } }} onDelete={editingBlock ? () => { deletePlannerBlock(editingBlock.id); setDialogOpen(false); toast.success("Blok usunięty."); } : undefined} />
    </>
  );
}
