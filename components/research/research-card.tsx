"use client"

import { ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Research } from "@/services/research.client"

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

const SOURCE_TYPE_COLORS: Record<string, string> = {
  article: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  video: "border-red-500/30 bg-red-500/5 text-red-400",
  paper: "border-purple-500/30 bg-purple-500/5 text-purple-400",
  book: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  other: "border-muted bg-muted/50 text-muted-foreground",
}

export function ResearchCard({
  item,
  onClick,
  onDelete,
}: {
  item: Research
  onClick: () => void
  onDelete: (id: string) => void
}) {
  const sourceColor = SOURCE_TYPE_COLORS[item.source_type ?? "other"] ?? SOURCE_TYPE_COLORS.other

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4 text-left transition-all hover:border-border/60 hover:ring-1 hover:ring-foreground/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {item.title}
          </h3>
          {item.url && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <ExternalLink size={10} />
              <span className="truncate max-w-[180px]">{item.url}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:text-muted-foreground"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {item.content_summary && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {item.content_summary}
        </p>
      )}

      <div className="flex items-center gap-2">
        {item.source_type && (
          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", sourceColor)}>
            {item.source_type}
          </span>
        )}
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary/70"
          >
            {tag}
          </span>
        ))}
        {item.tags.length > 2 && (
          <span className="text-[10px] text-muted-foreground/60">
            +{item.tags.length - 2}
          </span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground/50">
          {formatRelativeTime(item.created_at)}
        </span>
      </div>
    </button>
  )
}
