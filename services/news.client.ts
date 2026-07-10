import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { NewsItem, NewsItemInsert, NewsItemUpdate } from "@/lib/supabase/types"

export type { NewsItem, NewsItemInsert, NewsItemUpdate }

export async function getNewsItems(workspaceId: string): Promise<NewsItem[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as NewsItem[]
}

export async function createNewsItem(input: Omit<NewsItemInsert, "id" | "created_at">): Promise<NewsItem | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("news_items")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createNewsItem error:", error)
    return null
  }
  return data as unknown as NewsItem
}

export async function updateNewsItem(id: string, updates: NewsItemUpdate): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("news_items")
    .update(updates)
    .eq("id", id)
  if (error) {
    console.error("updateNewsItem error:", error)
    return false
  }
  return true
}

export async function deleteNewsItem(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("news_items").delete().eq("id", id)
  if (error) {
    console.error("deleteNewsItem error:", error)
    return false
  }
  return true
}
