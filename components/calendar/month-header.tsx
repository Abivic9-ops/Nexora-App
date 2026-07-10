"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

export function MonthHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  const month = format(currentDate, "MMMM")
  const year = format(currentDate, "yyyy")

  return (
    <div className="flex items-center justify-between px-5 pb-4">
      <h3 className="text-xl font-bold text-foreground tracking-tight">
        {month}{" "}
        <span className="font-normal text-muted-foreground">{year}</span>
      </h3>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          aria-label="Go to today"
          className="rounded-xl border border-border/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground"
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:text-foreground"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/40 text-muted-foreground transition-all hover:border-border hover:text-foreground"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
