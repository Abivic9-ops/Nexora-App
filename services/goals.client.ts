import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Goal, GoalInsert, GoalUpdate } from "@/lib/supabase/types"

export type { Goal, GoalInsert, GoalUpdate }

export async function getGoals(workspaceId: string): Promise<Goal[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("target_date", { ascending: true })
  return (data ?? []) as Goal[]
}

export async function createGoal(
  input: Omit<GoalInsert, "id" | "created_at" | "updated_at">,
): Promise<Goal | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("goals")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createGoal error:", error)
    return null
  }
  return data as unknown as Goal
}

export async function updateGoal(
  id: string,
  updates: GoalUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateGoal error:", error)
    return false
  }
  return true
}

export async function deleteGoal(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("goals").delete().eq("id", id)
  if (error) {
    console.error("deleteGoal error:", error)
    return false
  }
  return true
}
