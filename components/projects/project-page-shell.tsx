"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { getProjects, createProject } from "@/services/projects.client"
import type { Project } from "@/services/projects.client"
import { ProjectCard } from "./project-card"
import { ProjectDetailDrawer } from "./project-detail-drawer"
import { NewProjectDialog } from "./new-project-dialog"
import { FolderKanban, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type ProjectStatusFilter = "all" | Project["status"]

const STATUS_FILTERS: { value: ProjectStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
]

interface TaskCount {
  total: number
  completed: number
}

export function ProjectPageShell({
  initialProjects,
  workspaceId,
  userId,
  initialTaskCounts,
}: {
  initialProjects: Project[]
  workspaceId: string
  userId: string
  initialTaskCounts: Record<string, TaskCount>
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [taskCounts, setTaskCounts] = useState<Record<string, TaskCount>>(initialTaskCounts)
  const [filter, setFilter] = useState<ProjectStatusFilter>("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshProjects = useCallback(async () => {
    const updated = await getProjects(workspaceId)
    setProjects(updated)
  }, [workspaceId])

  const fetchTaskCounts = useCallback(async (projectIds: string[]) => {
    if (projectIds.length === 0) return
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from("tasks")
      .select("project_id, status")
      .in("project_id", projectIds)

    const counts: Record<string, TaskCount> = {}
    for (const id of projectIds) {
      counts[id] = { total: 0, completed: 0 }
    }
    for (const task of data ?? []) {
      const pid = task.project_id as string
      if (!counts[pid]) counts[pid] = { total: 0, completed: 0 }
      counts[pid].total++
      if (task.status === "completed") counts[pid].completed++
    }
    setTaskCounts(counts)
  }, [])

  useEffect(() => {
    const ids = projects.map((p) => p.id)
    fetchTaskCounts(ids)
  }, [projects, fetchTaskCounts])

  const handleCreateProject = useCallback(
    async (data: { name: string; description?: string; status: string; due_date?: string }) => {
      const result = await createProject({
        workspace_id: workspaceId,
        user_id: userId,
        name: data.name,
        description: data.description || null,
        status: data.status as Project["status"],
        due_date: data.due_date || null,
      })
      if (result) {
        await refreshProjects()
      } else {
        toast.error("Failed to create project")
      }
    },
    [workspaceId, userId, refreshProjects],
  )

  const handleProjectUpdated = useCallback(async () => {
    await refreshProjects()
  }, [refreshProjects])

  const handleProjectDeleted = useCallback((_id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== _id))
  }, [])

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-xs text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewProjectDialog onCreateProject={handleCreateProject}>
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Plus size={14} />
            New project
          </span>
        </NewProjectDialog>
      </div>

      <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <FolderKanban size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">No projects yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first project to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const counts = taskCounts[project.id] ?? { total: 0, completed: 0 }
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  taskCount={counts.total}
                  completedTaskCount={counts.completed}
                  onClick={() => {
                    setSelectedProject(project)
                    setDrawerOpen(true)
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      <ProjectDetailDrawer
        project={selectedProject}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  )
}
