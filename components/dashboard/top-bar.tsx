"use client"

import { Search, Plus } from "lucide-react"

export function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-border/40 bg-background px-6 py-3">
      <div className="relative w-72">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full rounded-lg border border-border/40 bg-card py-1.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
      >
        <Plus size={14} />
        Quick add
      </button>
    </div>
  )
}
