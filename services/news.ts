import { createClient as createServerClient } from "@/lib/supabase/server"

import type { NewsItem, NewsItemInsert, NewsItemUpdate } from "@/lib/supabase/types"

export async function getNewsItems(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as NewsItem[]
}

export async function createNewsItem(input: NewsItemInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("news_items").insert(input).select().single()
  return data as NewsItem | null
}

export async function updateNewsItem(id: string, input: NewsItemUpdate) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("news_items").update(input).eq("id", id).select().single()
  return data as NewsItem | null
}

export async function deleteNewsItem(id: string) {
  const supabase = await createServerClient()
  await supabase.from("news_items").delete().eq("id", id)
}
