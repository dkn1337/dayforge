import { HabitManager } from "@/components/habits/habit-manager";
import { DemoBanner } from "@/components/ui/demo-banner";
import { PageHeader } from "@/components/ui/page-header";

export default function HabitsPage() {
  return <><PageHeader title="Nawyki" description="Pokaż konsekwencję. Jedna mała czynność, powtarzana dobrze." /><DemoBanner /><HabitManager /></>;
}
