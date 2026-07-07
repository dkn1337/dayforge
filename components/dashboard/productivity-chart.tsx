"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export type ProductivityPoint = { day: string; score: number; date?: string };
type Highlight = { label: string; value: string };

export function ProductivityChart({
  data,
  title = "Trend produktywności",
  highlights,
}: {
  data: ProductivityPoint[];
  title?: string;
  highlights: Highlight[];
}) {
  return (
    <Card className="min-h-[300px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-[11px] font-semibold text-[#aa91ff]">Ten tydzień</span>
      </CardHeader>
      <div className="h-[188px]">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="productivityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8066ff" stopOpacity={0.46} />
                <stop offset="100%" stopColor="#8066ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis axisLine={false} dataKey="day" tick={{ fill: "#7180a0", fontSize: 10 }} tickLine={false} />
            <YAxis axisLine={false} domain={[0, 100]} hide tickLine={false} />
            <Tooltip contentStyle={{ background: "#11182c", border: "1px solid rgba(193,205,255,.15)", borderRadius: "10px", fontSize: "11px", color: "#f8f9ff" }} cursor={{ stroke: "rgba(193,205,255,.14)", strokeDasharray: "3 4" }} formatter={(value) => [`${value ?? 0} pkt`, "Ocena dnia"]} labelStyle={{ color: "#aeb8d0" }} />
            <Area dataKey="score" fill="url(#productivityGradient)" stroke="#927aff" strokeLinecap="round" strokeWidth={3} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {highlights.map((highlight) => <div className="rounded-xl bg-white/[0.035] p-2.5" key={highlight.label}><p className="text-[9px] text-[#9da8c3]">{highlight.label}</p><strong className="mt-1 block truncate text-base font-bold tracking-[-0.05em] text-white">{highlight.value}</strong></div>)}
      </div>
    </Card>
  );
}
