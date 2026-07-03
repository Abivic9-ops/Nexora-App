import type { Metadata } from "next"
import Link from "next/link"
import { LandingNav } from "@/features/landing/landing-nav"
import { LandingFooter } from "@/features/landing/landing-footer"
import { CheckCircle2, ArrowRight, ChevronDown, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NEXORA starts free with the full core system — all twelve surfaces, the Execution Graph, and your personal score. Upgrade to Pro for advanced AI, unlimited analytics, and the planning engine.",
  openGraph: {
    title: "Pricing | NEXORA — Start free. Grow when you need to.",
    description:
      "NEXORA starts free with the full core system. Upgrade to Pro for advanced AI, unlimited history, analytics, and deep customization.",
    url: "https://nexora.app/pricing",
  },
  twitter: {
    title: "Pricing | NEXORA",
    description:
      "Start free with the full NEXORA core system. Pro unlocks the AI intelligence layer. No credit card required.",
  },
  alternates: {
    canonical: "https://nexora.app/pricing",
  },
  keywords: [
    "NEXORA pricing",
    "productivity app pricing",
    "free productivity app",
    "AI productivity subscription",
    "execution OS pricing",
    "personal pro plan",
    "team productivity pricing",
  ],
}

const plans = [
  {
    name: "Personal",
    price: "Free",
    sub: "No credit card required",
    description: "The full execution system. All twelve surfaces, the Execution Graph, and your personal score — nothing gated. Built for anyone who wants to operate at their best.",
    cta: { label: "Start free", href: "/sign-up" },
    highlight: false,
    features: [
      "All 12 surfaces: Tasks, Projects, Goals, Habits, Focus, Notes, Research, News, Calendar, Analytics, Assistant, Settings",
      "Unified Execution Graph with unlimited cross-links",
      "⌘K Command palette — keyboard-first navigation",
      "Daily Execution Score with default formula",
      "7-day analytics history with trend view",
      "Email · Google · Apple sign-in",
      "Full JSON data export — one click, everything",
    ],
  },
  {
    name: "Personal Pro",
    price: "$12",
    sub: "per month, billed annually",
    description: "For operators who want the full intelligence layer: advanced AI, unlimited history, deep customisation, and the adaptive planning engine.",
    cta: { label: "Get started", href: "/sign-up?plan=pro" },
    highlight: true,
    features: [
      "Everything in Personal, plus all AI features",
      "Unlimited analytics history — no time bounds",
      "Daily Brief, Task Triage, Goal Coach, Calendar Assistant",
      "Smart Planning Engine — AI-recommended daily schedule, one-click accept",
      "Review Synthesis — weekly and monthly narrative of wins, misses, and patterns",
      "Adaptive Personas — reshapes labels, defaults, and AI tone to your style",
      "Lifecycle Automation — event-driven rules engine",
      "OS Templates and presets (Founder OS, Student OS, and more)",
      "Priority support with guaranteed response time",
    ],
  },
  {
    name: "Team",
    price: "Coming soon",
    sub: "Early access available",
    description: "Shared workspaces with role-based permissions, team dashboards, shared templates, and admin analytics. Built for small teams that operate as a single unit.",
    cta: { label: "Join waitlist", href: "mailto:hello@nexora.app" },
    highlight: false,
    features: [
      "Everything in Personal Pro",
      "Shared workspaces with granular role permissions",
      "Team Execution Score dashboard",
      "Shared OS templates and workspace presets",
      "Admin analytics and member management tools",
      "Priority onboarding call with the founding team",
    ],
  },
]

const comparisonRows = [
  { feature: "All 12 surfaces", personal: true, pro: true, team: true },
  { feature: "Execution Graph", personal: true, pro: true, team: true },
  { feature: "Command palette (⌘K)", personal: true, pro: true, team: true },
  { feature: "Daily Execution Score", personal: true, pro: true, team: true },
  { feature: "Full data export", personal: true, pro: true, team: true },
  { feature: "Analytics history", personal: "7 days", pro: "Unlimited", team: "Unlimited" },
  { feature: "AI Daily Brief", personal: false, pro: true, team: true },
  { feature: "AI Task Triage", personal: false, pro: true, team: true },
  { feature: "AI Goal Coach", personal: false, pro: true, team: true },
  { feature: "AI Calendar Assistant", personal: false, pro: true, team: true },
  { feature: "Smart Planning Engine", personal: false, pro: true, team: true },
  { feature: "Review Synthesis", personal: false, pro: true, team: true },
  { feature: "Adaptive Personas", personal: false, pro: true, team: true },
  { feature: "Lifecycle Automation", personal: false, pro: true, team: true },
  { feature: "OS Templates", personal: false, pro: true, team: true },
  { feature: "Workspaces & team roles", personal: false, pro: false, team: true },
  { feature: "Team dashboard", personal: false, pro: false, team: true },
  { feature: "Priority support", personal: false, pro: true, team: true },
]

