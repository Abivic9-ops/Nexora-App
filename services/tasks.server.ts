import { createClient as createServerClient } from "@/lib/supabase/server"
import type { Task, TaskWithSubtasks } from "@/services/tasks"

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER = { backlog: 0, in_progress: 1, review: 2, completed: 3 }

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (a.position !== b.position) return a.position - b.position
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })
}

export async function getTasks(workspaceId: string, userId: string): Promise<TaskWithSubtasks[]> {
  const supabase = await createServerClient()

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

export async function getTaskById(taskId: string): Promise<TaskWithSubtasks | null> {
  const supabase = await createServerClient()

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single()

  if (!task) return null

  const { data: subtasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("parent_task_id", taskId)
    .order("position", { ascending: true })

  return {
    ...(task as Task),
    subtasks: sortTasks((subtasks ?? []) as Task[]),
  }
}
