"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

export function TestimonialSection() {
  return (
    <section id="security" className="border-y border-border/40 bg-card/20 py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <Quote size={28} className="text-primary/40" />
          <blockquote className="text-xl font-medium leading-relaxed text-foreground md:text-2xl">
            "NEXORA replaced four apps and made my day feel intentional again. The focus mode + AI
            assistant combo is the closest thing I've felt to a real second brain."
          </blockquote>
          <p className="text-sm text-muted-foreground">
            — an operator, shipping every day
          </p>
        </motion.div>
      </div>
    </section>
  )
}
