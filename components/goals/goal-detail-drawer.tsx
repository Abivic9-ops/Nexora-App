"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateGoal, deleteGoal } from "@/services/goals.client"
import type { Goal } from "@/services/goals.client"
import type { GoalTimeframe, GoalStatus } from "@/lib/supabase/types"
import { X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  timeframe: z.enum(["yearly", "quarterly", "monthly"]),
  start_date: z.string().min(1, "Start date is required"),
  target_date: z.string().min(1, "Target date is required"),
  status: z.enum(["active", "at_risk", "stalled", "completed", "archived"]),
  progress: z.number().min(0).max(100),
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

export function GoalDetailDrawer({
  goal,
  open,
  onOpenChange,
  onGoalUpdated,
  onGoalDeleted,
}: {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoalUpdated: () => void
  onGoalDeleted: (id: string) => void
}) {
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    values: goal
      ? {
          title: goal.title,
          description: goal.description ?? "",
          timeframe: goal.timeframe,
          start_date: format(new Date(goal.start_date), "yyyy-MM-dd"),
          target_date: format(new Date(goal.target_date), "yyyy-MM-dd"),
          status: goal.status,
          progress: goal.progress,
        }
      : undefined,
  })

  const selectedTimeframe = watch("timeframe")
  const selectedStatus = watch("status")
  const progress = watch("progress")

  const onSubmit = handleSubmit(async (values) => {
    if (!goal) return
    setPending(true)
    const ok = await updateGoal(goal.id, {
      title: values.title,
      description: values.description || null,
      timeframe: values.timeframe,
      start_date: values.start_date,
      target_date: values.target_date,
      status: values.status,
      progress: values.progress,
    })
    setPending(false)
    if (ok) {
      toast.success("Goal updated")
      onGoalUpdated()
    } else {
      toast.error("Failed to update goal")
    }
  })

  const handleDelete = useCallback(async () => {
    if (!goal) return
    const ok = await deleteGoal(goal.id)
    if (ok) {
      toast.success("Goal deleted")
      onOpenChange(false)
      onGoalDeleted(goal.id)
    } else {
      toast.error("Failed to delete goal")
    }
  }, [goal, onOpenChange, onGoalDeleted])

  if (!goal) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="w-full sm:max-w-lg">
        <DrawerHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">Goal details</DrawerTitle>
            <DrawerClose render={<button type="button" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" />}>
              <X size={14} />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="goal-form" onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <Input
                {...register("title")}
                className="border-0 bg-transparent px-0 text-lg font-semibold text-foreground shadow-none focus-visible:ring-0"
                placeholder="Goal title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Description</label>
              <Textarea
                {...register("description")}
                className="mt-1 min-h-16"
                placeholder="Add details..."
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
                <label htmlFor="detail-start" className="text-xs font-medium text-foreground">
                  Start date
                </label>
                <Input
                  id="detail-start"
                  type="date"
                  className="mt-1"
                  {...register("start_date")}
                />
              </div>
              <div>
                <label htmlFor="detail-target" className="text-xs font-medium text-foreground">
                  Target date
                </label>
                <Input
                  id="detail-target"
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

            <div>
              <label className="text-xs font-medium text-foreground">
                Progress: {progress}%
              </label>
              <Input
                type="range"
                min="0"
                max="100"
                className="mt-1"
                {...register("progress", { valueAsNumber: true })}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="goal-form"
              size="sm"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
