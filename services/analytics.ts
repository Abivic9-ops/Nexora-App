import { createClient as createServerClient } from "@/lib/supabase/server"
import { getRecentActivity } from "./history"
import type { EventHistory } from "@/lib/supabase/types"

export type ScoreWeights = { tasks: number; focus: number; habits: number }

export type ScoreBreakdown = {
  total: number
  taskScore: number
  focusScore: number
  habitScore: number
  taskWeight: number
  focusWeight: number
  habitWeight: number
  taskRaw: number
  focusRaw: number
  habitRaw: number
}

export type AnalyticsMetrics = {
  score: ScoreBreakdown
  heatmap: HeatmapDay[]
  bestTimeBlocks: HourBlock[]
  trend: TrendPoint[]
  insights: EventHistory[]
  summary: AnalyticsSummary
}

export type HeatmapDay = {
  date: string
  tasks: number
  focusMinutes: number
  habitsLogged: number
  total: number
}

export type HourBlock = {
  hour: number
  focusMinutes: number
  tasksCompleted: number
  label: string
}

export type TrendPoint = {
  date: string
  tasks: number
  focusMinutes: number
  habitsLogged: number
  score: number
}

export type AnalyticsSummary = {
  totalTasksCompleted: number
  totalFocusHours: number
  totalHabitLogs: number
  avgDailyScore: number
  bestDay: { date: string; score: number } | null
  currentStreak: number
}

const TARGET_TASKS_PER_WEEK = 14
const TARGET_FOCUS_MIN_PER_WEEK = 600
const TARGET_HABIT_COMPLETION_PER_WEEK = 7

