import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { FocusSession, FocusSessionInsert, FocusSessionUpdate } from "@/lib/supabase/types"

export async function getFocusSessions(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_time", { ascending: false })
  return (data ?? []) as FocusSession[]
}

export async function getFocusSessionById(id: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("focus_sessions").select("*").eq("id", id).single()
  return data as FocusSession | null
}

export async function getTodaysSessions(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("start_time", today)
    .lt("start_time", new Date(Date.now() + 86400000).toISOString().slice(0, 10))
    .order("start_time", { ascending: false })
  return (data ?? []) as FocusSession[]
}

export async function createFocusSession(input: FocusSessionInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("focus_sessions").insert(input).select().single()
  return data as FocusSession | null
}

export async function updateFocusSession(id: string, input: FocusSessionUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("focus_sessions").update(input).eq("id", id).select().single()
  return data as FocusSession | null
}
