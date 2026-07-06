"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const DAY_LABELS: Record<string, string> = {
  "Mon": "Mon", "Tue": "Tue", "Wed": "Wed",
  "Thu": "Thu", "Fri": "Fri", "Sat": "Sat", "Sun": "Sun",
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

export function WeeklyChart({
  data,
  dataKey,
  color,
  label,
}: {
  data: { date: string; [key: string]: string | number }[]
  dataKey: string
  color: string
  label: string
}) {
  const chartData = data.map((d) => ({ ...d, day: formatDate(d.date as string) }))

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              width={24}
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
              formatter={(value) => [value, dataKey === "count" ? "Tasks" : "Minutes"]}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
