import type { LucideIcon } from "lucide-react"
import {
  Rocket,
  Code2,
  Palette,
  GraduationCap,
} from "lucide-react"

export interface PersonaPreset {
  id: string
  label: string
  description: string
  icon: LucideIcon
  defaultModules: string[]
  defaultHome: string
  defaultCadence: "daily" | "weekly"
  defaultWeights: { tasks: number; focus: number; habits: number }
}

export const ALL_MODULES = [
  "tasks",
  "projects",
  "goals",
  "habits",
  "focus",
  "notes",
  "research",
  "news",
  "calendar",
  "analytics",
  "assistant",
  "settings",
] as const

export type ModuleId = (typeof ALL_MODULES)[number]

export const MODULE_LABELS: Record<ModuleId, string> = {
  tasks: "Tasks",
  projects: "Projects",
  goals: "Goals",
  habits: "Habits",
  focus: "Focus Mode",
  notes: "Notes",
  research: "Research",
  news: "News",
  calendar: "Calendar",
  analytics: "Analytics",
  assistant: "Assistant",
  settings: "Settings",
}

export const MODULE_DESCRIPTIONS: Record<ModuleId, string> = {
  tasks: "Kanban, list, and timeline views with priorities and subtasks",
  projects: "Card grid with auto-derived progress from linked tasks",
  goals: "Yearly, quarterly, monthly vision cards with momentum tracking",
  habits: "Daily consistency grid with streak counters and check-ins",
  focus: "Full-screen deep work with Pomodoro and soundscapes",
  notes: "Rich editor with folders, tags, and auto-save",
  research: "Save sources, AI distills articles, filter by tag",
  news: "Topic-based AI briefings — signal, never noise",
  calendar: "Day/week/month views with task chips and drag-to-block",
  analytics: "Execution Score, heatmaps, trends, and insights",
  assistant: "Threaded AI that reads your execution graph",
  settings: "Profile, appearance, notifications, and data export",
}

export const personas: PersonaPreset[] = [
  {
    id: "founder",
    label: "Founder",
    description: "Building a company. Juggling product, team, fundraising, and strategy.",
    icon: Rocket,
    defaultModules: [...ALL_MODULES],
    defaultHome: "dashboard",
    defaultCadence: "daily",
    defaultWeights: { tasks: 0.4, focus: 0.4, habits: 0.2 },
  },
  {
    id: "engineer",
    label: "Engineer",
    description: "Writing code, shipping features, documenting decisions, tracking sprints.",
    icon: Code2,
    defaultModules: [...ALL_MODULES],
    defaultHome: "tasks",
    defaultCadence: "daily",
    defaultWeights: { tasks: 0.5, focus: 0.3, habits: 0.2 },
  },
  {
    id: "creator",
    label: "Creator",
    description: "Producing content, managing pipelines, researching, and meeting deadlines.",
    icon: Palette,
    defaultModules: [
      "tasks",
      "projects",
      "goals",
      "habits",
      "focus",
      "notes",
      "calendar",
      "analytics",
      "assistant",
      "settings",
    ],
    defaultHome: "notes",
    defaultCadence: "daily",
    defaultWeights: { tasks: 0.3, focus: 0.4, habits: 0.3 },
  },
  {
    id: "student",
    label: "Student",
    description: "Managing courses, assignments, research, and building compounding habits.",
    icon: GraduationCap,
    defaultModules: [
      "tasks",
      "goals",
      "habits",
      "focus",
      "notes",
      "calendar",
      "analytics",
      "assistant",
      "settings",
    ],
    defaultHome: "tasks",
    defaultCadence: "weekly",
    defaultWeights: { tasks: 0.4, focus: 0.3, habits: 0.3 },
  },
]
