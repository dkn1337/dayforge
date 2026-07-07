import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { DemoBanner } from "@/components/ui/demo-banner";
import { PageHeader } from "@/components/ui/page-header";

export default function AnalyticsPage() {
  return <><PageHeader title="Analityka" description="Spójrz wstecz, znajdź wzorce i zaprojektuj lepsze dni." /><DemoBanner /><AnalyticsDashboard /></>;
}
