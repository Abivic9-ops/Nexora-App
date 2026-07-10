"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { Timer, StopCircle, Target, ListChecks, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FocusSession } from "@/services/focus.client"
import { getTodaysSessions, getTasksForFocus, createFocusSession } from "@/services/focus.client"
import { PomodoroTimer } from "./pomodoro-timer"
import { StopwatchTimer } from "./stopwatch-timer"

type FocusMode = "pomodoro" | "stopwatch"

export function FocusPageShell({
  initialSessions,
  workspaceId,
  userId,
}: {
  initialSessions: FocusSession[]
  workspaceId: string
  userId: string
}) {
  const [mode, setMode] = useState<FocusMode>("pomodoro")
  const [sessions, setSessions] = useState<FocusSession[]>(initialSessions)
  const [intent, setIntent] = useState("")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [distractions, setDistractions] = useState(0)
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([])
  const [showTaskList, setShowTaskList] = useState(false)
  const [taskSearch, setTaskSearch] = useState("")

  useEffect(() => {
    getTasksForFocus(workspaceId).then(setTasks)
  }, [workspaceId])

  const refreshSessions = useCallback(async () => {
    const updated = await getTodaysSessions(workspaceId)
    setSessions(updated)
  }, [workspaceId])

  const logDistraction = useCallback(() => {
    setDistractions((d) => d + 1)
    toast("Distraction logged", {
      description: `Tracked ${distractions + 1} distraction${distractions > 0 ? "s" : ""}`,
      duration: 1500,
    })
  }, [distractions])

  const handleSessionComplete = useCallback(
    async (durationMinutes: number, phase?: string) => {
      if (durationMinutes < 1) return

      const now = new Date().toISOString()
      const startTime = new Date(Date.now() - durationMinutes * 60000).toISOString()
      const distLog = distractions > 0 ? `${distractions} distraction(s)` : null

      await createFocusSession({
        workspace_id: workspaceId,
        user_id: userId,
        task_id: taskId,
        session_type: mode,
        start_time: startTime,
        end_time: now,
        duration_minutes: durationMinutes,
        intent: intent || null,
        distractions: distLog,
        completed: true,
      })

      setDistractions(0)

      await refreshSessions()
    },
    [workspaceId, userId, taskId, mode, intent, distractions, refreshSessions],
  )

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(taskSearch.toLowerCase()),
  )

  const todayMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
  const todayHours = Math.floor(todayMinutes / 60)
  const todayMins = todayMinutes % 60

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Focus</h1>
          <p className="text-xs text-muted-foreground">
            {todayHours > 0
              ? `${todayHours}h ${todayMins}m focused today`
              : `${todayMins}m focused today`}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── Main timer area ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          {/* Mode toggle */}
          <div className="mb-8 flex items-center gap-1 rounded-xl bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setMode("pomodoro")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                mode === "pomodoro"
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Timer size={14} />
              Pomodoro
            </button>
            <button
              type="button"
              onClick={() => setMode("stopwatch")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                mode === "stopwatch"
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <StopCircle size={14} />
              Stopwatch
            </button>
          </div>

          {/* Intent + Task selector */}
          <div className="mb-8 flex w-full max-w-md flex-col gap-3">
            <div className="relative">
              <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="What do you want to achieve?"
                className="w-full rounded-xl border border-border/40 bg-white/[0.02] py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/40 focus:bg-white/[0.04]"
              />
            </div>

            <div className="relative">
              <ListChecks
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowTaskList((v) => !v)}
                className="w-full rounded-xl border border-border/40 bg-white/[0.02] py-2.5 pl-9 pr-3 text-left text-sm text-muted-foreground/70 outline-none transition-all focus:border-primary/40 focus:bg-white/[0.04]"
              >
                {taskId
                  ? tasks.find((t) => t.id === taskId)?.title ?? "Linked task"
                  : "Link a task (optional)"}
              </button>
              {showTaskList && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border/40 bg-[#0D0D0D] shadow-xl">
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full border-b border-border/40 bg-transparent px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setTaskId(null)
                        setShowTaskList(false)
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-white/[0.04]"
                    >
                      None — no task
                    </button>
                    {filteredTasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTaskId(t.id)
                          setShowTaskList(false)
                          setTaskSearch("")
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.04]",
                          taskId === t.id
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        {t.title}
                      </button>
                    ))}
                    {filteredTasks.length === 0 && (
                      <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                        No tasks found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timer */}
          {mode === "pomodoro" ? (
            <PomodoroTimer onSessionComplete={handleSessionComplete} />
          ) : (
            <StopwatchTimer onSessionComplete={handleSessionComplete} />
          )}

          {/* Distraction button */}
          <button
            type="button"
            onClick={logDistraction}
            className="mt-6 flex items-center gap-2 rounded-full border border-border/40 px-4 py-1.5 text-[11px] text-muted-foreground transition-all hover:border-border hover:text-foreground"
          >
            <AlertTriangle size={12} />
            Log distraction
            {distractions > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-500">
                {distractions}
              </span>
            )}
          </button>
        </div>

        {/* ── Session history sidebar ── */}
        <div className="w-full border-t border-border/40 lg:w-72 lg:border-l lg:border-t-0">
          <div className="px-4 py-3">
            <h2 className="text-xs font-medium text-foreground">Today</h2>
          </div>
          <div className="flex flex-col gap-1 px-3 pb-4">
            {sessions.length === 0 ? (
              <div className="px-1 py-8 text-center">
                <p className="text-[11px] text-muted-foreground">
                  No sessions yet today.
                </p>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground capitalize">
                      {s.session_type === "pomodoro" ? "Pomodoro" : "Stopwatch"}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {s.duration_minutes}m
                    </span>
                  </div>
                  {s.intent && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {s.intent}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {s.distractions && (
                      <span className="text-[10px] text-amber-500/70">
                        {s.distractions}
                      </span>
                    )}
                    {s.completed && (
                      <span className="text-[10px] text-primary">Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
