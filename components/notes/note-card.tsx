"use client"

import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note, NoteFolder } from "@/services/notes.client"

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

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

export function NoteCard({
  note,
  folders,
  onClick,
  onTogglePin,
}: {
  note: Note
  folders: NoteFolder[]
  onClick: () => void
  onTogglePin: (id: string, pinned: boolean) => void
}) {
  const folderName = note.folder_id
    ? folders.find((f) => f.id === note.folder_id)?.name
    : null

  const preview = note.content ? stripHtml(note.content).slice(0, 120) : "Empty note"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-border/40 bg-card p-4 text-left transition-all hover:border-border/60 hover:ring-1 hover:ring-foreground/5",
        note.pinned && "border-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 truncate text-sm font-medium text-foreground">
          {note.title || "Untitled"}
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin(note.id, note.pinned)
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors",
            note.pinned
              ? "text-primary"
              : "text-muted-foreground/0 hover:text-muted-foreground group-hover:text-muted-foreground",
          )}
        >
          <Pin size={12} fill={note.pinned ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {preview}
      </p>

      <div className="flex items-center gap-2">
        {folderName && (
          <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {folderName}
          </span>
        )}
        {note.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary/70"
          >
            {tag}
          </span>
        ))}
        {note.tags.length > 2 && (
          <span className="text-[10px] text-muted-foreground/60">
            +{note.tags.length - 2}
          </span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground/50">
          {formatRelativeTime(note.updated_at)}
        </span>
      </div>
    </button>
  )
}
