import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses = {
  purple: "bg-[#8066ff]/14 text-[#bcaaff]",
  blue: "bg-[#4e9cff]/14 text-[#88c0ff]",
  green: "bg-[#42d7a5]/14 text-[#7ee6c1]",
  yellow: "bg-[#ffcb62]/14 text-[#ffd57e]",
};

export function KpiCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "purple",
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <Card className="min-h-[132px] p-4">
      <div className="flex items-center justify-between gap-3 text-[11px] text-[#aeb8d0]">
        <span>{label}</span>
        <span className={cn("grid size-7 place-items-center rounded-lg", toneClasses[tone])}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
      </div>
      <strong className="mt-4 block text-[28px] font-bold tracking-[-0.075em] text-white">{value}</strong>
      <p className={cn("mt-1 text-[10px]", tone === "yellow" ? "text-[#ffcf72]" : "text-[#61dfb5]")}>{caption}</p>
    </Card>
  );
}
