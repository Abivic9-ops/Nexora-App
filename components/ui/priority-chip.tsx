import * as React from "react"
import { cn } from "@/lib/utils"

export interface PriorityChipProps extends React.HTMLAttributes<HTMLDivElement> {
  level: 1 | 2 | 3 | 4
}

export function PriorityChip({ level, className, ...props }: PriorityChipProps) {
  const levels = {
    1: "bg-red-500/10 text-red-500 border-red-500/20",
    2: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    3: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    4: "bg-muted text-muted-foreground border-border",
  }
  
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        levels[level],
        className
      )}
      {...props}
    >
      P{level}
    </div>
  )
}