const faqItems = [
  {
    q: "Is the Free plan really free? No time limit?",
    a: "Yes. The Personal plan is free forever. No trial period, no time limit, no feature gating on the core system. All twelve surfaces, the Execution Graph, and your Execution Score are included at no cost.",
  },
  {
    q: "What happens if I cancel Pro?",
    a: "You keep everything in the Personal plan. Your data remains intact, your history is preserved, and you can re-subscribe at any time. The only thing you lose is access to Pro-specific features like unlimited analytics and advanced AI actions.",
  },
  {
    q: "Can I switch between plans?",
    a: "Yes. You can upgrade from Personal to Pro instantly, and downgrade from Pro back to Personal at the end of your billing cycle. No data loss, no migration, no support ticket.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. Annual billing is available at a discount. We do not store your payment details — Stripe handles all payment processing.",
  },
  {
    q: "Is there a student or non-profit discount?",
    a: "We are working on discounted plans for students, educators, and verified non-profit organisations. If this applies to you, email us at hello@nexora.app and we will notify you when the programme launches.",
  },
  {
    q: "Do I need Pro to use the AI assistant?",
    a: "Basic AI interactions are available on the Personal plan. Pro unlocks the full AI intelligence layer — Daily Brief, Task Triage, Goal Coach, Calendar Assistant, Smart Planning Engine, and Review Synthesis.",
  },
]

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://nexora.app/pricing/#webpage",
              url: "https://nexora.app/pricing",
              name: "Pricing | NEXORA — Start free. Grow when you need to.",
              description:
                "NEXORA starts free with the full core system. Upgrade to Pro for advanced AI, unlimited history, analytics, and deep customization.",
              isPartOf: { "@id": "https://nexora.app/#website" },
              about: {
                "@type": "SoftwareApplication",
                name: "NEXORA",
                offers: [
                  { "@type": "Offer", name: "Personal", price: "0", priceCurrency: "USD" },
                  { "@type": "Offer", name: "Personal Pro", price: "12", priceCurrency: "USD" },
                ],
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "@id": "https://nexora.app/pricing/#faq",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            },
          ]),
        }}
      />
      <div className="flex min-h-screen flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          {/* ── Hero ── */}
          <section className="relative overflow-hidden pt-32 pb-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Fair pricing · No surprises · Full feature parity at the core
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Start free. Grow when you need to.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                The full core system is free. No feature-gating the basics. No trial that expires.
                Upgrade when you want the complete AI intelligence layer.
              </p>
            </div>
          </section>

          {/* ── Plans ── */}
          <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="Pricing plans">
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex flex-col rounded-xl border p-6 ${
                    plan.highlight
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_8px_24px_rgba(0,0,0,0.3)]"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Most popular
                    </span>
                  )}
                  <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.price !== "Free" && plan.price !== "Coming soon" && (
                      <span className="text-xs text-muted-foreground">/mo</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{plan.sub}</p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                  <Link
                    href={plan.cta.href}
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border/60 bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {plan.cta.label}
                    <ArrowRight size={13} />
                  </Link>
                  <div className="mt-8 flex flex-col gap-3 border-t border-border/40 pt-6">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-primary" />
                        <span className="text-xs text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── Feature Comparison ── */}
          <section className="border-t border-border/40 bg-card/20 py-24" aria-label="Feature comparison table">
            <div className="mx-auto max-w-5xl px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Side-by-side
              </p>
              <h2 className="mb-14 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Compare plans.
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="py-3 pr-6 text-left text-xs font-medium text-muted-foreground">Feature</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-muted-foreground">Personal</th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-primary">Pro</th>
                      <th className="py-3 pl-4 text-center text-xs font-medium text-muted-foreground">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="border-b border-border/20 transition-colors hover:bg-card/50">
                        <td className="py-3 pr-6 text-xs text-foreground">{row.feature}</td>
                        <td className="py-3 px-4 text-center text-xs">
                          {typeof row.personal === "boolean" ? (
                            row.personal ? (
                              <CheckCircle2 size={13} className="mx-auto text-primary" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">{row.personal}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-xs">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <CheckCircle2 size={13} className="mx-auto text-primary" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )
                          ) : (
                            <span className="text-foreground font-medium">{row.pro}</span>
                          )}
                        </td>
                        <td className="py-3 pl-4 text-center text-xs">
                          {typeof row.team === "boolean" ? (
                            row.team ? (
                              <CheckCircle2 size={13} className="mx-auto text-primary" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">{row.team}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="mx-auto max-w-3xl px-6 py-24" aria-label="Frequently asked pricing questions">
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
            </div>
            <h2 className="mb-14 mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Still have questions?
            </h2>
            <div className="flex flex-col divide-y divide-border/40">
              {faqItems.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-foreground transition-colors hover:text-primary list-none">
                    {item.q}
                    <ChevronDown size={14} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Closing CTA ── */}
          <section className="border-t border-border/40 py-24">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Not sure which plan fits?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Start free. Use the full system. If you ever need more, upgrade in one click.
                No risk, no lock-in, no hidden terms.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Start free
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="mailto:hello@nexora.app"
                  className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Contact us
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
