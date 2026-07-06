import { createClient as createServerClient } from "@/lib/supabase/server"

import type { Event, EventInsert, EventUpdate } from "@/lib/supabase/types"

export async function getEvents(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_time", { ascending: true })
  return (data ?? []) as Event[]
}

export async function getEventsForDateRange(workspaceId: string, from: string, to: string) {
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
  const supabase = await createServerClient()
  const { data } = await supabase.from("events").insert(input).select().single()
  return data as Event | null
}

export async function updateEvent(id: string, input: EventUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("events").update(input).eq("id", id).select().single()
  return data as Event | null
}

export async function deleteEvent(id: string) {
  const supabase = await createServerClient()
  await supabase.from("events").delete().eq("id", id)
}
