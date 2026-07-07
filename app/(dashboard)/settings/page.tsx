import { SettingsPanel } from "@/components/layout/settings-panel";
import { DemoBanner } from "@/components/ui/demo-banner";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return <><PageHeader title="Ustawienia" description="Dopasuj przestrzeń DayForge do rytmu, który naprawdę działa." /><DemoBanner /><SettingsPanel /></>;
}
