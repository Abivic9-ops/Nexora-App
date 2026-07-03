"use client"

import { motion } from "framer-motion"
import {
  CheckSquare,
  FolderKanban,
  Target,
  Repeat2,
  Timer,
  FileText,
  Search,
  Newspaper,
  Bot,
  BarChart2,
  Settings,
  CalendarDays,
} from "lucide-react"

const modules = [
  {
    icon: CheckSquare,
    name: "Tasks",
    desc: "Kanban, list, and timeline views. Due dates, priorities, subtasks, and project links.",
  },
  {
    icon: FolderKanban,
    name: "Projects",
    desc: "Track your work in projects. Progress auto-derived from linked tasks in the graph.",
  },
  {
    icon: Target,
    name: "Goals",
    desc: "Yearly, quarterly, monthly. Linked to projects, monitored by your AI.",
  },
  {
    icon: Repeat2,
    name: "Habits",
    desc: "Daily consistency grid with live streak counters. Check in, close the loop.",
  },
  {
    icon: Timer,
    name: "Focus Mode",
    desc: "Full-screen deep-work sessions. Pomodoro, soundscapes, and distraction capture.",
  },
  {
    icon: FileText,
    name: "Notes",
    desc: "TipTap rich editor. Folders, pins, tags, instant search, and auto-save.",
  },
  {
    icon: CalendarDays,
    name: "Calendar",
    desc: "All-day and timed events with priority-colored task chips. Drag to time-block.",
  },
  {
    icon: Search,
    name: "Research",
    desc: "Save sources. AI distills articles into clean bullets. Filter by tag or section.",
  },
  {
    icon: Newspaper,
    name: "News",
    desc: "Topic-based AI briefings — signal, never noise. Save any article to Research.",
  },
  {
    icon: Bot,
    name: "Assistant",
    desc: "Threaded AI conversations. Streaming, multi-turn, context-aware of your graph.",
  },
  {
    icon: BarChart2,
    name: "Analytics",
    desc: "Execution Score, focus minutes, habits, heatmaps, and trend analysis.",
  },
  {
    icon: Settings,
    name: "Settings",
    desc: "Profile, appearance, notifications, focus defaults, and data export — fully yours.",
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const card = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] } },
}

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28">
      {/* Label */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
        One System
      </p>
      <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Twelve surfaces. One mind.
      </h2>
      <p className="mb-14 max-w-xl text-muted-foreground">
        Every module composes onto the others. Tasks link to projects. Projects link to goals. Focus
        sessions feed analytics. Nothing is a silo.
      </p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {modules.map((mod) => (
          <motion.div
            key={mod.name}
            variants={card}
            className="group flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:bg-card/80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <mod.icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{mod.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mod.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
