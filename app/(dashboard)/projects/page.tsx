import { ProjectManager } from "@/components/projects/project-manager";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projekty" description="Nadaj pracy kontekst. Projekty pomagają zamienić listę zadań w widoczny postęp." />
      <ProjectManager />
    </>
  );
}
