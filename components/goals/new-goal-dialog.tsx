"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GoalTimeframe, GoalStatus } from "@/lib/supabase/types"

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  timeframe: z.enum(["yearly", "quarterly", "monthly"]),
  start_date: z.string().min(1, "Start date is required"),
  target_date: z.string().min(1, "Target date is required"),
  status: z.enum(["active", "at_risk", "stalled", "completed", "archived"]),
})

type GoalFormValues = z.infer<typeof goalSchema>

const TIMEFRAME_OPTIONS: { value: GoalTimeframe; label: string }[] = [
  { value: "yearly", label: "Yearly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
]

const STATUS_OPTIONS: { value: GoalStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "border-emerald-500/50 bg-emerald-500/5 text-emerald-500" },
  { value: "at_risk", label: "At Risk", color: "border-red-500/50 bg-red-500/5 text-red-500" },
  { value: "stalled", label: "Stalled", color: "border-amber-500/50 bg-amber-500/5 text-amber-500" },
  { value: "completed", label: "Completed", color: "border-blue-500/50 bg-blue-500/5 text-blue-500" },
  { value: "archived", label: "Archived", color: "border-muted bg-muted/50 text-muted-foreground" },
]

export function NewGoalDialog({
  onCreateGoal,
  children,
}: {
  onCreateGoal: (data: GoalFormValues) => Promise<void>
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const defaultStart = new Date().toISOString().split("T")[0]
  const defaultEnd = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      timeframe: "monthly",
      start_date: defaultStart,
      target_date: defaultEnd,
      status: "active",
    },
  })

  const selectedTimeframe = watch("timeframe")
  const selectedStatus = watch("status")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    await onCreateGoal(values)
    setPending(false)
    setOpen(false)
    reset()
    toast.success("Goal created")
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {children ?? (
          <Button size="sm">
            <Plus size={14} />
            New goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="goal-title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <Input
              id="goal-title"
              placeholder="Goal title"
              className="mt-1"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="goal-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="goal-description"
              placeholder="Optional description..."
              className="mt-1 min-h-16"
              {...register("description")}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Timeframe</label>
            <div className="mt-1.5 flex gap-1.5">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("timeframe", opt.value, { shouldValidate: true })}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                    selectedTimeframe === opt.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal-start" className="text-xs font-medium text-foreground">
                Start date
              </label>
              <Input
                id="goal-start"
                type="date"
                className="mt-1"
                {...register("start_date")}
              />
            </div>
            <div>
              <label htmlFor="goal-target" className="text-xs font-medium text-foreground">
                Target date
              </label>
              <Input
                id="goal-target"
                type="date"
                className="mt-1"
                {...register("target_date")}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Status</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("status", opt.value, { shouldValidate: true })}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                    selectedStatus === opt.value
                      ? opt.color
                      : "border-border/40 text-muted-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Creating..." : "Create goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
