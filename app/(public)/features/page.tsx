import type { Metadata } from "next"
import Link from "next/link"
import { LandingNav } from "@/features/landing/landing-nav"
import { LandingFooter } from "@/features/landing/landing-footer"
import {
  CheckCircle2, Zap, Brain, Network, BarChart3, ShieldCheck,
  ArrowRight, Layout, GitBranch, Clock, Target, Users
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore all twelve surfaces of NEXORA's execution operating system. Tasks, Projects, Goals, Habits, Focus, Notes, Research, News, Calendar, Analytics, Assistant, and Settings — unified by a single Execution Graph.",
  openGraph: {
    title: "Features | NEXORA — Twelve surfaces. One mind.",
    description:
      "Every feature in NEXORA composes. Tasks link to projects. Projects link to goals. Focus sessions feed analytics. Nothing is a silo. Explore the complete feature set.",
    url: "https://nexora.app/features",
  },
  twitter: {
    title: "Features | NEXORA",
    description:
      "Twelve surfaces unified by one Execution Graph. Explore every feature of NEXORA's execution OS.",
  },
  alternates: {
    canonical: "https://nexora.app/features",
  },
  keywords: [
    "NEXORA features",
    "execution OS features",
    "task management features",
    "project management software",
    "goal tracking app",
    "habit tracker features",
    "Pomodoro focus timer",
    "AI productivity features",
    "productivity system",
  ],
}

const stats = [
  { value: "12", label: "Surfaces" },
  { value: "1", label: "Execution Graph" },
  { value: "∞", label: "Cross-links" },
  { value: "0", label: "Silos" },
]

