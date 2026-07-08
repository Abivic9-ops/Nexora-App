"use client"

import { GripVertical, Calendar, ChevronDown, ChevronRight, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskWithSubtasks } from "@/services/tasks"
import { PriorityChip } from "@/components/ui/priority-chip"

const PRIORITY_MAP: Record<string, 1 | 2 | 3 | 4> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function isOverdue(dateStr: string | null, status: string): boolean {
  if (!dateStr || status === "completed") return false
  return new Date(dateStr) < new Date()
}

export function TaskCard({
  task,
  onSelect,
  onToggleSubtask,
  compact,
}: {
  task: TaskWithSubtasks
  onSelect: (id: string) => void
  onToggleSubtask?: (id: string, completed: boolean) => void
  compact?: boolean
}) {
  const dueLabel = formatDate(task.due_date)
  const overdue = isOverdue(task.due_date, task.status)
  const hasSubtasks = task.subtasks.length > 0
  const completedSubtasks = task.subtasks.filter((s) => s.status === "completed").length

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task.id)}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(task.id) }}
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-3 text-left transition-all hover:border-border hover:shadow-sm",
        task.status === "completed"
          ? "border-border/30 opacity-60"
          : "border-border/40",
        compact && "p-2.5",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60">
          <GripVertical size={12} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <PriorityChip level={PRIORITY_MAP[task.priority] ?? 4} />
            <p className={cn(
              "truncate text-sm font-medium",
              task.status === "completed" && "line-through text-muted-foreground",
            )}>
              {task.title}
            </p>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            {dueLabel && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px]",
                overdue ? "text-red-500" : "text-muted-foreground/60",
              )}>
                <Calendar size={10} />
                {dueLabel}
              </span>
            )}
            {hasSubtasks && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <CheckSquare size={10} />
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>

          {hasSubtasks && !compact && (
            <div className="mt-2 space-y-1 border-t border-border/20 pt-2">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleSubtask?.(sub.id, sub.status !== "completed")
                    }}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      sub.status === "completed"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/50 hover:border-primary/50",
                    )}
                  >
                    {sub.status === "completed" && <CheckSquare size={10} />}
                  </button>
                  <p className={cn(
                    "flex-1 truncate text-xs",
                    sub.status === "completed" && "line-through text-muted-foreground",
                  )}>
                    {sub.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TaskListItem({
  task,
  onSelect,
  onToggleSubtask,
  depth,
}: {
  task: TaskWithSubtasks
  onSelect: (id: string) => void
  onToggleSubtask?: (id: string, completed: boolean) => void
  depth?: number
}) {
  const dueLabel = formatDate(task.due_date)
  const overdue = isOverdue(task.due_date, task.status)
  const hasSubtasks = task.subtasks.length > 0
  const completedSubtasks = task.subtasks.filter((s) => s.status === "completed").length
  const allSubtasksDone = hasSubtasks && completedSubtasks === task.subtasks.length

  return (
    <div style={{ marginLeft: depth ? depth * 20 : 0 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(task.id)}
        onKeyDown={(e) => { if (e.key === "Enter") onSelect(task.id) }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50 cursor-pointer",
          task.status === "completed" && "opacity-50",
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSubtask?.(task.id, task.status !== "completed")
          }}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
            task.status === "completed"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/50 hover:border-primary/50",
          )}
        >
          {task.status === "completed" && <CheckSquare size={10} />}
        </button>

        {hasSubtasks && (
          <ChevronRight size={12} className="shrink-0 text-muted-foreground" />
        )}

        <p className={cn(
          "flex-1 truncate text-sm",
          task.status === "completed" && "line-through text-muted-foreground",
        )}>
          {task.title}
        </p>

        <PriorityChip level={PRIORITY_MAP[task.priority] ?? 4} />

        {dueLabel && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs whitespace-nowrap",
            overdue ? "text-red-500" : "text-muted-foreground/60",
          )}>
            <Calendar size={11} />
            {dueLabel}
          </span>
        )}

        {hasSubtasks && (
          <span className={cn(
            "text-xs whitespace-nowrap",
            allSubtasksDone ? "text-primary" : "text-muted-foreground/60",
          )}>
            {completedSubtasks}/{task.subtasks.length}
          </span>
        )}
      </div>

      {hasSubtasks && task.subtasks.map((sub) => (
        <TaskListItem
          key={sub.id}
          task={{ ...sub, subtasks: [] }}
          onSelect={onSelect}
          onToggleSubtask={onToggleSubtask}
          depth={(depth ?? 0) + 1}
        />
      ))}
    </div>
  )
}
