"use client"

import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns"
import { getEventsForDateRange, createEvent, deleteEvent } from "@/services/events.client"
import type { Event } from "@/services/events.client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { NewEventDialog } from "./new-event-dialog"
import { UpcomingRail } from "./upcoming-rail"
import { MonthHeader } from "./month-header"
import { WeekdayRow } from "./weekday-row"
import { CalendarGrid } from "./calendar-grid"
import { format as formatDate } from "date-fns"

export function CalendarPageShell({
  initialEvents,
  workspaceId,
  userId,
}: {
  initialEvents: Event[]
  workspaceId: string
  userId: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)

  const monthRange = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return {
      from: subMonths(start, 1).toISOString(),
      to: addMonths(end, 1).toISOString(),
    }
  }, [currentDate])

  const refreshEvents = useCallback(async () => {
    const updated = await getEventsForDateRange(workspaceId, monthRange.from, monthRange.to)
    setEvents(updated)
  }, [workspaceId, monthRange])

  const handleCreateEvent = useCallback(
    async (data: {
      title: string
      description?: string
      start_time: string
      end_time: string
      all_day: boolean
    }) => {
      const result = await createEvent({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        all_day: data.all_day,
      })
      if (result) {
        await refreshEvents()
      } else {
        toast.error("Failed to create event")
      }
    },
    [workspaceId, userId, refreshEvents],
  )

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) return
    const ok = await deleteEvent(selectedEvent.id)
    if (ok) {
      toast.success("Event deleted")
      setEventDialogOpen(false)
      setSelectedEvent(null)
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
    } else {
      toast.error("Failed to delete event")
    }
  }, [selectedEvent])

  const navigatePrev = useCallback(() => {
    setCurrentDate((d) => subMonths(d, 1))
  }, [])

  const navigateNext = useCallback(() => {
    setCurrentDate((d) => addMonths(d, 1))
  }, [])

  const navigateToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }, [])

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate((prev) =>
      prev && prev.toDateString() === date.toDateString() ? null : date,
    )
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track deadlines, focus blocks, and schedule changes.
          </p>
        </div>
        <NewEventDialog defaultDate={format(new Date(), "yyyy-MM-dd")} onCreateEvent={handleCreateEvent}>
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
            <Plus size={16} />
            New event
          </span>
        </NewEventDialog>
      </div>

      <div className="flex-1 px-6 pb-6">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-card lg:flex-row">
          {/* Upcoming rail */}
          <div className="relative w-full shrink-0 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent lg:w-[300px] lg:border-b-0 lg:border-r lg:border-white/[0.06]">
            <UpcomingRail
              events={events}
              selectedDate={selectedDate}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setEventDialogOpen(true)
              }}
            />
          </div>

          {/* Calendar section */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="pt-5">
              <MonthHeader
                currentDate={currentDate}
                onPrev={navigatePrev}
                onNext={navigateNext}
                onToday={navigateToday}
              />
              <WeekdayRow />
            </div>

            <div className="flex-1 overflow-y-auto pb-2">
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event detail dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            {selectedEvent && (
              <DialogDescription>
                {selectedEvent.all_day
                  ? "All day"
                  : `${formatDate(new Date(selectedEvent.start_time), "MMM d, h:mm a")} - ${formatDate(new Date(selectedEvent.end_time), "h:mm a")}`}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedEvent?.description && (
            <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEvent}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEventDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
