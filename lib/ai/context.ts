import { createClient as createServerClient } from "@/lib/supabase/server"
import type {
  Task, Event, Goal, Habit,
  GraphEdge, DecisionMemory, Note, Research,
} from "@/lib/supabase/types"

export type UserContext = {
  profile: {
    full_name: string | null
    persona: string | null
    taskWeight: number
    focusWeight: number
    habitWeight: number
  } | null
  score: {
    total: number
    taskScore: number
    focusScore: number
    habitScore: number
    taskWeight: number
    focusWeight: number
    habitWeight: number
  } | null
  activeTasks: Pick<Task, "id" | "title" | "status" | "priority" | "due_date">[]
  upcomingEvents: Pick<Event, "id" | "title" | "start_time" | "end_time">[]
  activeGoals: Pick<Goal, "id" | "title" | "timeframe" | "progress" | "status" | "target_date">[]
  habits: Pick<Habit, "id" | "name" | "frequency" | "streak_count" | "longest_streak" | "target_count">[]
  focusToday: number
  focusWeek: number
  graphEdges: Pick<GraphEdge, "id" | "source_type" | "source_id" | "target_type" | "target_id" | "edge_type">[]
  recentDecisions: Pick<DecisionMemory, "id" | "action" | "rationale" | "outcome" | "created_at">[]
  recentNotes: Pick<Note, "id" | "title" | "tags">[]
  researchItems: Pick<Research, "id" | "title" | "source_type" | "content_summary">[]
  currentTime: string
  workspaceId: string
  userId: string
}

export async function buildUserContext(): Promise<UserContext | null> {
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
  const weekEnd = new Date(todayStart.getTime() + 7 * 86_400_000)

  const [
    profileResult,
    tasksResult,
    eventsResult,
    goalsResult,
    habitsResult,
    focusTodayResult,
    focusWeekResult,
    graphResult,
    decisionsResult,
    notesResult,
    researchResult,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, persona, score_weights").eq("id", user.id).single(),
    supabase.from("tasks").select("id, title, status, priority, due_date")
      .eq("workspace_id", workspaceId).eq("user_id", user.id)
      .in("status", ["backlog", "in_progress", "review"])
      .order("priority", { ascending: true }).limit(20),
    supabase.from("events").select("id, title, start_time, end_time")
      .eq("workspace_id", workspaceId).eq("user_id", user.id)
      .gte("start_time", now.toISOString())
      .lte("start_time", weekEnd.toISOString())
      .order("start_time", { ascending: true }).limit(10),
    supabase.from("goals").select("id, title, timeframe, progress, status, target_date")
      .eq("workspace_id", workspaceId).eq("user_id", user.id)
      .in("status", ["active", "at_risk", "stalled"]).limit(10),
    supabase.from("habits").select("id, name, frequency, streak_count, longest_streak, target_count")
      .eq("workspace_id", workspaceId).eq("user_id", user.id).limit(10),
    supabase.from("focus_sessions").select("duration_minutes")
      .eq("workspace_id", workspaceId).eq("user_id", user.id).eq("completed", true)
      .gte("created_at", todayStart.toISOString()).lt("created_at", todayEnd.toISOString()),
    supabase.from("focus_sessions").select("duration_minutes")
      .eq("workspace_id", workspaceId).eq("user_id", user.id).eq("completed", true)
      .gte("created_at", todayStart.toISOString()).lt("created_at", weekEnd.toISOString()),
    supabase.from("graph_edges").select("id, source_type, source_id, target_type, target_id, edge_type")
      .eq("workspace_id", workspaceId).limit(50),
    supabase.from("decision_memory").select("id, action, rationale, outcome, created_at")
      .eq("workspace_id", workspaceId).eq("ai_generated", true)
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("notes").select("id, title, tags")
      .eq("workspace_id", workspaceId).eq("user_id", user.id)
      .order("updated_at", { ascending: false }).limit(10),
    supabase.from("research").select("id, title, source_type, content_summary")
      .eq("workspace_id", workspaceId).eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(10),
  ])

  const profile = profileResult.data
  let taskWeight = 0.5, focusWeight = 0.3, habitWeight = 0.2
  if (profile?.score_weights && typeof profile.score_weights === "object" && "tasks" in profile.score_weights) {
    const w = profile.score_weights as Record<string, number>
    taskWeight = typeof w.tasks === "number" ? w.tasks : 0.5
    focusWeight = typeof w.focus === "number" ? w.focus : 0.3
    habitWeight = typeof w.habits === "number" ? w.habits : 0.2
    const sum = taskWeight + focusWeight + habitWeight
    if (sum > 0) { taskWeight /= sum; focusWeight /= sum; habitWeight /= sum }
  }

  const weeklyTaskCount = await supabase.from("tasks").select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId).eq("user_id", user.id).eq("status", "completed")
    .gte("completed_at", todayStart.toISOString()).lt("completed_at", weekEnd.toISOString())

  const taskScore = Math.min((weeklyTaskCount.count ?? 0) / 14, 1) * taskWeight * 100
  const focusMinWeek = (focusWeekResult.data ?? []).reduce((s, r) => s + (r.duration_minutes ?? 0), 0)
  const focusScore = Math.min(focusMinWeek / 600, 1) * focusWeight * 100
  const habitCount = (habitsResult.data ?? []).reduce((s, h) => s + h.streak_count, 0)
  const habitScore = Math.min(habitCount / 7, 1) * habitWeight * 100
  const totalScore = Math.round(taskScore + focusScore + habitScore)

  const focusToday = (focusTodayResult.data ?? []).reduce((s, r) => s + (r.duration_minutes ?? 0), 0)

  return {
    profile: profile ? {
      full_name: profile.full_name,
      persona: profile.persona,
      taskWeight, focusWeight, habitWeight,
    } : null,
    score: {
      total: totalScore,
      taskScore: Math.round(taskScore),
      focusScore: Math.round(focusScore),
      habitScore: Math.round(habitScore),
      taskWeight, focusWeight, habitWeight,
    },
    activeTasks: tasksResult.data ?? [],
    upcomingEvents: eventsResult.data ?? [],
    activeGoals: goalsResult.data ?? [],
    habits: habitsResult.data ?? [],
    focusToday,
    focusWeek: focusMinWeek,
    graphEdges: graphResult.data ?? [],
    recentDecisions: decisionsResult.data ?? [],
    recentNotes: notesResult.data ?? [],
    researchItems: researchResult.data ?? [],
    currentTime: now.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    workspaceId,
    userId: user.id,
  }
}
