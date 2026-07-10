import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Habit, HabitInsert, HabitUpdate, HabitLog, HabitLogInsert } from "@/lib/supabase/types"

export type { Habit, HabitInsert, HabitUpdate, HabitLog, HabitLogInsert }

export async function getHabits(workspaceId: string): Promise<Habit[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("habits")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Habit[]
}

export async function createHabit(
  input: Omit<HabitInsert, "id" | "created_at" | "updated_at">,
): Promise<Habit | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("habits")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createHabit error:", error)
    return null
  }
  return data as unknown as Habit
}

export async function updateHabit(
  id: string,
  updates: HabitUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("habits")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateHabit error:", error)
    return false
  }
  return true
}

export async function deleteHabit(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("habits").delete().eq("id", id)
  if (error) {
    console.error("deleteHabit error:", error)
    return false
  }
  return true
}

export async function getLogsForDateRange(
  workspaceId: string,
  from: string,
  to: string,
): Promise<HabitLog[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("log_date", from)
    .lte("log_date", to)
    .order("log_date", { ascending: true })
  return (data ?? []) as HabitLog[]
}

export async function upsertHabitLog(
  input: Omit<HabitLogInsert, "id" | "created_at">,
): Promise<HabitLog | null> {
  const supabase = createBrowserClient()
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", input.habit_id)
    .eq("log_date", input.log_date)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from("habit_logs")
      .update({ count: input.count, notes: input.notes ?? null })
      .eq("id", existing.id)
      .select("*")
      .single()
    if (error) {
      console.error("upsertHabitLog update error:", error)
      return null
    }
    return data as unknown as HabitLog
  }

  const { data, error } = await supabase
    .from("habit_logs")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("upsertHabitLog insert error:", error)
    return null
  }
  return data as unknown as HabitLog
}

export async function deleteHabitLog(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("habit_logs").delete().eq("id", id)
  if (error) {
    console.error("deleteHabitLog error:", error)
    return false
  }
  return true
}
