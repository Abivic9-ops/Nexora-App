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

const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekly"]),
  target_count: z.number().min(1, "Min 1").max(99, "Max 99"),
})

type HabitFormValues = z.infer<typeof habitSchema>

export function NewHabitDialog({
  onCreateHabit,
  children,
}: {
  onCreateHabit: (data: HabitFormValues) => Promise<void>
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      target_count: 1,
    },
  })

  const selectedFrequency = watch("frequency")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    await onCreateHabit(values)
    setPending(false)
    setOpen(false)
    reset()
    toast.success("Habit created")
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
            New habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="habit-name" className="text-xs font-medium text-foreground">
              Name
            </label>
            <Input
              id="habit-name"
              placeholder="Habit name"
              className="mt-1"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="habit-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="habit-description"
              placeholder="Optional description..."
              className="mt-1 min-h-16"
              {...register("description")}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Frequency</label>
            <div className="mt-1.5 flex gap-1.5">
              {[
                { value: "daily" as const, label: "Daily" },
                { value: "weekly" as const, label: "Weekly" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("frequency", opt.value, { shouldValidate: true })}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                    selectedFrequency === opt.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="habit-target" className="text-xs font-medium text-foreground">
              Target count per {selectedFrequency === "daily" ? "day" : "week"}
            </label>
            <Input
              id="habit-target"
              type="number"
              min={1}
              max={99}
              className="mt-1"
              {...register("target_count")}
            />
            {errors.target_count && (
              <p className="mt-1 text-xs text-destructive">{errors.target_count.message}</p>
            )}
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
              {pending ? "Creating..." : "Create habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
