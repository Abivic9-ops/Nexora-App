"use client"

import type { Goal } from "@/services/goals.client"
import { cn } from "@/lib/utils"
import { Target, Calendar, AlertTriangle, Pause, CheckCircle2, Archive } from "lucide-react"
import { format, isPast } from "date-fns"

const TIMEFRAME_LABELS: Record<Goal["timeframe"], string> = {
  yearly: "Yearly",
  quarterly: "Quarterly",
  monthly: "Monthly",
}

const STATUS_CONFIG: Record<
  Goal["status"],
  { label: string; color: string; icon: typeof Target }
> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500", icon: Target },
  at_risk: { label: "At Risk", color: "bg-red-500/10 text-red-500", icon: AlertTriangle },
  stalled: { label: "Stalled", color: "bg-amber-500/10 text-amber-500", icon: Pause },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-500", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground", icon: Archive },
}

export function GoalCard({
  goal,
  onClick,
}: {
  goal: Goal
  onClick: () => void
}) {
  const status = STATUS_CONFIG[goal.status]
  const StatusIcon = status.icon
  const isOverdue =
    isPast(new Date(goal.target_date)) && goal.status === "active"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border/40 bg-card p-5 text-left transition-all hover:border-border hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target size={18} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {TIMEFRAME_LABELS[goal.timeframe]}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              status.color,
            )}
          >
            <StatusIcon size={10} />
            {status.label}
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {goal.title}
      </h3>
      {goal.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {goal.description}
        </p>
      )}

      <div className="mt-auto pt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              goal.progress >= 100
                ? "bg-blue-500"
                : isOverdue
                  ? "bg-red-500"
                  : "bg-primary",
            )}
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {format(new Date(goal.start_date), "MMM d")} – {format(new Date(goal.target_date), "MMM d, yyyy")}
          </span>
          {isOverdue && (
            <span className="text-red-500 font-medium">Overdue</span>
          )}
        </div>
      </div>
    </button>
  )
}
