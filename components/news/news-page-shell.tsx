"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { NewsItem } from "@/services/news.client"
import {
  getNewsItems,
  createNewsItem,
  updateNewsItem,
  deleteNewsItem,
} from "@/services/news.client"
import { createResearch } from "@/services/research.client"
import { NewsCard } from "./news-card"
import { NewNewsDialog } from "./new-news-dialog"
import { SaveToResearchDialog } from "./save-to-research-dialog"
import { Search, Plus, Newspaper, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewsPageShell({
  initialItems,
  workspaceId,
  userId,
}: {
  initialItems: NewsItem[]
  workspaceId: string
  userId: string
}) {
  const [items, setItems] = useState<NewsItem[]>(initialItems)
  const [search, setSearch] = useState("")
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [saveDialogItem, setSaveDialogItem] = useState<NewsItem | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const refreshItems = useCallback(async () => {
    const updated = await getNewsItems(workspaceId)
    setItems(updated)
  }, [workspaceId])

  const handleCreateNewsItem = useCallback(
    async (data: {
      title: string
      url?: string
      source?: string
      summary?: string
      topic?: string
    }) => {
      const item = await createNewsItem({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        url: data.url || null,
        source: data.source || null,
        summary: data.summary || null,
        topic: data.topic || null,
        read: false,
      })
      if (item) {
        await refreshItems()
        toast.success("News item added")
      } else {
        toast.error("Failed to add news item")
      }
    },
    [workspaceId, userId, refreshItems],
  )

  const handleToggleRead = useCallback(
    async (id: string, read: boolean) => {
      const ok = await updateNewsItem(id, { read: !read })
      if (ok) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: !read } : i)))
      }
    },
    [],
  )

  const handleDeleteNewsItem = useCallback(
    async (id: string) => {
      const ok = await deleteNewsItem(id)
      if (ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.success("News item removed")
      } else {
        toast.error("Failed to remove news item")
      }
    },
    [],
  )

  const handleSaveToResearch = useCallback(
    async (data: { title: string; url?: string; source_type?: string; content_summary?: string; tags?: string[] }) => {
      if (!saveDialogItem) return
      const research = await createResearch({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        url: data.url || saveDialogItem.url || null,
        source_type: data.source_type || "article",
        content_summary: data.content_summary || saveDialogItem.summary || null,
        tags: data.tags || [],
      })
      if (research) {
        await updateNewsItem(saveDialogItem.id, { saved_to_research: research.id })
        setItems((prev) =>
          prev.map((i) =>
            i.id === saveDialogItem.id ? { ...i, saved_to_research: research.id } : i,
          ),
        )
        toast.success("Saved to research")
        setSaveDialogOpen(false)
        setSaveDialogItem(null)
      } else {
        toast.error("Failed to save to research")
      }
    },
    [saveDialogItem, workspaceId, userId],
  )

  const allTopics = Array.from(new Set(items.map((i) => i.topic).filter(Boolean))) as string[]

  const filteredItems = items.filter((item) => {
    if (topicFilter && item.topic !== topicFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.topic && item.topic.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q))
      )
    }
    return true
  })

  const unreadCount = items.filter((i) => !i.read).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">News</h1>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread briefing${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news..."
              className="h-8 w-48 rounded-lg border border-border/40 bg-secondary/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <NewNewsDialog onCreateNewsItem={handleCreateNewsItem}>
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
              <Plus size={14} />
              Add briefing
            </span>
          </NewNewsDialog>
        </div>
      </div>

      {allTopics.length > 0 && (
        <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2">
          <Filter size={12} className="mr-1 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setTopicFilter(null)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              topicFilter === null
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All topics
          </button>
          {allTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setTopicFilter(topicFilter === topic ? null : topic)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                topicFilter === topic
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto px-6 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Newspaper size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">
              {search || topicFilter ? "No briefings found" : "No news yet"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || topicFilter
                ? "Try a different filter."
                : "Add topic-based AI briefings to stay informed."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onToggleRead={handleToggleRead}
                onDelete={handleDeleteNewsItem}
                onSaveToResearch={() => {
                  setSaveDialogItem(item)
                  setSaveDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <SaveToResearchDialog
        newsItem={saveDialogItem}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveToResearch}
      />
    </div>
  )
}
