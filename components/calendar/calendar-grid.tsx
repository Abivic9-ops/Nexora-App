"use client"

import { useMemo, useCallback } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns"
import type { Event } from "@/services/events.client"
import { DayCell } from "./day-cell"

export function CalendarGrid({
  currentDate,
  events,
  selectedDate,
  onDateClick,
}: {
  currentDate: Date
  events: Event[]
  selectedDate: Date | null
  onDateClick: (date: Date) => void
}) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) {
      const start = new Date(event.start_time)
      const end = new Date(event.end_time)
      const dayKey = format(start, "yyyy-MM-dd")
      map.set(dayKey, (map.get(dayKey) ?? 0) + 1)
      if (start.toDateString() !== end.toDateString()) {
        const endKey = format(end, "yyyy-MM-dd")
        map.set(endKey, (map.get(endKey) ?? 0) + 1)
      }
    }
    return map
  }, [events])

  const handleClick = useCallback(
    (day: Date) => {
      onDateClick(day)
    },
    [onDateClick],
  )

  return (
    <div className="grid grid-cols-7 gap-px px-5">
      {days.map((day) => {
        const dayKey = format(day, "yyyy-MM-dd")
        const inMonth = isSameMonth(day, currentDate)
        const today = isToday(day)
        const selected = selectedDate ? isSameDay(day, selectedDate) : false
        const eventCount = eventsByDay.get(dayKey) ?? 0

        return (
          <DayCell
            key={dayKey}
            day={day.getDate()}
            isCurrentMonth={inMonth}
            isToday={today}
            isSelected={selected && !today}
            eventCount={eventCount}
            onClick={() => handleClick(day)}
          />
        )
      })}
    </div>
  )
}
