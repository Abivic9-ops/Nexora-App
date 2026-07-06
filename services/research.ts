import { createClient as createServerClient } from "@/lib/supabase/server"

import type { Research, ResearchInsert, ResearchUpdate } from "@/lib/supabase/types"

export async function getResearchItems(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("research")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Research[]
}

export async function getResearchById(id: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").select("*").eq("id", id).single()
  return data as Research | null
}

export async function createResearch(input: ResearchInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").insert(input).select().single()
  return data as Research | null
}

export async function updateResearch(id: string, input: ResearchUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("research").update(input).eq("id", id).select().single()
  return data as Research | null
}

export async function deleteResearch(id: string) {
  const supabase = await createServerClient()
  await supabase.from("research").delete().eq("id", id)
}
