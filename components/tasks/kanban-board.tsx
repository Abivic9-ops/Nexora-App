"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { TaskWithSubtasks } from "@/services/tasks"
import { TaskCard } from "./task-card"
import { Plus } from "lucide-react"

const COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
]

function SortableTaskCard({
  task,
  onSelect,
  onToggleSubtask,
}: {
  task: TaskWithSubtasks
  onSelect: (id: string) => void
  onToggleSubtask: (id: string, completed: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onSelect={onSelect}
        onToggleSubtask={onToggleSubtask}
      />
    </div>
  )
}

export function KanbanBoard({
  tasks,
  onSelectTask,
  onMoveTask,
  onToggleSubtask,
  onNewTask,
}: {
  tasks: TaskWithSubtasks[]
  onSelectTask: (id: string) => void
  onMoveTask: (id: string, status: string, position: number) => void
  onToggleSubtask: (id: string, completed: boolean) => void
  onNewTask: (status: string) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const activeTask: TaskWithSubtasks | null = activeId
    ? tasks.find((t) => t.id === activeId)
      ?? tasks.flatMap((t) => t.subtasks.map((s) => ({ ...s, subtasks: [] as TaskWithSubtasks[] }))).find((s) => s.id === activeId)
      ?? null
    : null

  const getColumnTasks = useCallback(
    (status: string) =>
      tasks
        .filter((t) => t.status === status && !t.parent_task_id)
        .sort((a, b) => a.position - b.position),
    [tasks],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const activeTaskData = tasks.find((t) => t.id === active.id)
      if (!activeTaskData) return

      const overId = over.id as string
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return

      if (activeTaskData.status !== overTask.status) {
        const columnTasks = getColumnTasks(overTask.status)
        const overIndex = columnTasks.findIndex((t) => t.id === overId)
        const position = overIndex >= 0 ? overIndex : columnTasks.length
        onMoveTask(activeTaskData.id, overTask.status, position)
      } else {
        const columnTasks = getColumnTasks(activeTaskData.status)
        const overIndex = columnTasks.findIndex((t) => t.id === overId)
        if (overIndex >= 0) {
          onMoveTask(activeTaskData.id, activeTaskData.status, overIndex)
        }
      }
    },
    [tasks, getColumnTasks, onMoveTask],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid flex-1 grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = getColumnTasks(col.id)
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-xl border border-border/40 bg-card/30"
            >
              <div className="flex items-center justify-between border-b border-border/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    col.id === "backlog" && "bg-muted-foreground",
                    col.id === "in_progress" && "bg-blue-500",
                    col.id === "review" && "bg-amber-500",
                    col.id === "completed" && "bg-emerald-500",
                  )} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNewTask(col.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Plus size={13} />
                </button>
              </div>

              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 p-3">
                  {columnTasks.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground/40">
                      Drop tasks here
                    </p>
                  )}
                  {columnTasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onSelect={onSelectTask}
                      onToggleSubtask={onToggleSubtask}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-72 opacity-90">
            <TaskCard task={activeTask as TaskWithSubtasks} onSelect={() => {}} compact />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
