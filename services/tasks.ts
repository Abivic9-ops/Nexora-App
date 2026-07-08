import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Task, TaskInsert, TaskUpdate } from "@/lib/supabase/types"

export type { Task, TaskInsert, TaskUpdate }
export type TaskWithSubtasks = Task & { subtasks: Task[] }

export async function createTask(
  input: Omit<TaskInsert, "id" | "created_at" | "updated_at">,
): Promise<Task | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...input,
      position: Math.floor(Date.now() / 1000),
    })
    .select("*")
    .single()

  if (error) {
    console.error("createTask error:", error)
    return null
  }

  return data as unknown as Task
}

export async function updateTask(
  id: string,
  updates: TaskUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("updateTask error:", error)
    return false
  }

  return true
}

export async function deleteTask(id: string): Promise<boolean> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("deleteTask error:", error)
    return false
  }

  return true
}

export async function moveTask(
  id: string,
  status: Task["status"],
  position: number,
): Promise<boolean> {
  const supabase = createBrowserClient()

  const updates: TaskUpdate = {
    status,
    position,
    updated_at: new Date().toISOString(),
  }

  if (status === "completed") {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)

  if (error) {
    console.error("moveTask error:", error)
    return false
  }

  return true
}
