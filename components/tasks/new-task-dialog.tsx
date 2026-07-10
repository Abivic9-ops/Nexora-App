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

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  due_date: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent", color: "text-red-500" },
  { value: "high", label: "High", color: "text-amber-500" },
  { value: "medium", label: "Medium", color: "text-blue-500" },
  { value: "low", label: "Low", color: "text-muted-foreground" },
] as const

export function NewTaskDialog({
  defaultStatus,
  onCreateTask,
  children,
}: {
  defaultStatus: string
  onCreateTask: (data: TaskFormValues & { status: string }) => Promise<void>
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
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    },
  })

  const selectedPriority = watch("priority")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    await onCreateTask({ ...values, status: defaultStatus })
    setPending(false)
    setOpen(false)
    reset()
    toast.success("Task created")
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {children ?? (
          <Button size="sm">
            <Plus size={14} />
            New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              className="mt-1"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add details..."
              className="mt-1 min-h-20"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground">Priority</label>
              <div className="mt-1 flex gap-1.5">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("priority", opt.value, { shouldValidate: true })}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                      selectedPriority === opt.value
                        ? "border-primary/50 bg-primary/5 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="due_date" className="text-xs font-medium text-foreground">
                Due date
              </label>
              <Input
                id="due_date"
                type="date"
                className="mt-1"
                {...register("due_date")}
              />
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
              {pending ? "Creating..." : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { TaskFormValues }
