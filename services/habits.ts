import { createClient as createServerClient } from "@/lib/supabase/server"

import type { Habit, HabitInsert, HabitUpdate, HabitLog, HabitLogInsert } from "@/lib/supabase/types"

// ── Habits ──

export async function getHabits(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("habits")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as Habit[]
}

export async function getHabitById(id: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("habits").select("*").eq("id", id).single()
  return data as Habit | null
}

export async function createHabit(input: HabitInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("habits").insert(input).select().single()
  return data as Habit | null
}

export async function updateHabit(id: string, input: HabitUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("habits").update(input).eq("id", id).select().single()
  return data as Habit | null
}

export async function deleteHabit(id: string) {
  const supabase = await createServerClient()
  await supabase.from("habits").delete().eq("id", id)
}

// ── Habit Logs ──

export async function getHabitLogs(habitId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .order("log_date", { ascending: false })
  return (data ?? []) as HabitLog[]
}

export async function getLogsForDate(workspaceId: string, date: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("habit_logs")
    .select("*, habits(*)")
    .eq("workspace_id", workspaceId)
    .eq("log_date", date)
  return data ?? []
}

export async function createHabitLog(input: HabitLogInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("habit_logs").insert(input).select().single()
  return data as HabitLog | null
}
