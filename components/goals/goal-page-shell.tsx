"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { getGoals, createGoal } from "@/services/goals.client"
import type { Goal } from "@/services/goals.client"
import { GoalCard } from "./goal-card"
import { GoalDetailDrawer } from "./goal-detail-drawer"
import { NewGoalDialog } from "./new-goal-dialog"
import { Target, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type TimeframeFilter = "all" | Goal["timeframe"]

const TIMEFRAME_FILTERS: { value: TimeframeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yearly", label: "Yearly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
]

export function GoalPageShell({
  initialGoals,
  workspaceId,
  userId,
}: {
  initialGoals: Goal[]
  workspaceId: string
  userId: string
}) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [filter, setFilter] = useState<TimeframeFilter>("all")
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshGoals = useCallback(async () => {
    const updated = await getGoals(workspaceId)
    setGoals(updated)
  }, [workspaceId])

  const handleCreateGoal = useCallback(
    async (data: {
      title: string
      description?: string
      timeframe: string
      start_date: string
      target_date: string
      status: string
    }) => {
      const supabase = createBrowserClient()
      const { data: result, error } = await supabase
        .from("goals")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          title: data.title,
          description: data.description || null,
          timeframe: data.timeframe as Goal["timeframe"],
          start_date: data.start_date,
          target_date: data.target_date,
          status: data.status as Goal["status"],
          progress: 0,
        })
        .select("*")
        .single()

      if (error) {
        toast.error("Failed to create goal")
        return
      }
      if (result) {
        await refreshGoals()
        toast.success("Goal created")
      }
    },
    [workspaceId, userId, refreshGoals],
  )

  const handleGoalDeleted = useCallback((_id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== _id))
  }, [])

  const filtered =
    filter === "all" ? goals : goals.filter((g) => g.timeframe === filter)

  const activeCount = goals.filter((g) => g.status === "active" || g.status === "at_risk").length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Goals</h1>
          <p className="text-xs text-muted-foreground">
            {activeCount} active goal{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <NewGoalDialog onCreateGoal={handleCreateGoal}>
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Plus size={14} />
            New goal
          </span>
        </NewGoalDialog>
      </div>

      <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2">
        {TIMEFRAME_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Target size={24} className="text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">
              {filter === "all" ? "No goals yet" : `No ${filter} goals`}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {filter === "all"
                ? "Set your first goal to start tracking progress."
                : "Try a different timeframe filter."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => {
                  setSelectedGoal(goal)
                  setDrawerOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <GoalDetailDrawer
        goal={selectedGoal}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onGoalUpdated={refreshGoals}
        onGoalDeleted={handleGoalDeleted}
      />
    </div>
  )
}
