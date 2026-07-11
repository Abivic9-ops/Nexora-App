"use client"

import type { HeatmapDay } from "@/services/analytics"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function getIntensityClass(total: number): string {
  if (total === 0) return "bg-secondary/60"
  if (total <= 2) return "bg-primary/15"
  if (total <= 5) return "bg-primary/30"
  if (total <= 8) return "bg-primary/50"
  return "bg-primary/75"
}

function getWeekNumber(dateStr: string, startDate: string): number {
  const d = new Date(dateStr + "T00:00:00")
  const s = new Date(startDate + "T00:00:00")
  return Math.floor((d.getTime() - s.getTime()) / (7 * 86_400_000))
}

export function ProductivityHeatmap({ data }: { data: HeatmapDay[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-5">
        <h2 className="text-sm font-medium text-foreground">Productivity Heatmap</h2>
        <p className="mt-1 text-xs text-muted-foreground">No data to display yet.</p>
      </div>
    )
  }

  const startDate = data[0].date

  const weekMap = new Map<number, Map<number, HeatmapDay>>()
  for (const day of data) {
    const week = getWeekNumber(day.date, startDate)
    const dayOfWeek = new Date(day.date + "T00:00:00").getDay()
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    if (!weekMap.has(week)) weekMap.set(week, new Map())
    weekMap.get(week)!.set(adjustedDay, day)
  }

  const weeks = Array.from(weekMap.keys()).sort((a, b) => a - b)

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Productivity Heatmap</h2>
          <p className="text-xs text-muted-foreground">
            Daily activity across tasks, focus, and habits
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-sm",
                i === 0 ? "bg-secondary/60" : `bg-primary/${15 + i * 15}`,
              )}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          <div className="flex flex-col gap-1 pt-5">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className="h-[14px] text-[10px] text-muted-foreground flex items-center pr-1"
              >
                {i % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {weeks.map((week) => (
            <div key={week} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const dayData = weekMap.get(week)?.get(dayIdx)
                const dateStr = dayData?.date ?? ""
                return (
                  <div
                    key={`${week}-${dayIdx}`}
                    className={cn(
                      "h-[14px] w-[14px] rounded-sm transition-colors",
                      dayData
                        ? getIntensityClass(dayData.total)
                        : "bg-transparent",
                    )}
                    title={
                      dayData
                        ? `${dateStr}: ${dayData.tasks} tasks, ${dayData.focusMinutes}min focus, ${dayData.habitsLogged} habits`
                        : ""
                    }
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border/30 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/75" />
          <span className="text-[10px] text-muted-foreground">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-blue-400/60" />
          <span className="text-[10px] text-muted-foreground">Focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-400/60" />
          <span className="text-[10px] text-muted-foreground">Habits</span>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground/60">
          {data.length} days
        </span>
      </div>
    </div>
  )
}
