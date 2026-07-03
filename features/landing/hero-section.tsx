"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronRight } from "lucide-react"
import { PriorityChip } from "@/components/ui/priority-chip"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center">
      {/* Subtle radial glow — behind hero content only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[900px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center gap-6"
      >
        {/* Eyebrow */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI-powered execution OS · Built for operators
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1 variants={item} className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          <span className="block text-foreground">Master your day.</span>
          {/* THE ONE SANCTIONED GRADIENT */}
          <span
            className="block"
            style={{
              background: "linear-gradient(90deg, #10B981 0%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Build your legacy.
          </span>
        </motion.h1>

        {/* Subcopy */}
        <motion.p
          variants={item}
          className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          NEXORA unifies tasks, projects, goals, habits, deep focus, notes, research, news, and an AI
          assistant — into a single, calm, premium workspace engineered for serious operators.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start free
            <ArrowRight size={14} />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explore the system
            <ChevronRight size={14} />
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p variants={item} className="text-xs text-muted-foreground/60">
          Email · Google · Apple sign-in · No credit card
        </motion.p>
      </motion.div>

      {/* Product preview card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] }}
        className="relative z-10 mt-16 w-full max-w-3xl"
      >
        <PreviewCard />
      </motion.div>
    </section>
  )
}

function PreviewCard() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_48px_rgba(0,0,0,0.4)] text-left">
      {/* Top metrics row */}
      <div className="mb-6 grid grid-cols-3 gap-4 border-b border-border/40 pb-5">
        <div>
          <p className="text-xs text-muted-foreground">Execution Score</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">87</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Today's signal</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Deep Focus</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">2h 45m</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Active today</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Habits</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">6 / 7</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Completed today</p>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "To Do",
            tasks: [
              { title: "Design system audit", priority: 1 as const },
              { title: "Sprint planning — Q3", priority: 2 as const },
            ],
          },
          {
            label: "In Progress",
            tasks: [
              { title: "Sales funnel redesign", priority: 1 as const },
              { title: "Customer call — Acme", priority: 2 as const },
            ],
          },
          {
            label: "Done",
            tasks: [
              { title: "Onboarding notes", priority: 3 as const },
              { title: "Daily review", priority: 3 as const },
            ],
          },
        ].map((col) => (
          <div key={col.label}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{col.label}</p>
            <div className="flex flex-col gap-2">
              {col.tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex items-start gap-2 rounded-md border border-border/40 bg-secondary/40 p-2.5"
                >
                  <PriorityChip level={task.priority} className="mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/90 leading-snug">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
