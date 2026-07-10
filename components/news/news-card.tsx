"use client"

import { ExternalLink, Trash2, BookmarkPlus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewsItem } from "@/services/news.client"

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NewsCard({
  item,
  onToggleRead,
  onDelete,
  onSaveToResearch,
}: {
  item: NewsItem
  onToggleRead: (id: string, read: boolean) => void
  onDelete: (id: string) => void
  onSaveToResearch: () => void
}) {
  const isSaved = !!item.saved_to_research

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:ring-1 hover:ring-foreground/5",
        item.read
          ? "border-border/30 opacity-70 hover:border-border/50"
          : "border-border/40 hover:border-border/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {!item.read && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            )}
            <h3
              className={cn(
                "line-clamp-2 text-sm font-medium",
                item.read ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {item.title}
            </h3>
          </div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              <span className="truncate max-w-[180px]">{item.source || item.url}</span>
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onToggleRead(item.id, item.read)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              item.read
                ? "text-primary/60 hover:bg-primary/10 hover:text-primary"
                : "text-muted-foreground/0 hover:bg-secondary hover:text-foreground group-hover:text-muted-foreground",
            )}
            title={item.read ? "Mark unread" : "Mark read"}
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={onSaveToResearch}
            disabled={isSaved}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
              isSaved
                ? "text-amber-500"
                : "text-muted-foreground/0 hover:bg-amber-500/10 hover:text-amber-500 group-hover:text-muted-foreground",
            )}
            title={isSaved ? "Already saved" : "Save to Research"}
          >
            <BookmarkPlus size={12} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:text-muted-foreground"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {item.summary && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {item.summary}
        </p>
      )}

      <div className="flex items-center gap-2">
        {item.topic && (
          <span className="rounded-md border border-border/40 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.topic}
          </span>
        )}
        {item.source && !item.url && (
          <span className="text-[10px] text-muted-foreground/60">{item.source}</span>
        )}
        {isSaved && (
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
            Saved
          </span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground/50">
          {formatRelativeTime(item.created_at)}
        </span>
      </div>
    </div>
  )
}