export async function getAnalyticsData(rangeDays: number): Promise<AnalyticsMetrics | null> {
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
  const rangeStart = new Date(todayStart.getTime() - (rangeDays - 1) * 86_400_000)
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const [
    profileResult,
    tasksResult,
    focusResult,
    habitsResult,
    habitLogsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("score_weights")
      .eq("id", user.id)
      .single(),

    supabase
      .from("tasks")
      .select("completed_at, created_at, priority")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", rangeStart.toISOString())
      .lt("completed_at", todayEnd.toISOString())
      .order("completed_at", { ascending: true }),

    supabase
      .from("focus_sessions")
      .select("duration_minutes, start_time, completed, created_at")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("created_at", rangeStart.toISOString())
      .lt("created_at", todayEnd.toISOString())
      .order("created_at", { ascending: true }),

    supabase
      .from("habits")
      .select("id, longest_streak, name, streak_count, frequency, target_count")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id),

    supabase
      .from("habit_logs")
      .select("log_date, count, habit_id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .gte("log_date", rangeStart.toISOString().slice(0, 10))
      .lte("log_date", todayStart.toISOString().slice(0, 10))
      .order("log_date", { ascending: true }),

    supabase
      .from("goals")
      .select("id, title, progress, status, timeframe, target_date")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .in("status", ["active", "at_risk", "stalled"])
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const weights: ScoreWeights = parseWeights(profileResult.data?.score_weights)
  const tasks = (tasksResult.data ?? []) as { completed_at: string | null; created_at: string; priority: string }[]
  const focusSessions = (focusResult.data ?? []) as { duration_minutes: number | null; start_time: string; completed: boolean; created_at: string }[]
  const habits = (habitsResult.data ?? []) as { id: string; longest_streak: number; name: string; streak_count: number; frequency: string; target_count: number }[]
  const habitLogs = (habitLogsResult.data ?? []) as { log_date: string; count: number; habit_id: string }[]
  const goals = goalsResult.data ?? []

  const heatmap = buildHeatmap(tasks, focusSessions, habitLogs, rangeStart, todayStart)
  const bestTimeBlocks = buildBestTimeBlocks(focusSessions, tasks)
  const trend = buildTrend(heatmap)
  const score = computeScore(weights, heatmap, habits)
  const insights = await getRecentActivity(workspaceId, 10)
  const summary = buildSummary(tasks, focusSessions, habitLogs, heatmap, habits, goals)

  return { score, heatmap, bestTimeBlocks, trend, insights, summary }
}

function parseWeights(raw: unknown): ScoreWeights {
  if (raw && typeof raw === "object" && "tasks" in raw) {
    const w = raw as Record<string, number>
    const t = typeof w.tasks === "number" ? w.tasks : 0.5
    const f = typeof w.focus === "number" ? w.focus : 0.3
    const h = typeof w.habits === "number" ? w.habits : 0.2
    const sum = t + f + h
    if (sum === 0) return { tasks: 0.5, focus: 0.3, habits: 0.2 }
    return { tasks: t / sum, focus: f / sum, habits: h / sum }
  }
  return { tasks: 0.5, focus: 0.3, habits: 0.2 }
}

function buildHeatmap(
  tasks: { completed_at: string | null }[],
  focusSessions: { duration_minutes: number | null; created_at: string }[],
  habitLogs: { log_date: string; count: number }[],
  rangeStart: Date,
  todayStart: Date,
): HeatmapDay[] {
  const days: HeatmapDay[] = []
  const taskMap = new Map<string, number>()
  const focusMap = new Map<string, number>()
  const habitMap = new Map<string, number>()

  for (const t of tasks) {
    if (!t.completed_at) continue
    const day = t.completed_at.slice(0, 10)
    taskMap.set(day, (taskMap.get(day) ?? 0) + 1)
  }
  for (const f of focusSessions) {
    const day = f.created_at.slice(0, 10)
    focusMap.set(day, (focusMap.get(day) ?? 0) + (f.duration_minutes ?? 0))
  }
  for (const h of habitLogs) {
    habitMap.set(h.log_date, (habitMap.get(h.log_date) ?? 0) + h.count)
  }

  const totalDays = Math.floor((todayStart.getTime() - rangeStart.getTime()) / 86_400_000) + 1
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(rangeStart.getTime() + i * 86_400_000)
    const dateStr = d.toISOString().slice(0, 10)
    const t = taskMap.get(dateStr) ?? 0
    const f = focusMap.get(dateStr) ?? 0
    const h = habitMap.get(dateStr) ?? 0
    days.push({ date: dateStr, tasks: t, focusMinutes: f, habitsLogged: h, total: t + f + h })
  }
  return days
}

function buildBestTimeBlocks(
  focusSessions: { duration_minutes: number | null; start_time: string }[],
  tasks: { completed_at: string | null }[],
): HourBlock[] {
  const blocks: HourBlock[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    focusMinutes: 0,
    tasksCompleted: 0,
    label: `${i.toString().padStart(2, "0")}:00`,
  }))

  for (const f of focusSessions) {
    const hour = new Date(f.start_time).getHours()
    blocks[hour].focusMinutes += f.duration_minutes ?? 0
  }
  for (const t of tasks) {
    if (!t.completed_at) continue
    const hour = new Date(t.completed_at).getHours()
    blocks[hour].tasksCompleted += 1
  }
  return blocks
}

function buildTrend(
  heatmap: HeatmapDay[],
): TrendPoint[] {
  const windowSize = Math.min(7, heatmap.length)
  const points: TrendPoint[] = []

  for (let i = windowSize - 1; i < heatmap.length; i++) {
    const window = heatmap.slice(i - windowSize + 1, i + 1)
    const tasks = window.reduce((s, d) => s + d.tasks, 0)
    const focusMinutes = window.reduce((s, d) => s + d.focusMinutes, 0)
    const habitsLogged = window.reduce((s, d) => s + d.habitsLogged, 0)
    const taskScore = Math.min(tasks / TARGET_TASKS_PER_WEEK, 1) * 40
    const focusScore = Math.min(focusMinutes / TARGET_FOCUS_MIN_PER_WEEK, 1) * 30
    const habitScore = Math.min(habitsLogged / TARGET_HABIT_COMPLETION_PER_WEEK, 1) * 30
    const score = Math.round(taskScore + focusScore + habitScore)

    points.push({
      date: heatmap[i].date,
      tasks,
      focusMinutes: Math.round(focusMinutes),
      habitsLogged,
      score,
    })
  }
  return points
}

