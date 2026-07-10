import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Event, EventInsert, EventUpdate } from "@/lib/supabase/types"

export type { Event, EventInsert, EventUpdate }

export async function getEvents(workspaceId: string): Promise<Event[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_time", { ascending: true })
  return (data ?? []) as Event[]
}

export async function getEventsForDateRange(
  workspaceId: string,
  from: string,
  to: string,
): Promise<Event[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("start_time", from)
    .lte("end_time", to)
    .order("start_time", { ascending: true })
  return (data ?? []) as Event[]
}

export async function createEvent(
  input: Omit<EventInsert, "id" | "created_at" | "updated_at">,
): Promise<Event | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("events")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createEvent error:", error)
    return null
  }
  return data as unknown as Event
}

export async function updateEvent(
  id: string,
  updates: EventUpdate,
): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateEvent error:", error)
    return false
  }
  return true
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("events").delete().eq("id", id)
  if (error) {
    console.error("deleteEvent error:", error)
    return false
  }
  return true
}
