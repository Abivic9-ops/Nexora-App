"use client"

import { MessageSquare, Plus, Pin } from "lucide-react"
import type { AssistantThread } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ThreadWithPreview = AssistantThread & { lastMessage?: string | null }

export function ThreadList({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
}: {
  threads: ThreadWithPreview[]
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  onNewThread: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <p className="text-xs font-semibold text-foreground">Threads</p>
        <button
          type="button"
          onClick={onNewThread}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {threads.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare size={20} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors",
                activeThreadId === thread.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <div className="flex items-center gap-1.5">
                {thread.pinned && <Pin size={10} className="shrink-0 text-primary" />}
                <span className="truncate text-xs font-medium">{thread.title}</span>
              </div>
              {thread.lastMessage && (
                <span className="truncate text-[11px] text-muted-foreground/60">
                  {thread.lastMessage}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
