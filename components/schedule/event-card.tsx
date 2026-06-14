import React from "react"
import { AlertTriangle, Repeat, MapPin, Clock, BookOpen } from "lucide-react"
import type { ScheduleEvent } from "@/types/schedule"
import { formatTime, parseTime } from "@/lib/schedule-utils"
import { eventVisual } from "@/lib/event-theme"
import { Tooltip } from "./tooltip"

interface EventCardProps {
  event: ScheduleEvent
  onClick?: () => void
  hasConflict?: boolean
}

function describe(event: ScheduleEvent, hasConflict: boolean): string {
  const typeLabel =
    event.type === "study"
      ? "study block"
      : event.type === "online"
        ? "online class"
        : event.type === "exam"
          ? "exam"
          : "in-person class"
  const isAsync = event.startCT === "00:00" && event.endCT === "00:00"
  const timeLabel = isAsync ? "asynchronous, no fixed time" : `${event.startCT} to ${event.endCT}`
  return `${event.title}, ${typeLabel}, ${event.day} ${timeLabel}${hasConflict ? ", has a schedule conflict" : ""}`
}

export const EventCard = React.memo(function EventCard({ event, onClick, hasConflict = false }: EventCardProps) {
  const styles = eventVisual(event.type)
  const startTime = parseTime(event.startCT)
  const endTime = parseTime(event.endCT)
  const isRecurring = !!event.recurrenceGroupId
  const hasCredits = "credits" in event && event.credits !== undefined && event.credits > 0
  const ariaLabel = describe(event, hasConflict)

  const conflictStyle = hasConflict
    ? "ring-2 ring-destructive ring-offset-1 ring-offset-background"
    : ""

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
  }

  const interactive = {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: handleKeyDown,
    "aria-label": ariaLabel,
  }

  // Async courses with 00:00 times — compact card, no time slot.
  if (event.startCT === "00:00" && event.endCT === "00:00") {
    return (
      <Tooltip event={event}>
        <div
          {...interactive}
          className={`relative overflow-hidden p-2 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-200 text-xs shadow-[var(--shadow-xs)] hover:shadow-[0_4px_14px_var(--card-glow)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${conflictStyle}`}
          style={{ background: styles.bg, borderColor: styles.border, ["--card-glow" as string]: styles.glow }}
        >
          <div className="flex items-center gap-1">
            <div className="font-semibold truncate leading-tight flex-1 text-foreground" title={event.title}>
              {event.title}
            </div>
            {isRecurring && <Repeat className="w-3 h-3 opacity-50 flex-shrink-0" aria-hidden />}
            {hasConflict && <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" aria-hidden />}
          </div>
          <div className="opacity-75 mt-1 text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden />
            Async
          </div>
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip event={event}>
      <div
        {...interactive}
        className={`relative overflow-hidden p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-200 text-xs shadow-[var(--shadow-xs)] hover:shadow-[0_6px_18px_var(--card-glow)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${conflictStyle}`}
        style={{ background: styles.bg, borderColor: styles.border, ["--card-glow" as string]: styles.glow }}
      >
        {/* Accent bar (clips to the card via relative + overflow-hidden) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ background: styles.accent }}
          aria-hidden
        />

        {/* Header with title and indicators */}
        <div className="flex items-start gap-1.5 mb-1.5 pl-2">
          <div className="font-semibold truncate leading-tight flex-1 text-foreground" title={event.title}>
            {event.title}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasCredits && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-secondary text-foreground">
                {(event as { credits: number }).credits}cr
              </span>
            )}
            {isRecurring && (
              <span title="Recurring event" aria-hidden>
                <Repeat className="w-3 h-3 opacity-50" />
              </span>
            )}
            {hasConflict && (
              <span title="Schedule conflict" aria-hidden>
                <AlertTriangle className="w-3 h-3 text-destructive animate-pulse" />
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground pl-2">
          <Clock className="w-3 h-3" aria-hidden />
          {formatTime(startTime.hour, startTime.minute)} - {formatTime(endTime.hour, endTime.minute)}
        </div>

        {/* Location */}
        {"location" in event && event.location && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 pl-2 truncate" title={event.location}>
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Study notes */}
        {event.type === "study" && "notes" in event && event.notes && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 pl-2 truncate" title={event.notes}>
            <BookOpen className="w-3 h-3 flex-shrink-0" aria-hidden />
            <span className="truncate">{event.notes}</span>
          </div>
        )}
      </div>
    </Tooltip>
  )
})
