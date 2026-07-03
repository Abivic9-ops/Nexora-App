"use client"

import Link from "next/link"

export function LandingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">N</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">NEXORA</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { label: "Features", href: "/features" },
            { label: "Manifesto", href: "/manifesto" },
            { label: "Security", href: "/security" },
            { label: "Pricing", href: "/pricing" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/40">© {year} NEXORA. All rights reserved.</p>
      </div>
    </footer>
  )
}