function computeScore(
  weights: ScoreWeights,
  heatmap: HeatmapDay[],
  habits: { longest_streak: number; streak_count: number }[],
): ScoreBreakdown {
  const recent = heatmap.slice(-7)
  const totalTasks = recent.reduce((s, d) => s + d.tasks, 0)
  const totalFocusMin = recent.reduce((s, d) => s + d.focusMinutes, 0)
  const totalHabitLogs = recent.reduce((s, d) => s + d.habitsLogged, 0)

  const taskRaw = Math.min(totalTasks / TARGET_TASKS_PER_WEEK, 1)
  const focusRaw = Math.min(totalFocusMin / TARGET_FOCUS_MIN_PER_WEEK, 1)
  const habitRaw = Math.min(totalHabitLogs / TARGET_HABIT_COMPLETION_PER_WEEK, 1)

  const taskScore = Math.round(taskRaw * weights.tasks * 100)
  const focusScore = Math.round(focusRaw * weights.focus * 100)
  const habitScore = Math.round(habitRaw * weights.habits * 100)

  return {
    total: Math.round(taskScore + focusScore + habitScore),
    taskScore,
    focusScore,
    habitScore,
    taskWeight: weights.tasks,
    focusWeight: weights.focus,
    habitWeight: weights.habits,
    taskRaw,
    focusRaw,
    habitRaw,
  }
}

function buildSummary(
  tasks: { completed_at: string | null }[],
  focusSessions: { duration_minutes: number | null }[],
  habitLogs: { log_date: string; count: number }[],
  heatmap: HeatmapDay[],
  _habits: { streak_count: number }[],
  _goals: { progress: number }[],
): AnalyticsSummary {
  const totalTasksCompleted = tasks.length
  const totalFocusHours = Math.round(focusSessions.reduce((s, f) => s + (f.duration_minutes ?? 0), 0) / 60 * 10) / 10
  const totalHabitLogs = habitLogs.reduce((s, h) => s + h.count, 0)

  const scores = heatmap.map((d) => {
    const t = Math.min(d.tasks / TARGET_TASKS_PER_WEEK, 1) * 40
    const f = Math.min(d.focusMinutes / TARGET_FOCUS_MIN_PER_WEEK, 1) * 30
    const h = Math.min(d.habitsLogged / TARGET_HABIT_COMPLETION_PER_WEEK, 1) * 30
    return { date: d.date, score: Math.round(t + f + h) }
  })

  const avgDailyScore = scores.length > 0
    ? Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length)
    : 0

  const bestDay = scores.reduce((best, d) => d.score > (best?.score ?? 0) ? d : best, null as { date: string; score: number } | null)

  let currentStreak = 0
  for (let i = heatmap.length - 1; i >= 0; i--) {
    if (heatmap[i].total > 0) currentStreak++
    else break
  }

  return { totalTasksCompleted, totalFocusHours, totalHabitLogs, avgDailyScore, bestDay, currentStreak }
}

export function computeExecutionScoreFromWeights(
  weights: ScoreWeights,
  totalTasksWeek: number,
  totalFocusMinWeek: number,
  totalHabitLogsWeek: number,
): number {
  const taskScore = Math.min(totalTasksWeek / TARGET_TASKS_PER_WEEK, 1) * weights.tasks * 100
  const focusScore = Math.min(totalFocusMinWeek / TARGET_FOCUS_MIN_PER_WEEK, 1) * weights.focus * 100
  const habitScore = Math.min(totalHabitLogsWeek / TARGET_HABIT_COMPLETION_PER_WEEK, 1) * weights.habits * 100
  return Math.round(taskScore + focusScore + habitScore)
}
