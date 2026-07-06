import type { Metadata } from "next"
import { getDashboardMetrics } from "@/services/dashboard"
import { TopBar } from "@/components/dashboard/top-bar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { GoalProgress } from "@/components/dashboard/goal-progress"
import { CheckSquare, Timer, Repeat2, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your NEXORA execution dashboard.",
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()

  if (!metrics) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-2xl font-bold text-primary">N</span>
              </div>
            </div>
            <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">
              Workspace not ready
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete onboarding to set up your workspace.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const weeklyTaskTotal = metrics.tasksCompletedWeek.reduce((s, d) => s + d.count, 0)
  const weeklyFocusMin = metrics.focusMinutesWeek.reduce((s, d) => s + d.minutes, 0)
  const weeklyFocusHours = (weeklyFocusMin / 60).toFixed(1)
  const focusTrend = weeklyFocusMin > 0
    ? { direction: weeklyFocusMin > 120 ? "up" as const : "neutral" as const,
        label: `${weeklyFocusHours}h this week` }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <div className="flex-1 space-y-6 px-6 py-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your execution overview for the past 7 days
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={TrendingUp}
            label="Execution Score"
            value={`${metrics.executionScore}`}
            subtitle="out of 100"
            trend={{ direction: metrics.executionScore >= 50 ? "up" : "neutral", label: `${metrics.executionScore}/100` }}
          />
          <KpiCard
            icon={CheckSquare}
            label="Tasks completed"
            value={`${metrics.tasksCompletedToday}`}
            subtitle="today"
            trend={weeklyTaskTotal > 0 ? { direction: "up", label: `${weeklyTaskTotal} this week` } : undefined}
          />
          <KpiCard
            icon={Timer}
            label="Focus time"
            value={weeklyFocusMin < 60 ? `${weeklyFocusMin}m` : `${weeklyFocusHours}h`}
            subtitle="today"
            trend={focusTrend}
          />
          <KpiCard
            icon={Repeat2}
            label="Best habit streak"
            value={metrics.longestHabitStreak > 0 ? `${metrics.longestHabitStreak}` : "—"}
            subtitle={metrics.habitStreakLabel ?? "No habits tracked yet"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyChart
            data={metrics.tasksCompletedWeek}
            dataKey="count"
            color="var(--primary)"
            label="Tasks completed"
          />
          <WeeklyChart
            data={metrics.focusMinutesWeek}
            dataKey="minutes"
            color="#10B981"
            label="Focus minutes"
          />
        </div>

        <div className="max-w-lg">
          <GoalProgress goals={metrics.activeGoals} />
        </div>
      </div>
    </div>
  )
}
