import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow ? <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a78aff]">{eyebrow}</p> : null}
        <h1 className="text-[30px] font-bold tracking-[-0.075em] text-white sm:text-[34px]">{title}</h1>
        <p className="mt-2 text-sm text-[#a6afc8]">{description}</p>
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">{actions}</div> : null}
    </div>
  );
}
