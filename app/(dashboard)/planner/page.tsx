"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { WeeklyPlanner } from "@/components/planner/weekly-planner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function PlannerPage() {
  return (
    <>
      <PageHeader title="Planer tygodniowy" description="Zarezerwuj czas na to, co naprawdę ważne. Bloki działają lokalnie i można je przeciągać po siatce." actions={<Button variant="secondary" onClick={() => toast.info("Eksport pojawi się po dodaniu synchronizacji i raportów.")}><Download className="size-4" />Eksportuj</Button>} />
      <WeeklyPlanner />
    </>
  );
}
