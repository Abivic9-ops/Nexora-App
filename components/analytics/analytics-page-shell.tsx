"use client"

import { useState, useCallback } from "react"
import type { AnalyticsMetrics } from "@/services/analytics"
import { ScoreBreakdownPanel } from "./score-breakdown"
import { ProductivityHeatmap } from "./productivity-heatmap"
import { BestTimeBlocks } from "./best-time-blocks"
import { TrendChart } from "./trend-chart"
import { ScoreInsights } from "./score-insights"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Target, Clock, Flame, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type RangeOption = { label: string; days: number }

const RANGE_OPTIONS: RangeOption[] = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
]

export function AnalyticsPageShell({
  initialData,
  onRangeChange,
}: {
  initialData: AnalyticsMetrics
  onRangeChange: (days: number) => Promise<AnalyticsMetrics>
}) {
  const [data, setData] = useState(initialData)
  const [rangeDays, setRangeDays] = useState(30)
  const [loading, setLoading] = useState(false)

  const handleRangeChange = useCallback(
    async (days: number) => {
      setRangeDays(days)
      setLoading(true)
      const updated = await onRangeChange(days)
      setData(updated)
      setLoading(false)
    },
    [onRangeChange],
  )

  const s = data.summary

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", loading && "opacity-60 pointer-events-none")}>
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Detailed reporting and execution insights
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/40">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => handleRangeChange(opt.days)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                rangeDays === opt.days
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            icon={Target}
            label="Tasks completed"
            value={String(s.totalTasksCompleted)}
            subtitle={`in the last ${rangeDays} days`}
          />
          <KpiCard
            icon={Clock}
            label="Focus hours"
            value={String(s.totalFocusHours)}
            subtitle={`in the last ${rangeDays} days`}
          />
          <KpiCard
            icon={Flame}
            label="Habit completions"
            value={String(s.totalHabitLogs)}
            subtitle={`${s.currentStreak} day streak`}
          />
          <KpiCard
            icon={TrendingUp}
            label="Avg daily score"
            value={String(s.avgDailyScore)}
            subtitle={s.bestDay ? `Best: ${s.bestDay.score} on ${formatDate(s.bestDay.date)}` : "No data yet"}
          />
        </div>

        <ScoreBreakdownPanel score={data.score} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart data={data.trend} />
          <BestTimeBlocks data={data.bestTimeBlocks} />
        </div>

        <ProductivityHeatmap data={data.heatmap} />

        <ScoreInsights events={data.insights} />
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
