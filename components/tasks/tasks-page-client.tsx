"use client";

import { useSearchParams } from "next/navigation";

import { TaskManager } from "@/components/tasks/task-manager";

export function TasksPageClient() {
  const searchParams = useSearchParams();
  return <TaskManager initialQuery={searchParams.get("q") ?? ""} openNewTask={searchParams.get("new") === "1"} />;
}
