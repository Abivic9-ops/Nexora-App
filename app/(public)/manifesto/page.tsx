import type { Metadata } from "next"
import Link from "next/link"
import { LandingNav } from "@/features/landing/landing-nav"
import { LandingFooter } from "@/features/landing/landing-footer"
import { ArrowRight, Quote, Lightbulb, HeartHandshake, Sigma, Eye, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Most productivity tools optimise for looking busy. NEXORA is built for operators who know the difference between activity and execution. Read our six founding principles.",
  openGraph: {
    title: "Manifesto | NEXORA — Why we built this",
    description:
      "Most productivity tools optimise for looking busy. NEXORA optimises for execution. Read the philosophy behind the execution operating system.",
    url: "https://nexora.app/manifesto",
  },
  twitter: {
    title: "Manifesto | NEXORA",
    description:
      "Six principles that shaped the NEXORA execution operating system. Execution is a craft. Nothing is a silo. The score is honest.",
  },
  alternates: {
    canonical: "https://nexora.app/manifesto",
  },
  keywords: [
    "productivity philosophy",
    "execution mindset",
    "productivity manifesto",
    "NEXORA principles",
    "execution over activity",
    "personal productivity philosophy",
    "deep work philosophy",
  ],
}

const principles = [
  {
    number: "01",
    icon: Zap,
    title: "Execution is a craft.",
    body: "Anyone can be busy. Few are genuinely productive. Execution means deciding what matters, doing it with full attention, and closing the loop honestly. NEXORA is built on this distinction. Every feature asks: does this move the operator toward their real output, or just toward the feeling of progress? Activity is noise. Execution is signal.",
  },
  {
    number: "02",
    icon: Sigma,
    title: "One source of truth.",
    body: "Most people manage their work across five or six tools. Each one holds a partial picture. When you need to make a decision, you reconstruct context from memory and hope you got it right. NEXORA replaces that with one place. Tasks, goals, notes, research, calendar, habits, and focus — one graph, one history, one score. No more context reconstruction from memory.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Nothing is a silo.",
    body: "A note that is not linked to a project is just a thought. A task that is not linked to a goal is just a chore. NEXORA enforces composability at every level. Every object can connect to every other object. The result is a system that knows not only what you are working on, but why you are working on it.",
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "AI is embedded, not bolted on.",
    body: "We built the execution graph before we built the AI assistant — deliberately. That means the assistant reads your actual data. It knows your goal progress, your focus history, your habit gaps, your stalled projects. It gives you answers specific to your situation on this day. Not generic advice. Not hallucinations dressed as insight.",
  },
  {
    number: "05",
    icon: HeartHandshake,
    title: "The score is honest.",
    body: "Your Execution Score is derived entirely from your actions. On day one it is zero. It rises only when you complete real tasks, log real focus sessions, and check in on real habits. There is no algorithm flattering you, no gamification trick, no fake momentum. The score is a mirror, not a motivation poster. It respects you enough to tell the truth.",
  },
  {
    number: "06",
    icon: Quote,
    title: "You are the operator.",
    body: "NEXORA does not manage you. It never will. It gives you the information, the structure, and the AI support to make better decisions faster. You set the goals. You decide what success looks like. You tune the formula. We build the infrastructure. You run the operation. The system serves the operator — never the reverse.",
  },
]

const beliefs = [
  { value: "6+", label: "Tools replaced by one system" },
  { value: "0", label: "Fake data or gamification tricks" },
  { value: "100%", label: "Honest score, earned every day" },
  { value: "1", label: "System. One graph. One mind." },
]

export default function ManifestoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://nexora.app/manifesto/#webpage",
            url: "https://nexora.app/manifesto",
            name: "Manifesto | NEXORA — Why we built this",
            description:
              "Most productivity tools optimise for looking busy. NEXORA optimises for execution. Six principles that shaped the system.",
            isPartOf: { "@id": "https://nexora.app/#website" },
          }),
        }}
      />
      <div className="flex min-h-screen flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          {/* ── Hero ── */}
          <section className="relative overflow-hidden pt-32 pb-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[500px] w-[800px] rounded-full bg-amber-500/5 blur-[120px]" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                The philosophy behind NEXORA
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl leading-tight">
                Most tools optimise for looking busy.
                <br />
                <span className="text-muted-foreground">We optimise for execution.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                We built NEXORA because we were tired of the gap between how productive we felt and how
                much we actually shipped. The problem was not motivation. It was architecture. What follows
                is what we believe — about productivity, about tools, and about the people who use them.
              </p>
            </div>

            {/* Belief stats */}
            <div className="relative z-10 mx-auto mt-14 max-w-3xl px-6">
              <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
                {beliefs.map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1 bg-card py-6">
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{
                        background: "linear-gradient(90deg, #10B981 0%, #F59E0B 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {b.value}
                    </span>
                    <span className="text-xs text-muted-foreground text-center px-1">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Principles ── */}
          <section className="border-t border-border/40 bg-card/20 py-24" aria-label="Our six founding principles">
            <div className="mx-auto max-w-4xl px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
                Our principles
              </p>
              <h2 className="mb-16 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Six convictions that shaped every decision.
              </h2>
              <div className="flex flex-col gap-16">
                {principles.map((p, i) => (
                  <article key={p.number} className="relative">
                    {/* Accent line */}
                    <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-primary via-amber-500 to-transparent hidden sm:block" />
                    <div className="grid gap-4 sm:grid-cols-[3rem_1fr] sm:pl-8">
                      <div className="flex items-start">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 sm:hidden">
                          <p.icon size={18} className="text-primary" />
                        </div>
                        <span className="hidden text-3xl font-bold text-primary/20 tabular-nums sm:block">
                          {p.number}
                        </span>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 sm:hidden">
                            <p.icon size={15} className="text-primary" />
                          </div>
                          <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {p.title}
                          </h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{p.body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Closing Statement ── */}
          <section className="py-24">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <Quote size={28} className="mx-auto text-primary/40" />
              <blockquote className="mt-6 text-xl font-medium leading-relaxed text-foreground md:text-2xl">
                &ldquo;Activity is not productivity. Motion is not progress. Execution is the only thing that
                ships. NEXORA exists to make execution inevitable.&rdquo;
              </blockquote>
              <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Start executing
                  <ArrowRight size={14} />
                </Link>
                <p className="text-xs text-muted-foreground/60">
                  Email · Google · Apple sign-in · No credit card required
                </p>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