const featureBlocks = [
  {
    icon: Layout,
    title: "Unified Execution Graph",
    desc: "Every object in NEXORA — tasks, projects, goals, notes, focus sessions, research — is a node in a live graph. When you complete a task, it propagates up to its project, goal, and execution score automatically. No manual syncing. No copy-pasting.",
    bullets: [
      "Task → Project → Goal chain, auto-derived without any manual linking",
      "Focus sessions tied to specific tasks so deep work maps to real output",
      "Notes and research attachable to any object in the graph",
      "News articles saved to Research in one click, linked to your context",
    ],
  },
  {
    icon: Brain,
    title: "AI That Reads Your Graph",
    desc: "NEXORA's assistant does not answer generic questions. It reads your actual execution graph — your deadlines, your habit streaks, your stalled goals — and returns context-specific answers. It knows what you worked on yesterday and what is at risk tomorrow.",
    bullets: [
      "Daily Brief: what changed, what is at risk, and three moves that matter most today",
      "Task Triage: urgency × impact × energy scoring for intelligent prioritisation",
      "Goal Coach: detects stalled goals and gives one concrete recovery action",
      "Review Synthesis: weekly and monthly wins, misses, and patterns in clear language",
    ],
  },
  {
    icon: Network,
    title: "Command-First Interface",
    desc: "Every action in NEXORA is reachable from the keyboard. Press ⌘K from anywhere to navigate, create, capture, or run an AI action. The command palette grows with your usage — modules register their own actions as you build out your operating system.",
    bullets: [
      "⌘K opens Jump to Anything from anywhere in the application",
      "Quick-capture a task or note without ever leaving your current context",
      "Navigate all 12 surfaces without once touching the mouse",
      "AI actions, theme toggle, and focus mode — all keyboard-first by design",
    ],
  },
  {
    icon: BarChart3,
    title: "Customisable Execution Score",
    desc: "Your north-star metric is the Execution Score — a composite signal derived from task completion, focus adherence, and habit consistency. The formula is yours to tune. A founder might weight focus heavily. A student might weight habits. The score reflects your definition of a great day.",
    bullets: [
      "Default formula: 0.5 × tasks + 0.3 × focus + 0.2 × habits",
      "Adjust weights at any time to match your current work style",
      "Score history feeds the Analytics surface with trend breakdowns",
      "\"What moved my score today\" — explained in plain language, every day",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security — Enforced by Schema",
    desc: "NEXORA enforces Row-Level Security on every table. User A cannot read User B's data — the database itself rejects the query. Your AI provider keys never leave the server. Your data is exportable in full at any time with a single click from Settings.",
    bullets: [
      "Supabase RLS enforced at the database layer, not the application layer",
      "AI provider keys stored server-side only, never included in client bundles",
      "Full JSON data export — your data, your ownership, no support ticket required",
      "OAuth with Google and Apple, or email-plus-password with bcrypt hashing",
    ],
  },
  {
    icon: Target,
    title: "Honest Empty States",
    desc: "NEXORA never shows fake data to make your dashboard look active. On day one your Execution Score is zero. Your charts show real zeros. Your streak counters begin at one. As you use the system, every number you see is earned. That is the entire point.",
    bullets: [
      "Real zeros on day one — no faked onboarding progress, no artificial momentum",
      "Every metric derived exclusively from your actual actions",
      "Streak counters with correct math — no gaps hidden, no grace periods",
      "Score history only as long as your history — nothing fabricated",
    ],
  },
]

const useCases = [
  {
    icon: Users,
    title: "For Founders",
    desc: "Balance fundraising, product, and team. Let the AI triage your day so you focus on what moves the needle.",
  },
  {
    icon: GitBranch,
    title: "For Engineers",
    desc: "Track sprints, document decisions, and log deep work. The Execution Graph keeps your context intact across contexts.",
  },
  {
    icon: Clock,
    title: "For Creators",
    desc: "Manage content pipelines, research, and deadlines in one place. No more switching between a dozen tabs.",
  },
  {
    icon: Target,
    title: "For Students",
    desc: "Organise courses, assignments, and research. Build habits that compound. Let the score keep you honest.",
  },
]

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://nexora.app/features/#webpage",
            url: "https://nexora.app/features",
            name: "Features | NEXORA — Twelve surfaces. One mind.",
            description:
              "Explore all twelve surfaces of NEXORA's execution OS. Every feature composes through a unified Execution Graph.",
            isPartOf: { "@id": "https://nexora.app/#website" },
            about: {
              "@type": "SoftwareApplication",
              name: "NEXORA",
              applicationCategory: "ProductivityApplication",
            },
          }),
        }}
      />
      <div className="flex min-h-screen flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          {/* ── Hero ── */}
          <section className="relative overflow-hidden pt-32 pb-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center">
              <div className="h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Twelve surfaces · One graph · Zero silos
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Every feature composes.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                NEXORA is not a feature list. It is a system. Each surface connects to every other
                surface through a unified execution graph. The result: no duplicate work, no context
                switching, no app hopping.
              </p>
            </div>

            {/* Stats row */}
            <div className="relative z-10 mx-auto mt-14 max-w-3xl px-6">
              <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 bg-card py-6">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{s.value}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Feature Blocks ── */}
          <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="flex flex-col gap-20">
              {featureBlocks.map((block, i) => (
                <div
                  key={block.title}
                  className={`grid gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="flex flex-col justify-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <block.icon size={20} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{block.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{block.desc}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.2)]">
                    <ul className="flex flex-col gap-4">
                      {block.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Use Cases ── */}
          <section className="border-t border-border/40 bg-card/20 py-24" aria-label="Who NEXORA is for">
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Who it is for
              </p>
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                One system, many workflows.
              </h2>
              <p className="mb-14 max-w-xl text-muted-foreground">
                NEXORA adapts to how you work. Whether you are building a company, writing code,
                creating content, or studying — the same graph, the same score, the same command palette.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {useCases.map((uc) => (
                  <article
                    key={uc.title}
                    className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <uc.icon size={16} className="text-primary" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">{uc.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{uc.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Closing CTA ── */}
          <section className="py-24">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Ready to unify your execution?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Start free. All twelve surfaces, the Execution Graph, and your personal score —
                nothing gated. Upgrade when you want the AI intelligence layer.
              </p>
              <Link
                href="/sign-up"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start free
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
