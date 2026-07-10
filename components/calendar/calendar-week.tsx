"use client"

import { useMemo } from "react"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  setHours,
  isToday,
} from "date-fns"
import type { Event } from "@/services/events.client"
import { EventChip } from "./event-chip"
import { cn } from "@/lib/utils"

export function CalendarWeek({
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
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const hours = useMemo(() => {
    const dayStart = setHours(new Date(), 0)
    const dayEnd = setHours(new Date(), 23)
    return eachHourOfInterval({ start: dayStart, end: dayEnd })
  }, [])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const event of events) {
      const key = format(new Date(event.start_time), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(event)
    }
    return map
  }, [events])

  return (
    <div className="flex flex-col overflow-auto">
      <div className="sticky top-0 z-10 grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border/40 bg-background">
        <div />
        {days.map((day) => {
          const today = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-l border-border/20 py-2 text-center text-xs font-medium",
                today ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div>{format(day, "EEE")}</div>
              <div
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  today && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
        {hours.map((hour) => (
          <div key={hour.getHours()} className="contents">
            <div className="flex h-14 items-start justify-end border-b border-border/20 pr-2 pt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {format(hour, "h a")}
              </span>
            </div>
            {days.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd")
              const dayEvents = (eventsByDay.get(dayKey) ?? []).filter((e) => {
                if (e.all_day) return hour.getHours() === 0
                return new Date(e.start_time).getHours() === hour.getHours()
              })

              return (
                <button
                  key={`${dayKey}-${hour.getHours()}`}
                  type="button"
                  onClick={() => onDateClick(day)}
                  className="flex h-14 border-l border-b border-border/20 p-0.5 transition-colors hover:bg-secondary/30"
                >
                  {dayEvents.map((event) => (
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
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
