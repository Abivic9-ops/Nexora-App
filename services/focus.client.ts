import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { FocusSession, FocusSessionInsert, FocusSessionUpdate } from "@/lib/supabase/types"

export type { FocusSession, FocusSessionInsert, FocusSessionUpdate }

export async function getTodaysSessions(workspaceId: string): Promise<FocusSession[]> {
  const supabase = createBrowserClient()
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const { data } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("start_time", today)
    .lt("start_time", tomorrow)
    .order("start_time", { ascending: false })
  return (data ?? []) as FocusSession[]
}

export async function getTasksForFocus(workspaceId: string): Promise<{ id: string; title: string }[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("tasks")
    .select("id, title")
    .eq("workspace_id", workspaceId)
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50)
  return (data ?? []) as { id: string; title: string }[]
}

export async function createFocusSession(
  input: Omit<FocusSessionInsert, "id" | "created_at">,
): Promise<FocusSession | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("focus_sessions")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createFocusSession error:", error)
    return null
  }
  return data as unknown as FocusSession
}

export async function updateFocusSession(
  id: string,
  updates: FocusSessionUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("focus_sessions")
    .update(updates)
    .eq("id", id)
  if (error) {
    console.error("updateFocusSession error:", error)
    return false
  }
  return true
}
