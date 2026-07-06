import { createClient as createServerClient } from "@/lib/supabase/server"
import type { Task, TaskInsert, TaskUpdate } from "@/lib/supabase/types"

export async function getTasks(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true })
  return (data ?? []) as Task[]
}

export async function getTaskById(id: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("tasks").select("*").eq("id", id).single()
  return data as Task | null
}

export async function getTasksByProject(projectId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
  return (data ?? []) as Task[]
}

export async function getTasksByStatus(workspaceId: string, status: Task["status"]) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", status)
    .order("position", { ascending: true })
  return (data ?? []) as Task[]
}

export async function createTask(input: TaskInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("tasks").insert(input).select().single()
  return data as Task | null
}

export async function updateTask(id: string, input: TaskUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("tasks").update(input).eq("id", id).select().single()
  return data as Task | null
}

export async function deleteTask(id: string) {
  const supabase = await createServerClient()
  await supabase.from("tasks").delete().eq("id", id)
}
