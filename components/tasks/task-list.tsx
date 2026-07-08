"use client"

import type { TaskWithSubtasks } from "@/services/tasks"
import { TaskListItem } from "./task-card"

const STATUS_GROUPS = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
]

export function TaskList({
  tasks,
  onSelectTask,
  onToggleSubtask,
}: {
  tasks: TaskWithSubtasks[]
  onSelectTask: (id: string) => void
  onToggleSubtask: (id: string, completed: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {STATUS_GROUPS.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.id)
        if (groupTasks.length === 0) return null

        return (
          <div key={group.id}>
            <div className="mb-2 flex items-center gap-2 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {group.label}
              </span>
              <span className="text-xs text-muted-foreground/60">
                {groupTasks.length}
              </span>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/30">
              {groupTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onSelect={onSelectTask}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          </div>
        )
      })}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Create your first task to get started
          </p>
        </div>
      )}
    </div>
  )
}
