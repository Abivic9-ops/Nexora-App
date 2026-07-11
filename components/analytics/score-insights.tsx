"use client"

import type { EventHistory } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  Circle,
} from "lucide-react"

const EVENT_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  created: { icon: Circle, color: "text-blue-400" },
  completed: { icon: CheckCircle2, color: "text-primary" },
  updated: { icon: TrendingUp, color: "text-amber-400" },
  deleted: { icon: AlertTriangle, color: "text-destructive" },
  moved: { icon: Clock, color: "text-blue-400" },
  checked_in: { icon: Target, color: "text-primary" },
}

function getEventConfig(eventType: string) {
  const key = Object.keys(EVENT_CONFIG).find((k) => eventType.toLowerCase().includes(k))
  return key ? EVENT_CONFIG[key] : { icon: Circle, color: "text-muted-foreground" }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ScoreInsights({ events }: { events: EventHistory[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-5">
        <h2 className="text-sm font-medium text-foreground">What Moved Your Score</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Activity will appear here as you complete tasks, log focus sessions, and check in habits.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">What Moved Your Score</h2>
        <p className="text-xs text-muted-foreground">
          Recent activity that impacted your Execution Score
        </p>
      </div>

      <div className="space-y-0.5">
        {events.map((event) => {
          const config = getEventConfig(event.event_type)
          const Icon = config.icon

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary/50"
            >
              <div className={cn("mt-0.5 shrink-0", config.color)}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium capitalize text-foreground">
                    {event.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {event.entity_type.replace(/_/g, " ")}
                  </span>
                </div>
                {event.summary && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {event.summary}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground/50">
                {formatTime(event.created_at)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
