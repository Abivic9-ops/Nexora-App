"use client"

import { Database, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function ContextBadge({ loaded }: { loaded: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
        loaded
          ? "border-primary/20 bg-primary/5 text-primary"
          : "border-border/40 bg-secondary text-muted-foreground",
      )}
    >
      {loaded ? <Database size={10} /> : <Loader2 size={10} className="animate-spin" />}
      {loaded ? "Context loaded" : "Loading…"}
    </div>
  )
}
