"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { HourBlock } from "@/services/analytics"

export function BestTimeBlocks({ data }: { data: HourBlock[] }) {
  const activeHours = data.filter((h) => h.focusMinutes > 0 || h.tasksCompleted > 0)
  const displayData = data.filter((h) => h.hour >= 6 && h.hour <= 23)

  const peakHour = displayData.reduce(
    (best, h) => (h.focusMinutes + h.tasksCompleted * 10 > (best?.focusMinutes ?? 0) + (best?.tasksCompleted ?? 0) * 10 ? h : best),
    null as HourBlock | null,
  )

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">Best Time Blocks</h2>
        <p className="text-xs text-muted-foreground">
          {activeHours.length > 0 && peakHour
            ? `Peak productivity at ${peakHour.label} -- ${peakHour.focusMinutes}min focus, ${peakHour.focusMinutes}min focus`
            : "When you're most productive"}
        </p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--secondary)" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value, name) => [
                name === "focusMinutes" ? `${value} min` : String(value),
                name === "focusMinutes" ? "Focus" : "Tasks",
              ]}
            />
            <Bar
              dataKey="focusMinutes"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              name="focusMinutes"
            />
            <Bar
              dataKey="tasksCompleted"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              name="tasksCompleted"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {activeHours.length > 0 && (
        <div className="mt-3 flex items-center gap-4 border-t border-border/30 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-muted-foreground">Focus minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-[10px] text-muted-foreground">Tasks completed</span>
          </div>
        </div>
      )}
    </div>
  )
}
