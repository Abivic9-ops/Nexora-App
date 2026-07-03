import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { NewsItem, NewsItemInsert, NewsItemUpdate } from "@/lib/supabase/types"

export async function getNewsItems(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as NewsItem[]
}

export async function createNewsItem(input: NewsItemInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("news_items").insert(input).select().single()
  return data as NewsItem | null
}

export async function updateNewsItem(id: string, input: NewsItemUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("news_items").update(input).eq("id", id).select().single()
  return data as NewsItem | null
}

export async function deleteNewsItem(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("news_items").delete().eq("id", id)
}
