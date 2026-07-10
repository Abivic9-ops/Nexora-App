import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Research, ResearchInsert, ResearchUpdate } from "@/lib/supabase/types"

export type { Research, ResearchInsert, ResearchUpdate }

export async function getResearchItems(workspaceId: string): Promise<Research[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("research")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Research[]
}

export async function createResearch(input: Omit<ResearchInsert, "id" | "created_at" | "updated_at">): Promise<Research | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("research")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createResearch error:", error)
    return null
  }
  return data as unknown as Research
}

export async function updateResearch(id: string, updates: ResearchUpdate): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("research")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateResearch error:", error)
    return false
  }
  return true
}

export async function deleteResearch(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("research").delete().eq("id", id)
  if (error) {
    console.error("deleteResearch error:", error)
    return false
  }
  return true
}
