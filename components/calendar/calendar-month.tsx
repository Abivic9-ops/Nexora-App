"use client"

import { useMemo } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns"
import type { Event } from "@/services/events.client"
import { EventChip } from "./event-chip"
import { cn } from "@/lib/utils"

export function CalendarMonth({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const event of events) {
      const start = new Date(event.start_time)
      const end = new Date(event.end_time)
      const dayKey = format(start, "yyyy-MM-dd")
      if (!map.has(dayKey)) map.set(dayKey, [])
      map.get(dayKey)!.push(event)
      if (start.toDateString() !== end.toDateString()) {
        const endKey = format(end, "yyyy-MM-dd")
        if (!map.has(endKey)) map.set(endKey, [])
        map.get(endKey)!.push(event)
      }
    }
    return map
  }, [events])

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-b border-border/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd")
          const dayEvents = eventsByDay.get(dayKey) ?? []
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onDateClick(day)}
              className={cn(
                "flex min-h-[5rem] flex-col border-b border-r border-border/20 p-1 text-left transition-colors hover:bg-secondary/50",
                !inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium",
                  today && "bg-primary text-primary-foreground",
                  !today && "text-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-0.5 flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    compact
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
