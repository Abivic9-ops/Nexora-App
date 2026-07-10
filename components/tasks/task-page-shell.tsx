"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Task, TaskWithSubtasks } from "@/services/tasks"
import { createTask, moveTask } from "@/services/tasks"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { KanbanBoard } from "./kanban-board"
import { TaskList } from "./task-list"
import { TaskDetailDrawer } from "./task-detail-drawer"
import { NewTaskDialog } from "./new-task-dialog"
import { LayoutGrid, List, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER = { backlog: 0, in_progress: 1, review: 2, completed: 3 }

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (a.position !== b.position) return a.position - b.position
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })
}

async function fetchTasks(workspaceId: string, userId: string): Promise<TaskWithSubtasks[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("position", { ascending: true })

  const all = (data ?? []) as Task[]
  const parents = all.filter((t) => !t.parent_task_id)
  const childMap = new Map<string, Task[]>()
  for (const t of all) {
    if (t.parent_task_id) {
      const children = childMap.get(t.parent_task_id) ?? []
      children.push(t)
      childMap.set(t.parent_task_id, sortTasks(children))
    }
  }

  return sortTasks(parents).map((p) => ({
    ...p,
    subtasks: childMap.get(p.id) ?? [],
  }))
}

export function TaskPageShell({
  initialTasks,
  workspaceId,
  userId,
}: {
  initialTasks: TaskWithSubtasks[]
  workspaceId: string
  userId: string
}) {
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>(initialTasks)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [selectedTask, setSelectedTask] = useState<TaskWithSubtasks | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshTasks = useCallback(async () => {
    const updated = await fetchTasks(workspaceId, userId)
    setTasks(updated)
  }, [workspaceId, userId])

  const handleSelectTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
      ?? tasks.flatMap((t) => t.subtasks.map((s) => ({ ...s, subtasks: [] as TaskWithSubtasks[] }))).find((s) => s.id === id)
    if (task) {
      setSelectedTask(task)
      setDrawerOpen(true)
    }
  }, [tasks])

  const handleMoveTask = useCallback(async (id: string, status: string, position: number) => {
    const prev = [...tasks]
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === id ? { ...t, status: status as TaskWithSubtasks["status"], position } : t,
      ),
    )
    const ok = await moveTask(id, status as TaskWithSubtasks["status"], position)
    if (!ok) {
      setTasks(prev)
      toast.error("Failed to move task")
    }
  }, [])

  const handleToggleSubtask = useCallback(async (id: string, completed: boolean) => {
    const status = completed ? "completed" : "backlog"
    const ok = await moveTask(id, status as TaskWithSubtasks["status"], 0)
    if (!ok) {
      toast.error("Failed to update subtask")
    }
    await refreshTasks()
  }, [refreshTasks])

  const handleCreateTask = useCallback(async (data: { title: string; description?: string; priority: string; due_date?: string; status: string }) => {
    const result = await createTask({
      workspace_id: workspaceId,
      user_id: userId,
      title: data.title,
      description: data.description || null,
      priority: data.priority as TaskWithSubtasks["priority"],
      status: data.status as TaskWithSubtasks["status"],
      due_date: data.due_date || null,
    })
    if (result) {
      await refreshTasks()
    } else {
      toast.error("Failed to create task")
    }
  }, [workspaceId, userId, refreshTasks])

  const handleTaskUpdated = useCallback(async () => {
    await refreshTasks()
  }, [refreshTasks])

  const handleTaskDeleted = useCallback((_id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== _id))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-xs text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border/40">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                view === "kanban"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid size={13} />
              Board
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                view === "list"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List size={13} />
              List
            </button>
          </div>

          <NewTaskDialog
            defaultStatus="backlog"
            onCreateTask={handleCreateTask}
          >
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
              <Plus size={14} />
              New task
            </span>
          </NewTaskDialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {view === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onMoveTask={handleMoveTask}
            onToggleSubtask={handleToggleSubtask}
            onNewTask={() => {}}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  )
}
