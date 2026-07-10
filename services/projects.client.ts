import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/supabase/types"

export type { Project, ProjectInsert, ProjectUpdate }

export async function getProjects(workspaceId: string): Promise<Project[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Project[]
}

export async function createProject(
  input: Omit<ProjectInsert, "id" | "created_at" | "updated_at">,
): Promise<Project | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createProject error:", error)
    return null
  }
  return data as unknown as Project
}

export async function updateProject(
  id: string,
  updates: ProjectUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateProject error:", error)
    return false
  }
  return true
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) {
    console.error("deleteProject error:", error)
    return false
  }
  return true
}
