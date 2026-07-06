import { type LucideIcon } from "lucide-react"

export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
}: {
  icon: LucideIcon
  label: string
  value: string
  subtitle?: string
  trend?: { direction: "up" | "down" | "neutral"; label: string }
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon size={16} className="text-primary" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              trend.direction === "up"
                ? "bg-emerald-500/10 text-emerald-500"
                : trend.direction === "down"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {trend.label}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {subtitle && <p className="mt-1 text-[11px] text-muted-foreground/60">{subtitle}</p>}
    </div>
  )
}
