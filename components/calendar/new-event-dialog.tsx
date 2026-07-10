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

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  start_date: z.string().min(1, "Start date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_date: z.string().min(1, "End date is required"),
  end_time: z.string().min(1, "End time is required"),
  all_day: z.boolean(),
})

type EventFormValues = z.infer<typeof eventSchema>

export function NewEventDialog({
  defaultDate,
  onCreateEvent,
  children,
}: {
  defaultDate?: string
  onCreateEvent: (data: {
    title: string
    description?: string
    start_time: string
    end_time: string
    all_day: boolean
  }) => Promise<void>
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const today = defaultDate ?? new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: today,
      start_time: "09:00",
      end_date: today,
      end_time: "10:00",
      all_day: false,
    },
  })

  const isAllDay = watch("all_day")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    const start_time = values.all_day
      ? `${values.start_date}T00:00:00`
      : `${values.start_date}T${values.start_time}:00`
    const end_time = values.all_day
      ? `${values.end_date}T23:59:59`
      : `${values.end_date}T${values.end_time}:00`

    await onCreateEvent({
      title: values.title,
      description: values.description || undefined,
      start_time,
      end_time,
      all_day: values.all_day,
    })
    setPending(false)
    setOpen(false)
    reset()
    toast.success("Event created")
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      reset({
        title: "",
        description: "",
        start_date: today,
        start_time: "09:00",
        end_date: today,
        end_time: "10:00",
        all_day: false,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {children ?? (
          <Button size="sm">
            <Plus size={14} />
            New event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="event-title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <Input
              id="event-title"
              placeholder="Event title"
              className="mt-1"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="event-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="event-description"
              placeholder="Optional details..."
              className="mt-1 min-h-16"
              {...register("description")}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all-day"
              className="h-4 w-4 rounded border-border accent-primary"
              {...register("all_day")}
            />
            <label htmlFor="all-day" className="text-xs font-medium text-foreground">
              All day
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="text-xs font-medium text-foreground">
                Start date
              </label>
              <Input
                id="start-date"
                type="date"
                className="mt-1"
                {...register("start_date")}
              />
            </div>
            {!isAllDay && (
              <div>
                <label htmlFor="start-time" className="text-xs font-medium text-foreground">
                  Start time
                </label>
                <Input
                  id="start-time"
                  type="time"
                  className="mt-1"
                  {...register("start_time")}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="end-date" className="text-xs font-medium text-foreground">
                End date
              </label>
              <Input
                id="end-date"
                type="date"
                className="mt-1"
                {...register("end_date")}
              />
            </div>
            {!isAllDay && (
              <div>
                <label htmlFor="end-time" className="text-xs font-medium text-foreground">
                  End time
                </label>
                <Input
                  id="end-time"
                  type="time"
                  className="mt-1"
                  {...register("end_time")}
                />
              </div>
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
              {pending ? "Creating..." : "Create event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
