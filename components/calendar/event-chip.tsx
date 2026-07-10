"use client"

import type { Event } from "@/services/events.client"
import { format } from "date-fns"

export function EventChip({
  event,
  compact = false,
  onClick,
}: {
  event: Event
  compact?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)
  const isAllDay = event.all_day
  const isMultiDay = start.toDateString() !== end.toDateString()

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-left transition-all hover:bg-blue-500/20"
      >
        <span className="truncate text-[10px] font-medium text-blue-500">
          {event.title}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-2 rounded-lg border border-border/40 bg-card px-3 py-2 text-left transition-all hover:border-border hover:bg-card/80"
    >
      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{event.title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {isAllDay
            ? isMultiDay
              ? `${format(start, "MMM d")} - ${format(end, "MMM d")}`
              : "All day"
            : `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`}
        </p>
      </div>
    </button>
  )
}
