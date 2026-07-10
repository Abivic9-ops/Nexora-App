"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Play, Pause, RotateCcw, Flag } from "lucide-react"
import { cn } from "@/lib/utils"

export function StopwatchTimer({
  onSessionComplete,
}: {
  onSessionComplete: (minutes: number) => void
}) {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const startTimeRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (!startTimeRef.current) return
    const now = Date.now()
    const total = pausedElapsedRef.current + (now - startTimeRef.current)
    setElapsed(total)
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setRunning(true)
    setPaused(false)
    clearTimer()
    intervalRef.current = setInterval(tick, 50)
  }, [clearTimer, tick])

  const pauseTimer = useCallback(() => {
    if (startTimeRef.current) {
      pausedElapsedRef.current += Date.now() - startTimeRef.current
    }
    clearTimer()
    setPaused(true)
    setRunning(false)
  }, [clearTimer])

  const resetTimer = useCallback(() => {
    clearTimer()
    setRunning(false)
    setPaused(false)
    setElapsed(0)
    setLaps([])
    startTimeRef.current = null
    pausedElapsedRef.current = 0
  }, [clearTimer])

  const addLap = useCallback(() => {
    setLaps((prev) => [elapsed, ...prev])
  }, [elapsed])

  const finishSession = useCallback(() => {
    const minutes = Math.round(elapsed / 60000)
    if (minutes > 0) {
      onSessionComplete(minutes)
    }
    resetTimer()
  }, [elapsed, onSessionComplete, resetTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const totalMs = elapsed
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const centiseconds = Math.floor((totalMs % 1000) / 10)

  const hh = String(hours).padStart(2, "0")
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  const cs = String(centiseconds).padStart(2, "0")

  const display = hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer display */}
      <div className="relative flex items-center justify-center">
        <svg className="h-48 w-48" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/[0.06]"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
            {display}
          </span>
          {hours === 0 && (
            <span className="text-lg tabular-nums text-muted-foreground">
              {cs}
            </span>
          )}
        </div>
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

        {running && (
          <button
            type="button"
            onClick={addLap}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all hover:border-border hover:text-foreground"
            aria-label="Lap"
          >
            <Flag size={13} />
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

      {/* Save button */}
      {elapsed > 0 && !running && (
        <button
          type="button"
          onClick={finishSession}
          className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20"
        >
          Save session ({Math.round(elapsed / 60000)} min)
        </button>
      )}

      {/* Laps */}
      {laps.length > 0 && (
        <div className="flex w-full max-w-xs flex-col gap-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Laps
          </p>
          {laps.map((lap, idx) => {
            const lapMin = Math.floor(lap / 60000)
            const lapSec = Math.floor((lap % 60000) / 1000)
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-1.5"
              >
                <span className="text-xs text-muted-foreground">
                  Lap {laps.length - idx}
                </span>
                <span className="text-xs tabular-nums text-foreground">
                  {lapMin}:{String(lapSec).padStart(2, "0")}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
