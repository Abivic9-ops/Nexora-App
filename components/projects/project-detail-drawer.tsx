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
import { updateProject, deleteProject } from "@/services/projects.client"
import type { Project } from "@/services/projects.client"
import type { ProjectStatus } from "@/lib/supabase/types"
import { X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "paused", "completed", "archived"]),
  due_date: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "border-primary/50 bg-primary/5 text-primary" },
  { value: "paused", label: "Paused", color: "border-amber-500/50 bg-amber-500/5 text-amber-500" },
  { value: "completed", label: "Completed", color: "border-blue-500/50 bg-blue-500/5 text-blue-500" },
  { value: "archived", label: "Archived", color: "border-muted bg-muted/50 text-muted-foreground" },
]

export function ProjectDetailDrawer({
  project,
  open,
  onOpenChange,
  onProjectUpdated,
  onProjectDeleted,
}: {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: () => void
  onProjectDeleted: (id: string) => void
}) {
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    values: project
      ? {
          name: project.name,
          description: project.description ?? "",
          status: project.status,
          due_date: project.due_date ? format(new Date(project.due_date), "yyyy-MM-dd") : "",
        }
      : undefined,
  })

  const selectedStatus = watch("status")

  const onSubmit = handleSubmit(async (values) => {
    if (!project) return
    setPending(true)
    const ok = await updateProject(project.id, {
      name: values.name,
      description: values.description || null,
      status: values.status,
      due_date: values.due_date || null,
    })
    setPending(false)
    if (ok) {
      toast.success("Project updated")
      onProjectUpdated()
    } else {
      toast.error("Failed to update project")
    }
  })

  const handleDelete = useCallback(async () => {
    if (!project) return
    const ok = await deleteProject(project.id)
    if (ok) {
      toast.success("Project deleted")
      onOpenChange(false)
      onProjectDeleted(project.id)
    } else {
      toast.error("Failed to delete project")
    }
  }, [project, onOpenChange, onProjectDeleted])

  if (!project) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="w-full sm:max-w-lg">
        <DrawerHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">Project details</DrawerTitle>
            <DrawerClose render={<button type="button" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" />}>
              <X size={14} />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="project-form" onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <Input
                {...register("name")}
                className="border-0 bg-transparent px-0 text-lg font-semibold text-foreground shadow-none focus-visible:ring-0"
                placeholder="Project name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
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
              <label htmlFor="detail-due-date" className="text-xs font-medium text-foreground">
                Due date
              </label>
              <Input
                id="detail-due-date"
                type="date"
                className="mt-1"
                {...register("due_date")}
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
              form="project-form"
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
