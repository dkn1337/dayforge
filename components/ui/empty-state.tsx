import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.018] px-6 py-10 text-center">
      <span className="mb-4 grid size-11 place-items-center rounded-xl border border-[#a98fff]/30 bg-[#8066ff]/15 text-[#b8a8ff]">
        <Plus className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-[#97a3bf]">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" size="sm" onClick={onAction}>
          <Plus className="size-3.5" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
