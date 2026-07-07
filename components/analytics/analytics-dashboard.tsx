"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck2, Download, Flame, Target, Timer } from "lucide-react";
import { toast } from "sonner";

import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { activeDaysInLastThirtyDays, averageFocusSecondsPerActiveDay, bestFocusHour, bestFocusSessionSeconds, focusLastFourWeeks, getDailyMetrics, lastThirtyDaysActivity, longestHabitStreak, totalFocusSeconds, weeklyPlanCompletion } from "@/lib/analytics";
import { toDateKey } from "@/lib/date-utils";
import { formatDuration } from "@/lib/utils";

const heatClasses = ["bg-[#8066ff]/8", "bg-[#8066ff]/24", "bg-[#8066ff]/47", "bg-[#8066ff]/74", "bg-[linear-gradient(135deg,#8066ff,#4e9cff)]"];

export function AnalyticsDashboard() {
  const { state } = useDayForgeStore();
  const focusData = focusLastFourWeeks(state);
  const heatmap = lastThirtyDaysActivity(state);
  const totalFocus = totalFocusSeconds(state);
  const averageFocus = averageFocusSecondsPerActiveDay(state);
  const bestSession = bestFocusSessionSeconds(state);
  const longestStreak = longestHabitStreak(state);
  const planCompletion = weeklyPlanCompletion(state);
  const todayMetrics = getDailyMetrics(state, toDateKey(new Date()));

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      dailyScore: todayMetrics.score,
      focusSeconds: totalFocus,
      activeDaysLastThirtyDays: activeDaysInLastThirtyDays(state),
      habitStreak: longestStreak,
      planCompletion,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dayforge-raport.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Pobrano lokalny raport DayForge.");
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><Button variant="secondary" onClick={exportReport}><Download className="size-4" />Pobierz raport</Button></div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="min-h-[314px]">
          <CardHeader><CardTitle>Czas skupienia</CardTitle><span className="text-[11px] font-semibold text-[#aa91ff]">Ostatnie 4 tygodnie</span></CardHeader>
          <div className="h-[190px]"><ResponsiveContainer height="100%" width="100%"><AreaChart data={focusData} margin={{ top: 10, right: 4, left: -26, bottom: 0 }}><defs><linearGradient id="focusGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4e9cff" stopOpacity={0.43} /><stop offset="100%" stopColor="#4e9cff" stopOpacity={0} /></linearGradient></defs><XAxis axisLine={false} dataKey="week" tick={{ fill: "#7180a0", fontSize: 10 }} tickLine={false} /><YAxis axisLine={false} hide tickLine={false} /><Tooltip contentStyle={{ background: "#11182c", border: "1px solid rgba(193,205,255,.15)", borderRadius: "10px", fontSize: "11px", color: "#f8f9ff" }} cursor={{ stroke: "rgba(193,205,255,.14)", strokeDasharray: "3 4" }} formatter={(value) => [`${value ?? 0} min`, "Skupienie"]} labelStyle={{ color: "#aeb8d0" }} /><Area dataKey="minutes" fill="url(#focusGradient)" name="Minuty" stroke="#5fa8ff" strokeLinecap="round" strokeWidth={3} type="monotone" /></AreaChart></ResponsiveContainer></div>
          <div className="mt-3 grid grid-cols-3 gap-2"><Stat label="Łączny focus" value={formatDuration(Math.round(totalFocus / 60))} /><Stat label="Średni aktywny dzień" value={formatDuration(Math.round(averageFocus / 60))} /><Stat label="Najlepsza sesja" value={formatDuration(Math.round(bestSession / 60))} /></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mapa konsekwencji</CardTitle><span className="text-[11px] font-semibold text-[#aa91ff]">Ostatnie 30 dni</span></CardHeader>
          <div className="grid grid-cols-7 gap-1.5">{heatmap.map((day) => <span aria-label={`Aktywność ${day.date}: poziom ${day.level}`} className={`aspect-square rounded-md ${heatClasses[day.level]}`} key={day.date} title={`${day.date} · ocena ${day.score}/100`} />)}</div>
          <p className="mt-5 text-xs leading-5 text-[#98a4bf]">Wykonałeś przynajmniej jedno mierzalne działanie w <strong className="font-semibold text-[#e6e9f6]">{activeDaysInLastThirtyDays(state)} z 30 dni</strong>. Poziom mapy wynika z ukończonych zadań, nawyków oraz sesji skupienia.</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#8f9bb7]"><span>Nisko</span>{heatClasses.map((color, index) => <i className={`size-3 rounded-[4px] ${color}`} key={`legend-${index}`} />)}<span>Wysoko</span></div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Insight icon={Timer} label="Najmocniejsza pora" title={bestFocusHour(state)} copy="To przedział, w którym zebrałeś najwięcej ukończonego focusu." tone="blue" />
        <Insight icon={Flame} label="Najdłuższa seria" title={`${longestStreak.days} dni`} copy={longestStreak.days ? `${longestStreak.habitName} utrzymuje obecnie Twoją najdłuższą serię.` : "Oznacz pierwszy nawyk, aby rozpocząć serię."} tone="yellow" />
        <Insight icon={Target} label="Plan vs wykonanie" title={`${planCompletion}%`} copy="To odsetek zaplanowanych w tym tygodniu zadań, które zostały ukończone." tone="purple" />
      </div>
      <Card className="mt-4 flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#42d7a5]/12 text-[#7ee6c1]"><CalendarCheck2 className="size-5" /></span><div><h2 className="text-sm font-semibold text-white">Od danych do decyzji.</h2><p className="mt-1 text-xs text-[#9ca8c2]">Dzisiejsza ocena: {todayMetrics.score}/100, liczona tylko z realnych wpisów lokalnych.</p></div></div>
        <Button variant="secondary" onClick={() => toast.info("Ocena dnia = zadania 40% + skupienie 35% + nawyki 25%. Brak danych nie jest uzupełniany sztucznymi punktami.")}>Jak liczona jest ocena dnia?</Button>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.035] p-2.5"><p className="text-[9px] text-[#9da8c3]">{label}</p><strong className="mt-1 block text-base font-bold tracking-[-0.05em] text-white">{value}</strong></div>;
}

function Insight({ icon: Icon, label, title, copy, tone }: { icon: typeof Timer; label: string; title: string; copy: string; tone: "blue" | "yellow" | "purple" }) {
  const toneClass = { blue: "bg-[#4e9cff]/13 text-[#88c0ff]", yellow: "bg-[#ffcb62]/13 text-[#ffd57e]", purple: "bg-[#8066ff]/13 text-[#c3b4ff]" }[tone];
  return <Card><span className={`grid size-8 place-items-center rounded-lg ${toneClass}`}><Icon className="size-4" /></span><p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8e99b4]">{label}</p><h2 className="mt-1 text-xl font-bold tracking-[-0.05em] text-white">{title}</h2><p className="mt-2 text-xs leading-5 text-[#9ba6bf]">{copy}</p></Card>;
}
