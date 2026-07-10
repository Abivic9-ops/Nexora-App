"use client"

import { cn } from "@/lib/utils"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function WeekdayRow() {
  return (
    <div className="grid grid-cols-7 border-b border-border/20 px-5 pb-2.5">
      {DAYS.map((day, i) => (
        <div
          key={day}
          className={cn(
            "text-center text-[11px] font-medium tracking-[0.08em] text-muted-foreground",
          )}
        >
          <span className="relative inline-block">
            {day}
            {i === 0 && (
              <span className="absolute -top-0.5 -right-1.5 h-1 w-1 rounded-full bg-primary" />
            )}
          </span>
        </div>
      ))}
    </div>
  )
}
