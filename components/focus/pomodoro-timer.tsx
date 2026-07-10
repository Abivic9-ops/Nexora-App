"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUS_MINUTES = 25
const SHORT_BREAK_MINUTES = 5
const LONG_BREAK_MINUTES = 15

type Phase = "focus" | "short_break" | "long_break"

const PHASE_CONFIG: Record<Phase, { label: string; icon: typeof Brain; color: string }> = {
  focus: { label: "Focus", icon: Brain, color: "text-primary" },
  short_break: { label: "Short break", icon: Coffee, color: "text-amber-500" },
  long_break: { label: "Long break", icon: Coffee, color: "text-blue-500" },
}

export function PomodoroTimer({
  onSessionComplete,
}: {
  onSessionComplete: (minutes: number, phase: Phase) => void
}) {
  const [phase, setPhase] = useState<Phase>("focus")
  const [cycleCount, setCycleCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTimeRef = useRef<number | null>(null)

  const phaseMinutes =
    phase === "focus"
      ? FOCUS_MINUTES
      : phase === "short_break"
        ? SHORT_BREAK_MINUTES
        : LONG_BREAK_MINUTES

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (!endTimeRef.current) return
    const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
    setTimeLeft(remaining)

    if (remaining <= 0) {
      clearTimer()
      setRunning(false)
      setPaused(false)

      const elapsedMinutes = phaseMinutes
      onSessionComplete(elapsedMinutes, phase)

      if (phase === "focus") {
        const newCycle = cycleCount + 1
        setCycleCount(newCycle)
        const nextPhase: Phase = newCycle % 4 === 0 ? "long_break" : "short_break"
        setPhase(nextPhase)
        setTimeLeft(
          nextPhase === "long_break"
            ? LONG_BREAK_MINUTES * 60
            : SHORT_BREAK_MINUTES * 60,
        )
      } else {
        setPhase("focus")
        setTimeLeft(FOCUS_MINUTES * 60)
      }
    }
  }, [phase, phaseMinutes, cycleCount, onSessionComplete, clearTimer])

  const startTimer = useCallback(() => {
    endTimeRef.current = Date.now() + timeLeft * 1000
    setRunning(true)
    setPaused(false)
    clearTimer()
    intervalRef.current = setInterval(tick, 200)
  }, [timeLeft, clearTimer, tick])

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPaused(true)
    setRunning(false)
  }, [clearTimer])

  const resetTimer = useCallback(() => {
    clearTimer()
    setRunning(false)
    setPaused(false)
    setPhase("focus")
    setCycleCount(0)
    setTimeLeft(FOCUS_MINUTES * 60)
    endTimeRef.current = null
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = phaseMinutes * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100
  const config = PHASE_CONFIG[phase]
  const Icon = config.icon

  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase indicator */}
      <div className={cn("flex items-center gap-2 text-sm font-medium", config.color)}>
        <Icon size={16} />
        {config.label}
        {cycleCount > 0 && phase === "focus" && (
          <span className="text-muted-foreground text-[11px]">
            · Cycle {cycleCount + 1}
          </span>
        )}
      </div>

      {/* Timer display */}
      <div className="relative flex items-center justify-center">
        <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/[0.06]"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={cn(
              "transition-all duration-500",
              phase === "focus" ? "text-primary" : "text-amber-500",
            )}
          />
        </svg>
        <span className="absolute text-5xl font-bold tabular-nums tracking-tight text-foreground">
          {display}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running && !paused && (
          <button
            type="button"
            onClick={startTimer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            aria-label="Start"
          >
            <Play size={20} fill="currentColor" />
          </button>
        )}
        {running && (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 transition-all hover:bg-amber-500/30 hover:scale-105"
            aria-label="Pause"
          >
            <Pause size={20} fill="currentColor" />
          </button>
        )}
        {paused && (
          <button
            type="button"
            onClick={startTimer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            aria-label="Resume"
          >
            <Play size={20} fill="currentColor" />
          </button>
        )}
        <button
          type="button"
          onClick={resetTimer}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all hover:border-border hover:text-foreground"
          aria-label="Reset"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Phase indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full transition-all",
              i < (cycleCount % 4)
                ? "bg-primary"
                : "bg-white/[0.06]",
            )}
          />
        ))}
        <span className="ml-1 text-[10px] text-muted-foreground">
          {cycleCount} session{cycleCount !== 1 ? "s" : ""} completed
        </span>
      </div>
    </div>
  )
}
