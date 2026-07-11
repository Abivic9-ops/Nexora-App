"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { TrendPoint } from "@/services/analytics"

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }))

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">Score Trend</h2>
        <p className="text-xs text-muted-foreground">
          7-day rolling Execution Score over time
        </p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={30}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value, name) => {
                if (name === "score") return [`${value}`, "Score"]
                if (name === "tasks") return [`${value}`, "Tasks"]
                if (name === "focusMinutes") return [`${value} min`, "Focus"]
                return [String(value), String(name)]
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#3B82F6"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="focusMinutes"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-border/30 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted-foreground">Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span className="text-[10px] text-muted-foreground">Focus</span>
        </div>
      </div>
    </div>
  )
}
