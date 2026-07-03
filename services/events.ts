import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { Event, EventInsert, EventUpdate } from "@/lib/supabase/types"

export async function getEvents(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_time", { ascending: true })
  return (data ?? []) as Event[]
}

export async function getEventsForDateRange(workspaceId: string, from: string, to: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("start_time", from)
    .lte("end_time", to)
    .order("start_time", { ascending: true })
  return (data ?? []) as Event[]
}

export async function createEvent(input: EventInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("events").insert(input).select().single()
  return data as Event | null
}

export async function updateEvent(id: string, input: EventUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("events").update(input).eq("id", id).select().single()
  return data as Event | null
}

export async function deleteEvent(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("events").delete().eq("id", id)
}
