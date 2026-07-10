"use client"

import { useMemo } from "react"
import { eachHourOfInterval, setHours, format, isToday } from "date-fns"
import type { Event } from "@/services/events.client"
import { EventChip } from "./event-chip"
import { cn } from "@/lib/utils"

export function CalendarDay({
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
  const hours = useMemo(() => {
    const dayStart = setHours(new Date(), 0)
    const dayEnd = setHours(new Date(), 23)
    return eachHourOfInterval({ start: dayStart, end: dayEnd })
  }, [])

  const eventsByHour = useMemo(() => {
    const map = new Map<number, Event[]>()
    for (const event of events) {
      const start = new Date(event.start_time)
      const hour = event.all_day ? -1 : start.getHours()
      if (!map.has(hour)) map.set(hour, [])
      map.get(hour)!.push(event)
    }
    return map
  }, [events])

  const allDayEvents = eventsByHour.get(-1) ?? []
  const today = isToday(currentDate)

  return (
    <div className="flex flex-col overflow-auto">
      <div className="border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
              today ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
            )}
          >
            {format(currentDate, "d")}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {format(currentDate, "EEEE")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {format(currentDate, "MMMM yyyy")}
            </p>
          </div>
        </div>
        {allDayEvents.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {allDayEvents.map((event) => (
              <EventChip
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {hours.map((hour) => {
          const hourEvents = eventsByHour.get(hour.getHours()) ?? []
          return (
            <div key={hour.getHours()} className="contents">
              <div className="flex h-16 border-b border-border/20">
                <div className="w-16 shrink-0 border-r border-border/20 pr-2 pt-1 text-right">
                  <span className="text-[10px] text-muted-foreground">
                    {format(hour, "h a")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDateClick(currentDate)}
                  className="flex flex-1 gap-2 p-1 transition-colors hover:bg-secondary/30"
                >
                  {hourEvents.map((event) => (
                    <EventChip
                      key={event.id}
                      event={event}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    />
                  ))}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
