"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useDayForgeStore, getFocusSecondsLeft } from "@/components/providers/dayforge-store-provider";
import { Button } from "@/components/ui/button";
import { cn, formatTimer } from "@/lib/utils";
import type { FocusMode } from "@/types/dayforge";

const modeLabels: Record<FocusMode, string> = {
  focus: "Głęboka praca",
  "short-break": "Krótka przerwa",
  "long-break": "Długa przerwa",
};

export function FocusTimer({
  minutes = 25,
  label,
  taskId = null,
  taskTitle = "Skupienie bez zadania",
  mode = "focus",
  compact = false,
}: {
  minutes?: number;
  label?: string;
  taskId?: string | null;
  taskTitle?: string;
  mode?: FocusMode;
  compact?: boolean;
}) {
  const { state, startFocusTimer, pauseFocusTimer, resumeFocusTimer, resetFocusTimer, syncFocusTimer } = useDayForgeStore();
  const [now, setNow] = useState(() => Date.now());
  const timer = state.activeFocusTimer;
  const isRunning = Boolean(timer?.endsAt);
  const initialSeconds = timer?.plannedSeconds ?? Math.max(60, minutes * 60);
  const secondsLeft = timer ? getFocusSecondsLeft(timer, now) : initialSeconds;
  const activeMode = timer?.mode ?? mode;
  const activeLabel = timer ? modeLabels[timer.mode] : (label ?? modeLabels[mode]);
  const progress = Math.min(360, Math.max(0, ((initialSeconds - secondsLeft) / initialSeconds) * 360));
  const size = compact ? 148 : 280;

  useEffect(() => {
    if (!timer?.endsAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [timer?.endsAt]);

  useEffect(() => {
    if (timer?.endsAt && secondsLeft === 0) {
      syncFocusTimer();
      toast.success("Sesja została zapisana w historii skupienia.");
    }
  }, [secondsLeft, syncFocusTimer, timer?.endsAt]);

  const handlePrimaryAction = () => {
    if (!timer) {
      startFocusTimer({ mode, taskId, taskTitle, plannedSeconds: minutes * 60 });
      return;
    }
    if (isRunning) pauseFocusTimer();
    else resumeFocusTimer();
  };

  const buttonText = useMemo(() => {
    if (!timer) return compact ? "Start" : "Rozpocznij skupienie";
    return isRunning ? "Pauza" : "Wznów";
  }, [compact, isRunning, timer]);

  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "h-full" : "justify-center") }>
      <div
        aria-label={`Timer ${activeLabel}. Pozostało ${formatTimer(secondsLeft)}`}
        className="grid place-items-center rounded-full p-[9px] shadow-[0_0_34px_rgba(128,102,255,.18)]"
        role="timer"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `conic-gradient(#8066ff ${progress}deg, rgba(255,255,255,.09) ${progress}deg)`,
        }}
      >
        <div className="grid size-full place-items-center rounded-full border border-white/[0.05] bg-[#121a31]">
          <div>
            <strong className={cn("block font-bold tracking-[-0.075em] text-white", compact ? "text-[27px]" : "text-[56px]")}>{formatTimer(secondsLeft)}</strong>
            <span className={cn("mt-1 block text-[#9da8c0]", compact ? "text-[9px]" : "text-[11px]")}>{activeLabel}</span>
            {timer && !compact ? <span className="mt-1 block max-w-[190px] truncate text-[10px] text-[#bdc6df]">{timer.taskTitle}</span> : null}
          </div>
        </div>
      </div>
      <div className={cn("mt-5 flex w-full gap-2", compact ? "mt-auto pt-4" : "max-w-[360px]") }>
        <Button className="flex-1" onClick={handlePrimaryAction}>
          {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
          {buttonText}
        </Button>
        <Button variant="secondary" size="icon" onClick={() => { resetFocusTimer(); setNow(Date.now()); }} aria-label="Anuluj i zresetuj timer">
          <RotateCcw className="size-4" />
        </Button>
      </div>
      {timer && !compact ? <p className="mt-3 text-[10px] text-[#8f9bb7]">Tryb: {modeLabels[activeMode]}. Timer pozostaje aktywny po odświeżeniu i zostaje objęty synchronizacją, gdy włączysz DayForge Cloud.</p> : null}
    </div>
  );
}
