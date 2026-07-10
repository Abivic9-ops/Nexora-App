"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Research } from "@/services/research.client"
import {
  getResearchItems,
  createResearch,
  deleteResearch,
} from "@/services/research.client"
import { ResearchCard } from "./research-card"
import { NewResearchDialog } from "./new-research-dialog"
import { ResearchDetailDrawer } from "./research-detail-drawer"
import { Search, Plus, BookOpen, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

type SourceFilter = "all" | "article" | "video" | "paper" | "book" | "other"

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "video", label: "Videos" },
  { value: "paper", label: "Papers" },
  { value: "book", label: "Books" },
  { value: "other", label: "Other" },
]

export function ResearchPageShell({
  initialItems,
  workspaceId,
  userId,
}: {
  initialItems: Research[]
  workspaceId: string
  userId: string
}) {
  const [items, setItems] = useState<Research[]>(initialItems)
  const [filter, setFilter] = useState<SourceFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState<Research | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshItems = useCallback(async () => {
    const updated = await getResearchItems(workspaceId)
    setItems(updated)
  }, [workspaceId])

  const handleCreateResearch = useCallback(
    async (data: {
      title: string
      url?: string
      source_type?: string
      content_summary?: string
      tags?: string[]
    }) => {
      const item = await createResearch({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        url: data.url || null,
        source_type: data.source_type || null,
        content_summary: data.content_summary || null,
        tags: data.tags || [],
      })
      if (item) {
        await refreshItems()
        toast.success("Source saved")
      } else {
        toast.error("Failed to save source")
      }
    },
    [workspaceId, userId, refreshItems],
  )

  const handleDeleteResearch = useCallback(
    async (id: string) => {
      const ok = await deleteResearch(id)
      if (ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.success("Source deleted")
      } else {
        toast.error("Failed to delete source")
      }
    },
    [],
  )

  const handleItemUpdated = useCallback(async () => {
    await refreshItems()
  }, [refreshItems])

  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)))

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.source_type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        (item.content_summary && item.content_summary.toLowerCase().includes(q))
      )
    }
    return true
  })

  const totalCount = items.length
  const articleCount = items.filter((i) => i.source_type === "article").length
  const videoCount = items.filter((i) => i.source_type === "video").length
  const tagCount = allTags.length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Research</h1>
          <p className="text-xs text-muted-foreground">
            {totalCount} source{totalCount !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sources..."
              className="h-8 w-48 rounded-lg border border-border/40 bg-secondary/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <NewResearchDialog onCreateResearch={handleCreateResearch}>
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
              <Plus size={14} />
              Save source
            </span>
          </NewResearchDialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 border-b border-border/40 px-6 py-3">
        {[
          { label: "Total", value: totalCount, icon: BookOpen },
          { label: "Articles", value: articleCount, icon: null },
          { label: "Videos", value: videoCount, icon: null },
          { label: "Tags", value: tagCount, icon: Tag },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/50 px-3 py-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              {stat.icon ? (
                <stat.icon size={14} className="text-primary" />
              ) : (
                <span className="text-xs font-medium text-primary">{stat.value}</span>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-semibold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2">
        {SOURCE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
        {allTags.length > 0 && (
          <div className="ml-auto flex items-center gap-1">
            {allTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearch(tag)}
                className="rounded-md border border-border/40 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <BookOpen size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">
              {search ? "No sources found" : "No research saved yet"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? "Try a different search term."
                : "Save articles, videos, and papers to build your research library."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ResearchCard
                key={item.id}
                item={item}
                onClick={() => {
                  setSelectedItem(item)
                  setDrawerOpen(true)
                }}
                onDelete={handleDeleteResearch}
              />
            ))}
          </div>
        )}
      </div>

      <ResearchDetailDrawer
        item={selectedItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onItemUpdated={handleItemUpdated}
        onItemDeleted={handleDeleteResearch}
      />
    </div>
  )
}
