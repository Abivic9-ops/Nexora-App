import type { UserContext } from "./context"

const NEXORA_SYSTEM_PROMPT = `You are the NEXORA Assistant — an execution-focused AI co-pilot built for builders, operators, and founders.

## Core Identity
You are NOT a generic chatbot. You are a planning executor, research partner, and strategic advisor embedded directly in the user's workspace. You have full context of their goals, tasks, habits, focus sessions, notes, and research.

## What You Do
- **Plan**: Help users structure their day/week using their actual task deadlines, meetings, and goals
- **Triage**: Prioritize tasks based on deadlines, dependencies, and importance
- **Coach**: Reference execution scores, habit streaks, and focus patterns to give personalized advice
- **Research**: Synthesize information from notes and research items into actionable insights
- **Execute**: Suggest specific next steps with clear rationale tied to the user's context

## Response Style
- Be concise and direct. Prefer bullet points and structured lists over prose.
- Use **bold** for key actions and deadlines.
- Reference specific data from the user's context: "Your P1 task 'Design audit' is due tomorrow" not "You have a task due soon."
- When suggesting actions, state the rationale tied to their goals/score.
- Use tables for comparisons and schedules.

## Important Rules
- Never hallucinate data. If you don't have context about something, say so.
- Always ground recommendations in the user's actual data.
- When you recommend a decision that should be remembered, mention it so it can be recorded.
- If the user asks something outside your scope, redirect them to the appropriate module.`

export function buildSystemPrompt(ctx: UserContext): string {
  const sections: string[] = [NEXORA_SYSTEM_PROMPT]

  sections.push(`\n## Current Date & Time\n${ctx.currentTime}`)

  if (ctx.profile) {
    const p = ctx.profile
    sections.push(`\n## User Profile
- Name: ${p.full_name ?? "Not set"}
- Persona: ${p.persona ?? "General"}
- Score weights: Tasks ${Math.round(p.taskWeight * 100)}% / Focus ${Math.round(p.focusWeight * 100)}% / Habits ${Math.round(p.habitWeight * 100)}%`)
  }

  if (ctx.score) {
    const s = ctx.score
    sections.push(`\n## Execution Score
- Current score: **${s.total}/100**
- Task score: ${s.taskScore}/100 (weight: ${Math.round(s.taskWeight * 100)}%)
- Focus score: ${s.focusScore}/100 (weight: ${Math.round(s.focusWeight * 100)}%)
- Habit score: ${s.habitScore}/100 (weight: ${Math.round(s.habitWeight * 100)}%)`)
  }

  if (ctx.activeTasks.length > 0) {
    const taskLines = ctx.activeTasks.map(
      (t) => `- [${t.priority.toUpperCase()}] "${t.title}" — status: ${t.status}${t.due_date ? `, due: ${t.due_date}` : ""}`
    )
    sections.push(`\n## Active Tasks\n${taskLines.join("\n")}`)
  }

  if (ctx.upcomingEvents.length > 0) {
    const eventLines = ctx.upcomingEvents.map(
      (e) => `- "${e.title}" — ${formatTimeRange(e.start_time, e.end_time)}`
    )
    sections.push(`\n## Upcoming Events (next 7 days)\n${eventLines.join("\n")}`)
  }

  if (ctx.activeGoals.length > 0) {
    const goalLines = ctx.activeGoals.map(
      (g) => `- "${g.title}" — ${g.timeframe}, progress: ${g.progress}%, status: ${g.status}, target: ${g.target_date}`
    )
    sections.push(`\n## Active Goals\n${goalLines.join("\n")}`)
  }

  if (ctx.habits.length > 0) {
    const habitLines = ctx.habits.map(
      (h) => `- "${h.name}" — ${h.frequency}, streak: ${h.streak_count}/${h.longest_streak} best, target: ${h.target_count}/day`
    )
    sections.push(`\n## Habits\n${habitLines.join("\n")}`)
  }

  if (ctx.focusToday > 0 || ctx.focusWeek > 0) {
    sections.push(`\n## Focus Time
- Today: ${ctx.focusToday} minutes
- This week: ${ctx.focusWeek} minutes`)
  }

  if (ctx.graphEdges.length > 0) {
    const edgeLines = ctx.graphEdges.slice(0, 30).map(
      (e) => `- ${e.source_type}:${e.source_id.slice(0, 8)} —[${e.edge_type}]→ ${e.target_type}:${e.target_id.slice(0, 8)}`
    )
    sections.push(`\n## Execution Graph (key relationships)\n${edgeLines.join("\n")}`)
  }

  if (ctx.recentDecisions.length > 0) {
    const decisionLines = ctx.recentDecisions.map(
      (d) => `- Action: ${d.action} | Rationale: ${d.rationale.slice(0, 120)}${d.outcome ? ` | Outcome: ${d.outcome}` : ""}`
    )
    sections.push(`\n## Recent AI Decisions\n${decisionLines.join("\n")}`)
  }

  if (ctx.recentNotes.length > 0) {
    const noteLines = ctx.recentNotes.map(
      (n) => `- "${n.title}"${n.tags.length > 0 ? ` [${n.tags.join(", ")}]` : ""}`
    )
    sections.push(`\n## Recent Notes\n${noteLines.join("\n")}`)
  }

  if (ctx.researchItems.length > 0) {
    const researchLines = ctx.researchItems.map(
      (r) => `- "${r.title}" — ${r.source_type ?? "unknown source"}`
    )
    sections.push(`\n## Saved Research\n${researchLines.join("\n")}`)
  }

  return sections.join("\n")
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
  return `${s.toLocaleDateString("en-US", opts)} → ${e.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
}
