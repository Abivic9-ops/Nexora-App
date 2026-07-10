"use client"

import { cn } from "@/lib/utils"

export function DayCell({
  day,
  isCurrentMonth,
  isToday,
  isSelected,
  eventCount,
  onClick,
}: {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  eventCount: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={isSelected || undefined}
      aria-current={isToday ? "date" : undefined}
      className={cn(
        "relative flex h-[80px] w-full flex-col items-center justify-start pt-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
        isCurrentMonth ? "text-foreground" : "text-muted-foreground",
        isSelected && !isToday && "bg-white/[0.06] rounded-xl",
        isToday && "bg-white/[0.06] rounded-xl",
        !isSelected && !isToday && "hover:bg-white/[0.03] rounded-xl",
      )}
    >
        <span
          className={cn(
            "relative z-10 flex h-8 w-8 items-center justify-center text-[13px] font-medium",
            isToday &&
              "rounded-full bg-primary text-primary-foreground",
          )}
        >
          {day}
        </span>
      {eventCount > 0 && (
        <div className="mt-0.5 flex items-center gap-0.5">
          {Array.from({ length: Math.min(eventCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-primary/60"
            />
          ))}
          {eventCount > 3 && (
            <span className="text-[8px] text-muted-foreground ml-0.5">
              +{eventCount - 3}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
