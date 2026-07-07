import { Suspense } from "react";

import { TasksPageClient } from "@/components/tasks/tasks-page-client";
import { PageHeader } from "@/components/ui/page-header";

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Zadania" description="Zapisz wszystko, ustaw priorytet, przypnij do projektu i przenieś najważniejsze rzeczy do planera." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[18px] bg-white/[0.04]" />}><TasksPageClient /></Suspense>
    </>
  );
}
