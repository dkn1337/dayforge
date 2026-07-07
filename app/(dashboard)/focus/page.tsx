import { FocusWorkspace } from "@/components/focus/focus-workspace";
import { DemoBanner } from "@/components/ui/demo-banner";
import { PageHeader } from "@/components/ui/page-header";

export default function FocusPage() {
  return <><PageHeader title="Skupienie" description="Chroń swoją uwagę. Niech timer dopilnuje obietnicy, którą sobie dałeś." /><DemoBanner /><FocusWorkspace /></>;
}
