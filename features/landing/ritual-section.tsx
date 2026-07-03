"use client"

import { motion } from "framer-motion"
import { CalendarCheck, Timer, Repeat2, BarChart2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    icon: CalendarCheck,
    label: "Plan the day",
    desc: "Open the planning mode, get a prioritized plan for the next 8 hours, approve in one click.",
  },
  {
    icon: Timer,
    label: "Run a focus block",
    desc: "Pick a task, lock in a time window, eliminate distractions, capture interruptions in-session.",
  },
  {
    icon: Repeat2,
    label: "Close the loop",
    desc: "Mark habits done. Your execution score updates in real time. Close tasks. Reflect briefly.",
  },
  {
    icon: BarChart2,
    label: "Review the week",
    desc: "Analytics surface your wins, misses, and patterns. Your AI writes the narrative.",
  },
]

const scoreMetrics = [
  { label: "Task completion", value: 92, color: "bg-primary" },
  { label: "Focus adherence", value: 78, color: "bg-primary/70" },
  { label: "Habit consistency", value: 86, color: "bg-primary/50" },
]

export function RitualSection() {
  return (
    <section id="manifesto" className="border-t border-border/40 bg-card/30 py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Eyebrow */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
          Daily Ritual
        </p>
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          From intent to execution —{" "}
          <span className="text-muted-foreground">every single day.</span>
        </h2>
        <p className="mb-16 max-w-lg text-muted-foreground">
          NEXORA is designed around a single rhythm: capture intent, run a focused day, close the
          loop, repeat. Consistency becomes the default.
        </p>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Steps */}
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] }}
                className="flex gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card">
                  <step.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Execution Score panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] }}
            className="rounded-xl border border-border/60 bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_32px_rgba(0,0,0,0.3)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Execution Score
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">Today</p>
              </div>
              <span className="text-5xl font-bold tracking-tight text-foreground">87</span>
            </div>

            <div className="flex flex-col gap-4">
              {scoreMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-xs font-medium text-foreground">{metric.value}%</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
              Formula: <span className="text-foreground">0.5 × tasks</span> +{" "}
              <span className="text-foreground">0.3 × focus</span> +{" "}
              <span className="text-foreground">0.2 × habits</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
