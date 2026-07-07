import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("panel rounded-[18px] p-4 sm:p-[17px]", className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-sm font-semibold tracking-[-0.035em] text-[#f7f8ff]", className)} {...props}>
      {children}
    </h2>
  );
}
