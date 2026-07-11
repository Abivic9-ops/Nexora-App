import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getAnalyticsData } from "@/services/analytics"
import { AnalyticsPageShell } from "@/components/analytics/analytics-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Execution Score, heatmaps, trends, and insights.",
}

export default async function AnalyticsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Workspace not ready
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete onboarding to set up your workspace.
          </p>
        </div>
      </div>
    )
  }

  const data = await getAnalyticsData(30)

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            No data yet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start completing tasks, focus sessions, and habits to see analytics.
          </p>
        </div>
      </div>
    )
  }

  const onRangeChange = async (days: number) => {
    "use server"
    const result = await getAnalyticsData(days)
    return result ?? {
      score: { total: 0, taskScore: 0, focusScore: 0, habitScore: 0, taskWeight: 0.5, focusWeight: 0.3, habitWeight: 0.2, taskRaw: 0, focusRaw: 0, habitRaw: 0 },
      heatmap: [],
      bestTimeBlocks: [],
      trend: [],
      insights: [],
      summary: { totalTasksCompleted: 0, totalFocusHours: 0, totalHabitLogs: 0, avgDailyScore: 0, bestDay: null, currentStreak: 0 },
    }
  }

  return (
    <AnalyticsPageShell
      initialData={data}
      onRangeChange={onRangeChange}
    />
  )
}
