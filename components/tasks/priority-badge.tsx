import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Priority } from "@/types/dayforge";

const priorityCopy: Record<Priority, string> = {
  high: "Wysoki",
  medium: "Średni",
  low: "Niski",
};

const priorityClasses: Record<Priority, string> = {
  high: "bg-[#ff718d]/13 text-[#ff9cad]",
  medium: "bg-[#ffcb62]/13 text-[#ffd57e]",
  low: "bg-[#42d7a5]/13 text-[#7ee6c1]",
};

export function PriorityBadge({ priority, showIcon = false }: { priority: Priority; showIcon?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold", priorityClasses[priority])}>
      {showIcon ? <Flag className="size-3" /> : null}
      {priorityCopy[priority]}
    </span>
  );
}
