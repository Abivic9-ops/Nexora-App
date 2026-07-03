"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const thread = [
  {
    role: "user",
    content: "Plan my Friday. I have 3 task deadlines, 1 call at 10am, and want a 90-min focus block.",
  },
  {
    role: "assistant",
    content:
      "Here's your Friday:\n\n**08:00 – 09:30** → Focus block — tackle P1 task (highest deadline pressure).\n**10:00 – 10:45** → Customer call. Tasks P2 and P3 queued after.\n**11:00 – 12:30** → P2 task with a 25-min Pomodoro rhythm.\n**14:00 – 15:00** → P3 task + review. Daily habits close by 17:00.\n\nShall I lock this into your calendar?",
  },
]

const features = [
  "Streaming responses direct from your context: tasks, notes, and goals",
  "Multi-thread library stores every conversation",
  "Context-aware: knows your goals, tasks, and notes",
]

export function AssistantSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Assistant
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            An AI that knows how you work.
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            The assistant is not a generic chatbot. It runs as a system co-pilot — a research
            partner, a draft writer, a planning executor, or a post. Powered by the Execution Graph
            — your goals, tasks, habits, notes, and history — it gives answers that are specific
            to your situation.
          </p>
          <ul className="flex flex-col gap-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] }}
          className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_32px_rgba(0,0,0,0.3)]"
        >
          <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-4">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-xs font-medium text-foreground">NEXORA Assistant</p>
            <span className="ml-auto text-xs text-muted-foreground/60">Friday, Jul 4</span>
          </div>
          <div className="flex flex-col gap-4">
            {thread.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {msg.role === "user" ? "You" : "ARIA"}
                </p>
                <div
                  className={`max-w-[90%] rounded-lg px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground border border-primary/20"
                      : "bg-secondary text-foreground border border-border/40"
                  }`}
                >
                  {msg.content.split("\n").map((line, j) => {
                    const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    return (
                      <p
                        key={j}
                        className={line === "" ? "mt-2" : ""}
                        dangerouslySetInnerHTML={{ __html: bold }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
