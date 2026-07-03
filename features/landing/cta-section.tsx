"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number]

export function CtaSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Your execution OS is waiting.
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Your initiative is at stake. A minute is a compound. Start with email, or continue with
            Google or Apple — your data, your workflow.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start free today
            <ArrowRight size={14} />
          </Link>
          <p className="text-xs text-muted-foreground/60">
            Email · Google · Apple sign-in · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  )
}
