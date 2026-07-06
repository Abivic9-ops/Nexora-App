import { createClient as createServerClient } from "@/lib/supabase/server"

export type DashboardMetrics = {
  tasksCompletedToday: number
  tasksCompletedWeek: { date: string; count: number }[]
  focusMinutesToday: number
  focusMinutesWeek: { date: string; minutes: number }[]
  longestHabitStreak: number
  habitStreakLabel: string | null
  activeGoals: GoalSummary[]
  executionScore: number
}

export type GoalSummary = {
  id: string
  title: string
  progress: number
  status: string
  timeframe: string
  targetDate: string
}

export async function getDashboardMetrics(): Promise<DashboardMetrics | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) return null

  const workspaceId = membership.workspace_id
  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 86_400_000)

  const [
    tasksTodayResult,
    tasksWeekResult,
    focusTodayResult,
    focusWeekResult,
    habitsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", todayStart.toISOString())
      .lt("completed_at", todayEnd.toISOString()),

    supabase
      .from("tasks")
      .select("completed_at")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", sevenDaysAgo.toISOString())
      .lt("completed_at", todayEnd.toISOString())
      .order("completed_at", { ascending: true }),

    supabase
      .from("focus_sessions")
      .select("duration_minutes")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("created_at", todayStart.toISOString())
      .lt("created_at", todayEnd.toISOString()),

    supabase
      .from("focus_sessions")
      .select("duration_minutes, created_at")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("created_at", sevenDaysAgo.toISOString())
      .lt("created_at", todayEnd.toISOString())
      .order("created_at", { ascending: true }),

    supabase
      .from("habits")
      .select("longest_streak, name, streak_count")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id),

    supabase
      .from("goals")
      .select("id, title, progress, status, timeframe, target_date")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .in("status", ["active", "at_risk", "stalled"])
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const tasksCompletedToday = tasksTodayResult.count ?? 0

  const dateMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo.getTime() + i * 86_400_000)
    dateMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const row of tasksWeekResult.data ?? []) {
    if (!row.completed_at) continue
    const day = row.completed_at.slice(0, 10)
    if (dateMap.has(day)) {
      dateMap.set(day, dateMap.get(day)! + 1)
    }
  }
  const tasksCompletedWeek = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }))

  const focusMinutesToday = (focusTodayResult.data ?? []).reduce(
    (sum, s) => sum + (s.duration_minutes ?? 0), 0
  )

  const focusDateMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo.getTime() + i * 86_400_000)
    focusDateMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const row of focusWeekResult.data ?? []) {
    const day = row.created_at.slice(0, 10)
    if (focusDateMap.has(day)) {
      focusDateMap.set(day, focusDateMap.get(day)! + (row.duration_minutes ?? 0))
    }
  }
  const focusMinutesWeek = Array.from(focusDateMap.entries()).map(([date, minutes]) => ({ date, minutes }))

  const habits = habitsResult.data ?? []
  const longestHabitStreak = habits.reduce((max, h) => Math.max(max, h.longest_streak), 0)
  const bestHabit = habits.reduce((best, h) =>
    h.longest_streak >= (best?.longest_streak ?? 0) ? h : best, null as typeof habits[0] | null
  )
  const habitStreakLabel = bestHabit && bestHabit.streak_count > 0
    ? `${bestHabit.name} · ${bestHabit.streak_count} day${bestHabit.streak_count === 1 ? "" : "s"}`
    : null

  const activeGoals: GoalSummary[] = (goalsResult.data ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    status: g.status,
    timeframe: g.timeframe,
    targetDate: g.target_date,
  }))

  const weeklyTaskCount = tasksCompletedWeek.reduce((s, d) => s + d.count, 0)
  const weeklyFocusHours = focusMinutesWeek.reduce((s, d) => s + d.minutes, 0) / 60
  const executionScore = computeExecutionScore(
    tasksCompletedToday, tasksCompletedWeek,
    focusMinutesToday, focusMinutesWeek,
    longestHabitStreak
  )

  return {
    tasksCompletedToday,
    tasksCompletedWeek,
    focusMinutesToday,
    focusMinutesWeek,
    longestHabitStreak,
    habitStreakLabel,
    activeGoals,
    executionScore,
  }
}

function computeExecutionScore(
  _tasksToday: number,
  tasksWeek: { count: number }[],
  _focusToday: number,
  focusWeek: { minutes: number }[],
  _habitStreak: number,
): number {
  const totalTasks = tasksWeek.reduce((s, d) => s + d.count, 0)
  const totalFocusMin = focusWeek.reduce((s, d) => s + d.minutes, 0)
  const taskScore = Math.min(totalTasks / 14, 1) * 40
  const focusScore = Math.min(totalFocusMin / 600, 1) * 30
  const habitScore = 0
  return Math.round(taskScore + focusScore + habitScore)
}
