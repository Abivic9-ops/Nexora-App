import { createClient as createServerClient } from "@/lib/supabase/server"

import type { EventHistory, EventHistoryInsert } from "@/lib/supabase/types"

export async function getHistory(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("event_history")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as EventHistory[]
}

export async function getHistoryForEntity(entityType: string, entityId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("event_history")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
  return (data ?? []) as EventHistory[]
}

export async function recordEvent(input: EventHistoryInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("event_history").insert(input).select().single()
  return data as EventHistory | null
}

export async function getRecentActivity(workspaceId: string, limit = 20) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("event_history")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as EventHistory[]
}
