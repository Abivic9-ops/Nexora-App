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
import type { ProjectStatus } from "@/lib/supabase/types"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  due_date: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
]

export function NewProjectDialog({
  onCreateProject,
  children,
}: {
  onCreateProject: (data: ProjectFormValues) => Promise<void>
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
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      due_date: "",
    },
  })

  const selectedStatus = watch("status")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    await onCreateProject(values)
    setPending(false)
    setOpen(false)
    reset()
    toast.success("Project created")
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger nativeButton={false} render={<span className="inline-flex" />}>
        {children ?? (
          <Button size="sm">
            <Plus size={14} />
            New project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="project-name" className="text-xs font-medium text-foreground">
              Name
            </label>
            <Input
              id="project-name"
              placeholder="Project name"
              className="mt-1"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="project-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="project-description"
              placeholder="Optional description..."
              className="mt-1 min-h-16"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground">Status</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("status", opt.value, { shouldValidate: true })}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                      selectedStatus === opt.value
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
              <label htmlFor="project-due-date" className="text-xs font-medium text-foreground">
                Due date
              </label>
              <Input
                id="project-due-date"
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
              {pending ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
