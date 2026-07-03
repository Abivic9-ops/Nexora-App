import type { Metadata } from "next"
import Link from "next/link"
import { LandingNav } from "@/features/landing/landing-nav"
import { LandingFooter } from "@/features/landing/landing-footer"
import {
  ShieldCheck, Lock, Database, Key, Globe, FileDown,
  ArrowRight, ChevronDown, Server, UserCheck, FileText
} from "lucide-react"

export const metadata: Metadata = {
  title: "Security",
  description:
    "NEXORA enforces security at the database layer with Row-Level Security on every table. Your data is isolated by design — AI keys never reach the client, and full export is always available.",
  openGraph: {
    title: "Security | NEXORA — Your data, your rules.",
    description:
      "NEXORA enforces Row-Level Security on every table. Your data is isolated from other users by design. AI keys never reach the client. Full export always available.",
    url: "https://nexora.app/security",
  },
  twitter: {
    title: "Security | NEXORA",
    description:
      "RLS on every table. Server-side AI keys. Full data export. Security at the database layer.",
  },
  alternates: {
    canonical: "https://nexora.app/security",
  },
  keywords: [
    "NEXORA security",
    "Row-Level Security",
    "RLS database security",
    "AI privacy",
    "data encryption",
    "data export",
    "OAuth security",
    "productivity app security",
    "secure task management",
  ],
}

const securityPillars = [
  {
    icon: Database,
    title: "Row-Level Security on every table",
    desc: "Every table in NEXORA enforces Supabase Row-Level Security. When you make a request, the database itself checks that the row belongs to you before returning any data. There is no application-layer filter that a bug or misconfiguration can bypass. User A cannot read User B's rows — the constraint is in the schema, not in the code.",
  },
  {
    icon: Key,
    title: "AI keys never reach the client",
    desc: "NEXORA's AI gateway runs entirely server-side. Your AI provider keys — whether OpenAI, Anthropic, or others — are stored as server-side environment variables. They are never included in any client bundle, network response, or browser storage. The client sends a request to a Next.js server action; the server calls the AI provider. The key never leaves the server.",
  },
  {
    icon: Lock,
    title: "OAuth via trusted providers",
    desc: "Sign-in is handled by Supabase Auth, which integrates directly with Google and Apple OAuth. We do not store passwords in plaintext. Email-and-password flows use bcrypt hashing with per-user salts. Session tokens are short-lived JWTs, rotated on re-authentication, and invalidated on sign-out. No passwords ever touch our application logic.",
  },
  {
    icon: Globe,
    title: "Multi-tenant ready from day one",
    desc: "NEXORA is single-user in its initial release, but every table includes a workspace_id column that is present, indexed, and nullable from day one. The RLS policies are already written to support workspace-level membership checks when multi-tenancy activates. No schema migration. No data migration. The foundation is laid.",
  },
  {
    icon: FileDown,
    title: "Full data export at any time",
    desc: "Your data belongs to you. Period. At any time, from the Settings surface, you can export everything — tasks, projects, goals, habits, notes, focus sessions, and analytics history — as a single structured JSON file. No contacting support. No waiting period. One click, complete portability.",
  },
  {
    icon: Server,
    title: "No client-side secrets",
    desc: "Nothing sensitive goes to the client. Environment variables used in server actions, API routes, and edge functions are validated at application startup. The only credential the client ever receives is the public Supabase anon key — and that key is scoped to your user's data exclusively by Row-Level Security. There is no backdoor.",
  },
]

const faqItems = [
  {
    q: "Where is my data stored?",
    a: "NEXORA uses Supabase for the database layer, which runs on AWS infrastructure. Your data is stored in a PostgreSQL instance. We do not use third-party data processors beyond Supabase and your chosen AI provider (for AI features only)."
  },
  {
    q: "Do you sell or share my data?",
    a: "No. NEXORA does not sell, rent, or share your personal data with any third party for any purpose. Your execution data — tasks, notes, goals, habits, focus sessions — is yours alone. The only data we ever see is what is required to operate the service."
  },
  {
    q: "How are AI requests handled?",
    a: "When you use the AI assistant, your request and relevant context from your execution graph are sent to the AI provider (e.g., OpenAI or Anthropic). We never send your AI provider keys. We do not train on your data. AI providers' API terms prohibit training on API traffic unless explicitly opted in."
  },
  {
    q: "Is my data encrypted at rest?",
    a: "Yes. Supabase encrypts all data at rest using AES-256 encryption. Data in transit is encrypted via TLS 1.3. Additionally, NEXORA enforces application-layer encryption for any sensitive configuration stored in the database."
  },
  {
    q: "Can I delete my account and all my data?",
    a: "Yes. From Settings, you can initiate a full account deletion. This removes all your rows from every table — tasks, projects, goals, habits, notes, focus sessions, analytics history, and your profile. We do not retain soft-deleted records. The operation is irreversible."
  },
  {
    q: "Do you have a SOC 2 or similar certification?",
    a: "NEXORA is in the early stages and does not yet hold formal compliance certifications. We follow security best practices — RLS on every table, no client-side secrets, encrypted connections, and full data portability — and we will pursue SOC 2 compliance as the product matures."
  }
]

const trustBadges = [
  { icon: ShieldCheck, label: "AES-256 at rest" },
  { icon: Lock, label: "TLS 1.3 in transit" },
  { icon: UserCheck, label: "RLS on every row" },
  { icon: Key, label: "Server-side AI keys" },
  { icon: FileText, label: "Full data export" },
  { icon: Globe, label: "OAuth 2.0 + magic link" },
]

export default function SecurityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://nexora.app/security/#webpage",
              url: "https://nexora.app/security",
              name: "Security | NEXORA — Your data, your rules.",
              description:
                "NEXORA enforces security at the database layer with Row-Level Security on every table. Your data is isolated by design.",
              isPartOf: { "@id": "https://nexora.app/#website" },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "@id": "https://nexora.app/security/#faq",
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
                Security by architecture, not by policy
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Your data, your rules.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Security in NEXORA is not a feature checkbox. It is enforced at the database layer,
                the server action layer, and the auth layer. Here is exactly how every layer works.
              </p>
            </div>

            {/* Trust badges */}
            <div className="relative z-10 mx-auto mt-12 max-w-3xl px-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {trustBadges.map((b) => (
                  <div
                    key={b.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card px-4 py-1.5 text-xs text-muted-foreground"
                  >
                    <b.icon size={12} className="text-primary" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pillars ── */}
          <section className="border-t border-border/40 bg-card/20 py-24" aria-label="Security architecture layers">
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Security architecture
              </p>
              <h2 className="mb-14 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Six layers of protection.
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {securityPillars.map((pillar) => (
                  <article
                    key={pillar.title}
                    className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.2)] transition-all hover:border-primary/20"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <pillar.icon size={18} className="text-primary" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">{pillar.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="mx-auto max-w-3xl px-6 py-24" aria-label="Frequently asked security questions">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Security FAQ
            </p>
            <h2 className="mb-14 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Common questions, answered.
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
                Trust is earned. We earn it every day.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Your execution data is your competitive advantage. NEXORA treats it that way.
                Start free, export anytime, own everything.
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
