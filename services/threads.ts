import { createClient as createServerClient } from "@/lib/supabase/server"
import type { AssistantThread, AssistantMessage } from "@/lib/supabase/types"

export type ThreadWithPreview = AssistantThread & { lastMessage?: string | null }

export async function getThreads(): Promise<ThreadWithPreview[]> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) return []

  const { data: threads } = await supabase
    .from("assistant_threads")
    .select("*")
    .eq("workspace_id", membership.workspace_id)
    .eq("user_id", user.id)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(50)

  if (!threads || threads.length === 0) return []

  const threadIds = threads.map((t) => t.id)
  const { data: lastMessages } = await supabase
    .from("assistant_messages")
    .select("thread_id, content")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false })

  const previewMap = new Map<string, string>()
  for (const msg of lastMessages ?? []) {
    if (!previewMap.has(msg.thread_id)) {
      previewMap.set(msg.thread_id, msg.content.slice(0, 120))
    }
  }

  return threads.map((t) => ({
    ...t,
    lastMessage: previewMap.get(t.id) ?? null,
  }))
}

export async function getThread(threadId: string): Promise<AssistantThread | null> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("assistant_threads")
    .select("*")
    .eq("id", threadId)
    .single()
  return data as AssistantThread | null
}

export async function getMessages(threadId: string): Promise<AssistantMessage[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("assistant_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
  return (data ?? []) as AssistantMessage[]
}

export async function createThread(title?: string): Promise<AssistantThread | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) return null

  const { data } = await supabase
    .from("assistant_threads")
    .insert({
      workspace_id: membership.workspace_id,
      user_id: user.id,
      title: title ?? "New conversation",
    })
    .select()
    .single()

  return data as AssistantThread | null
}

export async function updateThreadTitle(threadId: string, title: string): Promise<void> {
  const supabase = await createServerClient()
  await supabase
    .from("assistant_threads")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", threadId)
}

export async function toggleThreadPin(threadId: string, pinned: boolean): Promise<void> {
  const supabase = await createServerClient()
  await supabase
    .from("assistant_threads")
    .update({ pinned })
    .eq("id", threadId)
}

export async function deleteThread(threadId: string): Promise<void> {
  const supabase = await createServerClient()
  await supabase.from("assistant_threads").delete().eq("id", threadId)
}

export async function addMessage(msg: {
  thread_id: string
  workspace_id: string
  user_id: string
  role: "user" | "assistant" | "system"
  content: string
  model?: string
  token_count?: number
  decision_id?: string
  metadata?: Record<string, unknown>
}): Promise<AssistantMessage | null> {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from("assistant_messages")
    .insert({
      thread_id: msg.thread_id,
      workspace_id: msg.workspace_id,
      user_id: msg.user_id,
      role: msg.role,
      content: msg.content,
      model: msg.model ?? null,
      token_count: msg.token_count ?? null,
      decision_id: msg.decision_id ?? null,
      metadata: msg.metadata ?? null,
    })
    .select()
    .single()

  await supabase
    .from("assistant_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", msg.thread_id)

  return data as AssistantMessage | null
}
