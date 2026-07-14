"use client"

import { Calendar, ListTodo, Target, Lightbulb, BarChart3 } from "lucide-react"

const ACTIONS = [
  { label: "Plan my day", icon: Calendar, prompt: "Help me plan my day based on my current tasks and schedule." },
  { label: "Review my goals", icon: Target, prompt: "How are my active goals tracking? Give me a status update." },
  { label: "Prioritize tasks", icon: ListTodo, prompt: "Which tasks should I focus on right now? Help me prioritize." },
  { label: "Explain my score", icon: BarChart3, prompt: "Break down my current execution score and tell me how to improve it." },
  { label: "Research summary", icon: Lightbulb, prompt: "Summarize my saved research items and suggest actionable takeaways." },
]

export function QuickActions({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onSend(action.prompt)}
          className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <action.icon size={13} />
          {action.label}
        </button>
      ))}
    </div>
  )
}
