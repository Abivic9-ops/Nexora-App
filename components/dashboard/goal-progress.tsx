import type { GoalSummary } from "@/services/dashboard"
import { cn } from "@/lib/utils"

const TIMEFRAME_COLORS: Record<string, string> = {
  yearly: "bg-amber-500",
  quarterly: "bg-primary",
  monthly: "bg-emerald-500",
}

const STATUS_LABELS: Record<string, string> = {
  active: "On track",
  at_risk: "At risk",
  stalled: "Stalled",
}

export function GoalProgress({ goals }: { goals: GoalSummary[] }) {
  if (goals.length === 0) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-5">
        <p className="text-sm font-medium text-foreground">Goal momentum</p>
        <div className="mt-8 flex flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">No goals yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Set your first goal to track progress here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <p className="text-sm font-medium text-foreground">Goal momentum</p>
      <div className="mt-4 flex flex-col gap-4">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  TIMEFRAME_COLORS[goal.timeframe] ?? "bg-primary"
                )} />
                <p className="truncate text-sm text-foreground">{goal.title}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{goal.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  goal.status === "at_risk"
                    ? "bg-amber-500"
                    : goal.status === "stalled"
                      ? "bg-red-500"
                      : "bg-primary"
                )}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/60 capitalize">{goal.timeframe}</span>
              <span className={cn(
                "text-[11px] font-medium",
                goal.status === "at_risk" && "text-amber-500",
                goal.status === "stalled" && "text-red-500",
                goal.status === "active" && "text-emerald-500",
              )}>
                {STATUS_LABELS[goal.status] ?? goal.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
