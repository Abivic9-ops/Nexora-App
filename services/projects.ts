import { createClient as createServerClient } from "@/lib/supabase/server"

import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/supabase/types"

export async function getProjects(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Project[]
}

export async function getProjectById(id: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("projects").select("*").eq("id", id).single()
  return data as Project | null
}

export async function getProjectsByStatus(workspaceId: string, status: Project["status"]) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", status)
    .order("created_at", { ascending: false })
  return (data ?? []) as Project[]
}

export async function createProject(input: ProjectInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("projects").insert(input).select().single()
  return data as Project | null
}

export async function updateProject(id: string, input: ProjectUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("projects").update(input).eq("id", id).select().single()
  return data as Project | null
}

export async function deleteProject(id: string) {
  const supabase = await createServerClient()
  await supabase.from("projects").delete().eq("id", id)
}
