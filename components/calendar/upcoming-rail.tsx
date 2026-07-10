"use client"

import { CalendarDays } from "lucide-react"
import type { Event } from "@/services/events.client"
import { format } from "date-fns"

const EVENT_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
]

function getColor(index: number) {
  return EVENT_COLORS[index % EVENT_COLORS.length]
}

export function UpcomingRail({
  events,
  onEventClick,
  selectedDate,
}: {
  events: Event[]
  onEventClick: (event: Event) => void
  selectedDate: Date | null
}) {
  const filtered = selectedDate
    ? events.filter((e) => {
        const start = new Date(e.start_time)
        return start.toDateString() === selectedDate.toDateString()
      })
    : events

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/5 px-5 pb-4 pt-1">
        <h2 className="text-sm font-semibold text-foreground">Upcoming</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {selectedDate
            ? format(selectedDate, "MMMM d, yyyy")
            : "Schedule exceptions & events"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <CalendarDays size={20} className="text-muted-foreground" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Nothing coming up</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((event, idx) => {
              const start = new Date(event.start_time)
              const end = new Date(event.end_time)
              const isAllDay = event.all_day
              const isMultiDay = start.toDateString() !== end.toDateString()

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick(event)}
                  className="group flex w-full items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left transition-all hover:bg-white/[0.06]"
                >
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${getColor(idx)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {isAllDay
                        ? isMultiDay
                          ? `${format(start, "MMM d")} - ${format(end, "MMM d")}`
                          : "All day"
                        : format(start, "MMM d, h:mm a")}
                    </p>
                  </div>
                  {!isAllDay && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {format(start, "h:mm a")}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
