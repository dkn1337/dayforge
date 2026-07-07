import { CloudAuthGate } from "@/components/auth/cloud-auth-gate";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CloudAuthGate><DashboardShell>{children}</DashboardShell></CloudAuthGate>;
}
