"use client";

import { Archive, FolderKanban, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useDayForgeStore } from "@/components/providers/dayforge-store-provider";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/dayforge";

const colorClasses = {
  purple: "from-[#8066ff]/30 to-[#8066ff]/5 text-[#d6ccff] ring-[#8066ff]/30",
  blue: "from-[#4e9cff]/30 to-[#4e9cff]/5 text-[#d8ebff] ring-[#4e9cff]/30",
  green: "from-[#42d7a5]/30 to-[#42d7a5]/5 text-[#d9fff2] ring-[#42d7a5]/30",
  yellow: "from-[#ffcb62]/30 to-[#ffcb62]/5 text-[#fff1cc] ring-[#ffcb62]/30",
  pink: "from-[#ff718d]/30 to-[#ff718d]/5 text-[#ffe1e8] ring-[#ff718d]/30",
};

export function ProjectManager() {
  const { state, createProject, updateProject, archiveProject, deleteProject } = useDayForgeStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [showArchived, setShowArchived] = useState(false);

  const projects = useMemo(() => state.projects.filter((project) => showArchived ? project.archived : !project.archived), [showArchived, state.projects]);

  const openCreate = () => { setEditingProject(undefined); setDialogOpen(true); };
  const openEdit = (project: Project) => { setEditingProject(project); setDialogOpen(true); };

  return (
    <>
      <Card>
        <CardHeader className="flex-col items-stretch sm:flex-row sm:items-center"><div><CardTitle>Twoje projekty</CardTitle><p className="mt-1 text-xs text-[#8f9bb7]">Nadaj zadaniom kontekst, aby szybciej widzieć postęp.</p></div><Button size="sm" onClick={openCreate}><Plus className="size-3.5" />Nowy projekt</Button></CardHeader>
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3"><span className="text-[11px] text-[#8f9bb7]">{projects.length} {showArchived ? "zarchiwizowanych" : "aktywnych"} projektów</span><button className="text-[11px] font-semibold text-[#ae98ff] hover:text-white" onClick={() => setShowArchived((current) => !current)}>{showArchived ? "Pokaż aktywne" : "Pokaż archiwum"}</button></div>
        {projects.length === 0 ? <EmptyState title={showArchived ? "Archiwum jest puste" : "Nie masz jeszcze projektów"} description="Dodaj pierwszy projekt i przypinaj do niego zadania." actionLabel="Dodaj projekt" onAction={openCreate} /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => {
          const taskCount = state.tasks.filter((task) => task.projectId === project.id && task.status !== "completed").length;
          const completedCount = state.tasks.filter((task) => task.projectId === project.id && task.status === "completed").length;
          return <article key={project.id} className={cn("group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-4 ring-1", colorClasses[project.color])}>
            <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100"><Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(project)} aria-label={`Edytuj ${project.name}`}><MoreHorizontal className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8" onClick={() => { archiveProject(project.id); toast.success(project.archived ? "Projekt przywrócony." : "Projekt przeniesiony do archiwum."); }} aria-label={project.archived ? `Przywróć ${project.name}` : `Archiwizuj ${project.name}`}><Archive className="size-3.5" /></Button><Button variant="ghost" size="icon" className="size-8" onClick={() => { deleteProject(project.id); toast.success("Projekt usunięty. Zadania pozostały bez przypisanego projektu."); }} aria-label={`Usuń ${project.name}`}><Trash2 className="size-3.5 text-[#ffb6c3]" /></Button></div>
            <FolderKanban className="size-5" /><h3 className="mt-8 truncate text-base font-bold tracking-[-0.04em]">{project.name}</h3><div className="mt-5 flex items-end justify-between"><div><p className="text-2xl font-black tracking-[-0.08em]">{taskCount}</p><p className="text-[10px] opacity-70">otwartych zadań</p></div><p className="text-right text-[11px] opacity-80"><b className="block text-sm">{completedCount}</b>ukończone</p></div>
          </article>;
        })}</div>}
      </Card>
      <ProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editingProject} onSave={(values) => { if (editingProject) { updateProject(editingProject.id, values); toast.success("Projekt zaktualizowany."); } else { createProject(values); toast.success("Dodano nowy projekt."); } }} />
    </>
  );
}
