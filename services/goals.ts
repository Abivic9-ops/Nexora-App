import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { Goal, GoalInsert, GoalUpdate } from "@/lib/supabase/types"

export async function getGoals(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("target_date", { ascending: true })
  return (data ?? []) as Goal[]
}

export async function getGoalById(id: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("goals").select("*").eq("id", id).single()
  return data as Goal | null
}

export async function createGoal(input: GoalInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("goals").insert(input).select().single()
  return data as Goal | null
}

export async function updateGoal(id: string, input: GoalUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("goals").update(input).eq("id", id).select().single()
  return data as Goal | null
}

export async function deleteGoal(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("goals").delete().eq("id", id)
}
