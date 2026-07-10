"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PriorityChip } from "@/components/ui/priority-chip"
import { Calendar, Trash2, X, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskWithSubtasks } from "@/services/tasks"
import { updateTask, deleteTask, createTask, moveTask } from "@/services/tasks"

const PRIORITY_MAP: Record<string, 1 | 2 | 3 | 4> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const

export function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
}: {
  task: TaskWithSubtasks | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
  onTaskDeleted: (id: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState("")
  const [addingSubtask, setAddingSubtask] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      })
      setSubtaskTitle("")
    }
  }, [task, reset])

  const title = watch("title")

  const onSubmit = handleSubmit(async (values) => {
    if (!task) return
    setSaving(true)
    const ok = await updateTask(task.id, {
      title: values.title,
      description: values.description || null,
      due_date: values.due_date || null,
    })
    if (ok) {
      toast.success("Task updated")
      onTaskUpdated()
    } else {
      toast.error("Failed to save")
    }
    setSaving(false)
  })

  const handleDelete = async () => {
    if (!task) return
    setDeleting(true)
    const ok = await deleteTask(task.id)
    if (ok) {
      toast.success("Task deleted")
      onTaskDeleted(task.id)
      onOpenChange(false)
    } else {
      toast.error("Failed to delete")
    }
    setDeleting(false)
  }

  const handlePriorityChange = async (priority: string) => {
    if (!task) return
    const ok = await updateTask(task.id, { priority: priority as TaskWithSubtasks["priority"] })
    if (ok) {
      toast.success("Priority updated")
      onTaskUpdated()
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!task) return
    const ok = await updateTask(task.id, {
      status: status as TaskWithSubtasks["status"],
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    if (ok) {
      toast.success("Status updated")
      onTaskUpdated()
    }
  }

  const handleAddSubtask = async () => {
    if (!task || !subtaskTitle.trim()) return
    setAddingSubtask(true)
    const result = await createTask({
      workspace_id: task.workspace_id,
      user_id: task.user_id,
      title: subtaskTitle.trim(),
      parent_task_id: task.id,
      status: "backlog",
      priority: "medium",
    })
    if (result) {
      toast.success("Subtask added")
      setSubtaskTitle("")
      onTaskUpdated()
    } else {
      toast.error("Failed to add subtask")
    }
    setAddingSubtask(false)
  }

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "backlog" : "completed"
    const ok = await moveTask(subtaskId, newStatus as TaskWithSubtasks["status"], 0)
    if (ok) {
      onTaskUpdated()
    }
  }

  if (!task) return null

  const STATUS_OPTIONS = [
    { value: "backlog", label: "Backlog" },
    { value: "in_progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "completed", label: "Completed" },
  ]

  const completedSubtasks = task.subtasks.filter((s) => s.status === "completed").length

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="w-full sm:max-w-lg">
        <DrawerHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">Task details</DrawerTitle>
            <DrawerClose render={<button type="button" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" />}>
              <X size={14} />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="task-form" onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <Input
                {...register("title")}
                className="border-0 bg-transparent px-0 text-lg font-semibold text-foreground shadow-none focus-visible:ring-0"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Description</label>
              <Textarea
                {...register("description")}
                placeholder="Add description..."
                className="mt-1 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground">Status</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusChange(opt.value)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                        task.status === opt.value
                          ? "border-primary/50 bg-primary/5 text-primary"
                          : "border-border/40 text-muted-foreground hover:border-border",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Priority</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePriorityChange(opt.value)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                        task.priority === opt.value
                          ? "border-primary/50 bg-primary/5 text-primary"
                          : "border-border/40 text-muted-foreground hover:border-border",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="drawer-due-date" className="text-xs font-medium text-foreground">
                Due date
              </label>
              <div className="relative mt-1">
                <Calendar size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="drawer-due-date"
                  type="date"
                  className="pl-8"
                  {...register("due_date")}
                />
              </div>
            </div>
          </form>

          <div className="mt-6 border-t border-border/40 pt-5">
            <label className="text-xs font-medium text-foreground">
              Subtasks
              {task.subtasks.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({completedSubtasks}/{task.subtasks.length})
                </span>
              )}
            </label>

            <div className="mt-2 space-y-1">
              {task.subtasks.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground/60">No subtasks yet</p>
              )}
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/50">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id, sub.status)}
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
                    "flex-1 truncate text-sm",
                    sub.status === "completed" && "line-through text-muted-foreground",
                  )}>
                    {sub.title}
                  </p>
                  <PriorityChip level={PRIORITY_MAP[sub.priority] ?? 4} />
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Input
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add subtask..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSubtask}
                disabled={!subtaskTitle.trim() || addingSubtask}
                className="h-8 shrink-0"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-5 py-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-400"
          >
            <Trash2 size={13} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <div className="flex items-center gap-2">
            <DrawerClose>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="task-form"
              size="sm"
              disabled={saving || !title.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
