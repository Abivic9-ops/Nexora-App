import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { Research, ResearchInsert, ResearchUpdate } from "@/lib/supabase/types"

export async function getResearchItems(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("research")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Research[]
}

export async function getResearchById(id: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").select("*").eq("id", id).single()
  return data as Research | null
}

export async function createResearch(input: ResearchInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").insert(input).select().single()
  return data as Research | null
}

export async function updateResearch(id: string, input: ResearchUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").update(input).eq("id", id).select().single()
  return data as Research | null
}

export async function deleteResearch(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("research").delete().eq("id", id)
}
