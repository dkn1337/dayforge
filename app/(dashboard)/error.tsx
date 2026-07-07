"use client";

import { useEffect } from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="panel flex min-h-96 flex-col items-center justify-center rounded-[22px] px-6 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#ff718d]/12 text-[#ff9cad]">
        <TriangleAlert className="size-5" />
      </span>
      <h1 className="mt-5 text-xl font-bold tracking-[-0.05em] text-white">Coś przerwało rytm dnia.</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#a6afc8]">Nie udało się wczytać tej części DayForge. Spróbuj ponownie — dane demonstracyjne pozostają bezpieczne.</p>
      <Button className="mt-5" onClick={reset}>
        <RefreshCcw className="size-4" />
        Spróbuj ponownie
      </Button>
    </section>
  );
}
