"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subWeeks,
  addWeeks,
  isSameDay,
} from "date-fns"
import { getHabits, createHabit, getLogsForDateRange, upsertHabitLog, deleteHabit, deleteHabitLog } from "@/services/habits.client"
import type { Habit, HabitLog } from "@/services/habits.client"
import { NewHabitDialog } from "./new-habit-dialog"
import { Repeat2, Plus, ChevronLeft, ChevronRight, Trash2, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function HabitPageShell({
  initialHabits,
  workspaceId,
  userId,
}: {
  initialHabits: Habit[]
  workspaceId: string
  userId: string
}) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [weekOffset, setWeekOffset] = useState(0)
  const [logs, setLogs] = useState<HabitLog[]>([])

  const weekStart = useMemo(
    () => startOfWeek(subWeeks(new Date(), -weekOffset), { weekStartsOn: 1 }),
    [weekOffset],
  )
  const weekEnd = useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart],
  )
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd],
  )

  const fetchLogs = useCallback(async () => {
    const data = await getLogsForDateRange(
      workspaceId,
      format(weekStart, "yyyy-MM-dd"),
      format(weekEnd, "yyyy-MM-dd"),
    )
    setLogs(data)
  }, [workspaceId, weekStart, weekEnd])

  useMemo(() => {
    fetchLogs()
  }, [fetchLogs])

  const refreshHabits = useCallback(async () => {
    const updated = await getHabits(workspaceId)
    setHabits(updated)
  }, [workspaceId])

  const handleCreateHabit = useCallback(
    async (data: { name: string; description?: string; frequency: string; target_count: number }) => {
      const result = await createHabit({
        workspace_id: workspaceId,
        user_id: userId,
        name: data.name,
        description: data.description || null,
        frequency: data.frequency as Habit["frequency"],
        target_count: data.target_count,
      })
      if (result) {
        await refreshHabits()
      } else {
        toast.error("Failed to create habit")
      }
    },
    [workspaceId, userId, refreshHabits],
  )

  const handleToggle = useCallback(
    async (habitId: string, date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const existing = logs.find(
        (l) => l.habit_id === habitId && l.log_date === dateStr,
      )

      if (existing) {
        await deleteHabitLog(existing.id)
        setLogs((prev) => prev.filter((l) => l.id !== existing.id))
      } else {
        const result = await upsertHabitLog({
          habit_id: habitId,
          workspace_id: workspaceId,
          user_id: userId,
          log_date: dateStr,
          count: 1,
        })
        if (result) {
          setLogs((prev) => [...prev, result])
        } else {
          toast.error("Failed to log habit")
        }
      }
    },
    [logs, workspaceId, userId],
  )

  const isChecked = useCallback(
    (habitId: string, date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      return logs.some((l) => l.habit_id === habitId && l.log_date === dateStr)
    },
    [logs],
  )

  const getStreakCount = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId)
      return habit?.streak_count ?? 0
    },
    [habits],
  )

  const isToday = useCallback((date: Date) => {
    return isSameDay(date, new Date())
  }, [])

  const navigatePrev = useCallback(() => setWeekOffset((o) => o - 1), [])
  const navigateNext = useCallback(() => setWeekOffset((o) => o + 1), [])
  const navigateToday = useCallback(() => setWeekOffset(0), [])

  const totalStreak = habits.reduce((sum, h) => sum + h.streak_count, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Habits</h1>
          <p className="text-xs text-muted-foreground">
            {habits.length} habit{habits.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewHabitDialog onCreateHabit={handleCreateHabit}>
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Plus size={14} />
            New habit
          </span>
        </NewHabitDialog>
      </div>

      {habits.length > 0 && totalStreak > 0 && (
        <div className="flex items-center gap-2 border-b border-border/40 px-6 py-2">
          <Flame size={14} className="text-amber-500" />
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{totalStreak}</span> total day
            streak{totalStreak !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-border/40 px-6 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={navigateToday}
            className="rounded-md border border-border/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            This week
          </button>
          <button
            type="button"
            onClick={navigatePrev}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={navigateNext}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronRight size={13} />
          </button>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Repeat2 size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">No habits yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first habit to start building consistency.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Grid header: day labels */}
              <div className="grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))_80px] gap-px mb-px">
                <div className="flex items-center px-3 py-2">
                  <span className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    Habit
                  </span>
                </div>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "flex items-center justify-center py-2",
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                        {format(day, "EEE")}
                      </span>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                          isToday(day) && "bg-primary text-primary-foreground",
                          !isToday(day) && "text-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center px-3 py-2">
                  <span className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    Streak
                  </span>
                </div>
              </div>

              {/* Habit rows */}
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-[1fr_repeat(7,minmax(48px,1fr))_80px] gap-px border-t border-border/20 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 px-3 py-3 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
                      <Repeat2 size={13} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {habit.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {habit.frequency === "daily" ? "Daily" : "Weekly"} · {habit.target_count}x
                      </p>
                    </div>
                  </div>

                  {days.map((day) => {
                    const checked = isChecked(habit.id, day)
                    return (
                      <div
                        key={`${habit.id}-${day.toISOString()}`}
                        className="flex items-center justify-center py-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggle(habit.id, day)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border transition-all",
                            checked
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border/30 text-muted-foreground hover:border-border/60 hover:bg-white/[0.03]",
                            isToday(day) && "ring-1 ring-primary/20",
                          )}
                        >
                          {checked && (
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3 8.5L6.5 12L13 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}

                  <div className="flex items-center justify-center gap-1.5 px-3 py-2">
                    <Flame
                      size={13}
                      className={cn(
                        habit.streak_count > 0 ? "text-amber-500" : "text-muted-foreground/40",
                      )}
                    />
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      {habit.streak_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
