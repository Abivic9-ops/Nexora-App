"use client"

import type { Project } from "@/services/projects.client"
import type { Task } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import { FolderKanban, Calendar, CheckCircle2, Pause, Archive } from "lucide-react"
import { format, isPast } from "date-fns"

const STATUS_CONFIG: Record<
  Project["status"],
  { label: string; color: string; icon: typeof FolderKanban }
> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  paused: { label: "Paused", color: "bg-amber-500/10 text-amber-500", icon: Pause },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-500", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground", icon: Archive },
}

interface ProjectCardProps {
  project: Project
  taskCount: number
  completedTaskCount: number
  onClick: () => void
}

export function ProjectCard({
  project,
  taskCount,
  completedTaskCount,
  onClick,
}: ProjectCardProps) {
  const status = STATUS_CONFIG[project.status]
  const StatusIcon = status.icon
  const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0
  const isOverdue = project.due_date && isPast(new Date(project.due_date)) && project.status === "active"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border/40 bg-card p-5 text-left transition-all hover:border-border hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderKanban size={18} />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            status.color,
          )}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
      )}

      <div className="mt-auto pt-4">
        {taskCount > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{completedTaskCount}/{taskCount} tasks</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {project.due_date && (
            <span className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
              <Calendar size={11} />
              {format(new Date(project.due_date), "MMM d, yyyy")}
            </span>
          )}
          {taskCount === 0 && <span>No tasks yet</span>}
        </div>
      </div>
    </button>
  )
}
