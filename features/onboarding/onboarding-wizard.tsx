"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Code2,
  Palette,
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  BarChart2,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { saveOnboarding } from "@/lib/actions/onboarding"
import {
  personas,
  ALL_MODULES,
  MODULE_LABELS,
  MODULE_DESCRIPTIONS,
  type ModuleId,
} from "./persona-presets"

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */

interface WizardState {
  persona: string | null
  visibleModules: string[]
  defaultHome: string
  planningCadence: "daily" | "weekly"
  scoreWeights: { tasks: number; focus: number; habits: number }
  template: string | null
}

const defaultState: WizardState = {
  persona: null,
  visibleModules: [...ALL_MODULES],
  defaultHome: "dashboard",
  planningCadence: "daily",
  scoreWeights: { tasks: 0.5, focus: 0.3, habits: 0.2 },
  template: null,
}

const TOTAL_STEPS = 7

/* ─────────────────────────────────────────────────────────
   Animation variants
   ───────────────────────────────────────────────────────── */

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

/* ─────────────────────────────────────────────────────────
   Main Wizard Component
   ───────────────────────────────────────────────────────── */

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [saving, setSaving] = useState(false)
  const [state, setState] = useState<WizardState>(defaultState)
  const [error, setError] = useState("")

  const totalSteps = TOTAL_STEPS
  const progress = ((step + 1) / totalSteps) * 100

  const goNext = useCallback(() => {
    setDir(1)
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [])

  const goBack = useCallback(() => {
    setDir(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError("")
    const result = await saveOnboarding({
      persona: state.persona!,
      visibleModules: state.visibleModules,
      defaultHome: state.defaultHome,
      planningCadence: state.planningCadence,
      scoreWeights: state.scoreWeights,
    })
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
    // If no error, the server action redirects to the dashboard
  }, [state])

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return true // Welcome — always can continue
      case 1: return !!state.persona // Must pick a persona
      case 2: return state.visibleModules.length > 0 // At least some modules
      case 3: return !!state.defaultHome // Must pick a home
      case 4: return true // Always has a cadence
      case 5: {
        // Weights must sum to 1.0
        const w = state.scoreWeights
        const sum = w.tasks + w.focus + w.habits
        return Math.abs(sum - 1.0) < 0.01
      }
      case 6: return true // Summary — just needs review
      default: return false
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <Sparkles size={12} className="text-primary" />
          Step {step + 1} of {totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {step === 0 && <WelcomeStep onContinue={goNext} />}
              {step === 1 && (
                <PersonaStep
                  selected={state.persona}
                  onSelect={(p) => {
                    // When persona changes, apply its default settings
                    const preset = personas.find((x) => x.id === p)
                    if (preset) {
                      update({
                        persona: p,
                        visibleModules: preset.defaultModules,
                        defaultHome: preset.defaultHome,
                        planningCadence: preset.defaultCadence,
                        scoreWeights: preset.defaultWeights,
                      })
                    }
                  }}
                  onContinue={goNext}
                  onBack={goBack}
                />
              )}
              {step === 2 && (
                <ModulesStep
                  selected={state.visibleModules}
                  onChange={(modules) => update({ visibleModules: modules })}
                  onContinue={goNext}
                  onBack={goBack}
                />
              )}
              {step === 3 && (
                <HomeStep
                  selected={state.defaultHome}
                  enabledModules={state.visibleModules}
                  onChange={(home) => update({ defaultHome: home })}
                  onContinue={goNext}
                  onBack={goBack}
                />
              )}
              {step === 4 && (
                <CadenceStep
                  selected={state.planningCadence}
                  onChange={(c) => update({ planningCadence: c })}
                  onContinue={goNext}
                  onBack={goBack}
                />
              )}
              {step === 5 && (
                <FormulaStep
                  weights={state.scoreWeights}
                  onChange={(w) => update({ scoreWeights: w })}
                  onContinue={goNext}
                  onBack={goBack}
                  persona={state.persona}
                />
              )}
              {step === 6 && (
                <SummaryStep
                  state={state}
                  onBack={goBack}
                  onSave={handleSave}
                  saving={saving}
                  error={error}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom navigation (only for non-welcome/non-summary steps) */}
          {step > 0 && step < totalSteps - 1 && (
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!canContinue()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 0: Welcome
   ───────────────────────────────────────────────────────── */

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
        <Rocket size={28} className="text-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Welcome to NEXORA
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
        You are about to set up your personal execution operating system. This takes about two
        minutes. We will ask you about your role, your preferred modules, and how you want to
        measure success.
      </p>
      <div className="mt-8 flex flex-col gap-2 text-left text-sm text-muted-foreground">
        {[
          "Choose a persona that fits your work style",
          "Select which surfaces you want visible",
          "Set your planning rhythm and success formula",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <ChevronRight size={14} className="mt-0.5 shrink-0 text-primary" />
            {item}
          </div>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
      >
        Get started
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 1: Persona Selection
   ───────────────────────────────────────────────────────── */

function PersonaStep({
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step 1 of {TOTAL_STEPS - 1}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Who are you?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pick the role that best describes how you work. We will pre-configure your surfaces and
        defaults — you can tweak everything in the next steps.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {personas.map((p) => {
          const Icon = p.icon
          const isActive = selected === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-5 text-left transition-all",
                isActive
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/60 bg-card hover:border-border hover:bg-card/80",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isActive ? "bg-primary/15" : "bg-primary/5",
                )}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
              {isActive && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Check size={12} />
                  Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selected}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 2: Module Toggles
   ───────────────────────────────────────────────────────── */

function ModulesStep({
  selected,
  onChange,
  onContinue,
  onBack,
}: {
  selected: string[]
  onChange: (modules: string[]) => void
  onContinue: () => void
  onBack: () => void
}) {
  const toggle = (moduleId: string) => {
    // Settings is always enabled — cannot toggle it off
    if (moduleId === "settings") return
    if (selected.includes(moduleId)) {
      onChange(selected.filter((m) => m !== moduleId))
    } else {
      onChange([...selected, moduleId])
    }
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step 2 of {TOTAL_STEPS - 1}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Your surfaces
      </h2>
      <p className="mt-2 text-muted-foreground">
        Choose which modules you want in your NEXORA. You can always change this later in
        Settings. Settings itself is always enabled.
      </p>

      <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
        {ALL_MODULES.map((mod) => {
          const isOn = selected.includes(mod)
          const isLocked = mod === "settings"
          return (
            <button
              key={mod}
              onClick={() => toggle(mod)}
              disabled={isLocked}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all",
                isOn
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/40 bg-card/50 opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  isOn ? "bg-primary/15" : "bg-secondary",
                )}
              >
                {isOn ? (
                  <Check size={13} className="text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {MODULE_LABELS[mod]}
                  {isLocked && (
                    <span className="ml-1.5 text-xs text-muted-foreground/60">(always on)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground/70">{MODULE_DESCRIPTIONS[mod]}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={selected.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 3: Default Home
   ───────────────────────────────────────────────────────── */

const HOME_ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  tasks: CheckSquare,
  habits: Repeat2,
  analytics: BarChart2,
}

const HOME_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
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
}

function HomeStep({
  selected,
  enabledModules,
  onChange,
  onContinue,
  onBack,
}: {
  selected: string
  enabledModules: string[]
  onChange: (home: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  // Always offer dashboard + enabled modules
  const options = ["dashboard", ...enabledModules.filter((m) => m !== "settings")]

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step 3 of {TOTAL_STEPS - 1}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Your home base
      </h2>
      <p className="mt-2 text-muted-foreground">
        Which surface do you want to land on when you sign in? You can change this anytime.
      </p>

      <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const Icon = HOME_ICONS[opt] ?? LayoutDashboard
          const isActive = selected === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 text-left transition-all",
                isActive
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/40 bg-card/50 hover:border-border",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  isActive ? "bg-primary/15" : "bg-secondary",
                )}
              >
                <Icon size={15} className={isActive ? "text-primary" : "text-muted-foreground"} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {HOME_LABELS[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1)}
              </p>
              {isActive && <Check size={13} className="ml-auto text-primary" />}
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selected}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 4: Planning Cadence
   ───────────────────────────────────────────────────────── */

function CadenceStep({
  selected,
  onChange,
  onContinue,
  onBack,
}: {
  selected: "daily" | "weekly"
  onChange: (c: "daily" | "weekly") => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step 4 of {TOTAL_STEPS - 1}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Your planning rhythm
      </h2>
      <p className="mt-2 text-muted-foreground">
        How often do you want to plan your work? This sets the default for your planning mode
        and AI briefings.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          {
            id: "daily" as const,
            label: "Daily",
            desc: "Plan each morning. Review each evening. Tight feedback loop for fast-paced work.",
            icon: Sparkles,
          },
          {
            id: "weekly" as const,
            label: "Weekly",
            desc: "Plan on Monday. Review on Friday. Better for longer cycles like courses or sprints.",
            icon: Repeat2,
          },
        ].map((opt) => {
          const Icon = opt.icon
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-5 text-left transition-all",
                isActive
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/60 bg-card hover:border-border",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isActive ? "bg-primary/15" : "bg-primary/5",
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
              </div>
              {isActive && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Check size={12} />
                  Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 5: Success Formula (Execution Score Weights)
   ───────────────────────────────────────────────────────── */

function FormulaStep({
  weights,
  onChange,
  onContinue,
  onBack,
  persona,
}: {
  weights: { tasks: number; focus: number; habits: number }
  onChange: (w: { tasks: number; focus: number; habits: number }) => void
  onContinue: () => void
  onBack: () => void
  persona: string | null
}) {
  const sum = weights.tasks + weights.focus + weights.habits
  const isValid = Math.abs(sum - 1.0) < 0.01

  const adjust = (key: "tasks" | "focus" | "habits", delta: number) => {
    const current = weights[key]
    const next = Math.max(0, Math.min(1, Math.round((current + delta) * 10) / 10))
    if (next === current) return
    onChange({ ...weights, [key]: next })
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step 5 of {TOTAL_STEPS - 1}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Your success formula
      </h2>
      <p className="mt-2 text-muted-foreground">
        Your Execution Score is a weighted composite. Tune how much each factor matters. The
        weights must add up to <strong className="text-foreground">1.0</strong>.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {(["tasks", "focus", "habits"] as const).map((key) => {
          const labels = {
            tasks: "Task Completion",
            focus: "Focus Adherence",
            habits: "Habit Consistency",
          }
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{labels[key]}</span>
                <span className="text-sm font-semibold text-primary">{weights[key].toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjust(key, -0.1)}
                  disabled={weights[key] <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border/40 bg-card text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  −
                </button>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(weights[key] / 0.6) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => adjust(key, 0.1)}
                  disabled={weights[key] >= 0.6}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border/40 bg-card text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sum indicator */}
      <div
        className={cn(
          "mt-6 rounded-lg px-4 py-2 text-sm",
          isValid
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {isValid
          ? `Weights sum to ${sum.toFixed(1)} — ready to go`
          : `Weights sum to ${sum.toFixed(1)} — adjust to reach exactly 1.0`}
      </div>

      {/* Preset hint */}
      <p className="mt-3 text-xs text-muted-foreground/60">
        {persona === "founder" && "Founders typically weight focus and tasks equally."}
        {persona === "engineer" && "Engineers tend to weight task completion highest."}
        {persona === "creator" && "Creators often weight focus and habits for creative stamina."}
        {persona === "student" && "Students usually split evenly between tasks and habits."}
      </p>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!isValid}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Step 6: Template (Optional Preset)
   ───────────────────────────────────────────────────────── */

function SummaryStep({
  state,
  onBack,
  onSave,
  saving,
  error,
}: {
  state: WizardState
  onBack: () => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const personaLabel = personas.find((p) => p.id === state.persona)?.label ?? "—"

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        Step {TOTAL_STEPS} of {TOTAL_STEPS}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        You are all set
      </h2>
      <p className="mt-2 text-muted-foreground">
        Review your choices below, then we will save your preferences and take you to your
        workspace.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <SummaryRow label="Persona" value={personaLabel} />
        <SummaryRow
          label="Visible surfaces"
          value={`${state.visibleModules.length} of ${ALL_MODULES.length}`}
        />
        <SummaryRow
          label="Default home"
          value={HOME_LABELS[state.defaultHome] ?? state.defaultHome}
        />
        <SummaryRow
          label="Planning cadence"
          value={state.planningCadence === "daily" ? "Daily" : "Weekly"}
        />
        <SummaryRow
          label="Success formula"
          value={`${(state.scoreWeights.tasks * 100).toFixed(0)}% tasks · ${(state.scoreWeights.focus * 100).toFixed(0)}% focus · ${(state.scoreWeights.habits * 100).toFixed(0)}% habits`}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Launch NEXORA"}
          {!saving && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
