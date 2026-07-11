"use client"

import type { ScoreBreakdown } from "@/services/analytics"

function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
}: {
  score: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

function WeightBar({
  label,
  raw,
  weight,
  score,
  color,
}: {
  label: string
  raw: number
  weight: number
  score: number
  color: string
}) {
  const pct = Math.round(raw * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {Math.round(weight * 100)}% weight
          </span>
          <span className="text-xs font-semibold text-foreground">{score} pts</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>{pct}% completion</span>
        <span>Target: 100%</span>
      </div>
    </div>
  )
}

export function ScoreBreakdownPanel({ score }: { score: ScoreBreakdown }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-foreground">Execution Score</h2>
        <p className="text-xs text-muted-foreground">
          Weighted composite of tasks, focus, and habits
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <ScoreRing score={score.total} />
        </div>

        <div className="flex-1 space-y-4">
          <WeightBar
            label="Tasks"
            raw={score.taskRaw}
            weight={score.taskWeight}
            score={score.taskScore}
            color="#10B981"
          />
          <WeightBar
            label="Focus"
            raw={score.focusRaw}
            weight={score.focusWeight}
            score={score.focusScore}
            color="#3B82F6"
          />
          <WeightBar
            label="Habits"
            raw={score.habitRaw}
            weight={score.habitWeight}
            score={score.habitScore}
            color="#F59E0B"
          />
        </div>

        <div className="hidden w-px self-stretch bg-border/40 lg:block" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Formula</p>
          <p>
            <span className="text-primary">Tasks</span> = min(completed / 14, 1) x {Math.round(score.taskWeight * 100)}%
          </p>
          <p>
            <span className="text-blue-400">Focus</span> = min(minutes / 600, 1) x {Math.round(score.focusWeight * 100)}%
          </p>
          <p>
            <span className="text-amber-400">Habits</span> = min(logs / 7, 1) x {Math.round(score.habitWeight * 100)}%
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            Based on last 7 days of activity
          </p>
        </div>
      </div>
    </div>
  )
}
