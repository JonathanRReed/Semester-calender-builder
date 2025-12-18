import React from "react"
import { AlertTriangle, Repeat, MapPin, Clock, BookOpen } from "lucide-react"
import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { formatTime, parseTime } from "@/lib/schedule-utils"
import { Tooltip } from "./tooltip"

interface EventCardProps {
  event: ScheduleEvent
  timeZone: TimeZone
  onClick?: () => void
  hasConflict?: boolean
}

export const EventCard = React.memo(function EventCard({ event, timeZone, onClick, hasConflict = false }: EventCardProps) {
  const getEventStyles = (event: ScheduleEvent) => {
    if (event.type === "study") {
      return {
        bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.06) 100%)",
        border: "rgba(16, 185, 129, 0.25)",
        accent: "#10b981",
        glow: "rgba(16, 185, 129, 0.15)",
      }
    }
    switch (event.type) {
      case "inperson":
        return {
          bg: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.06) 100%)",
          border: "rgba(244, 63, 94, 0.25)",
          accent: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.15)",
        }
      case "online":
        return {
          bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)",
          border: "rgba(59, 130, 246, 0.25)",
          accent: "#3b82f6",
          glow: "rgba(59, 130, 246, 0.15)",
        }
      case "exam":
        return {
          bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)",
          border: "rgba(239, 68, 68, 0.3)",
          accent: "#ef4444",
          glow: "rgba(239, 68, 68, 0.2)",
        }
      default:
        return {
          bg: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.06) 100%)",
          border: "rgba(244, 63, 94, 0.25)",
          accent: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.15)",
        }
    }
  }

  const styles = getEventStyles(event)
  const startTime = parseTime(event.startCT)
  const endTime = parseTime(event.endCT)
  const isRecurring = !!event.recurrenceGroupId
  const hasCredits = "credits" in event && event.credits !== undefined && event.credits > 0

  // Conflict border style
  const conflictStyle = hasConflict
    ? "ring-2 ring-red-500 ring-offset-1 ring-offset-background shadow-red-500/20"
    : ""

  // Skip async courses with 00:00 times
  if (event.startCT === "00:00" && event.endCT === "00:00") {
    return (
      <Tooltip event={event}>
        <div
          className={`p-2 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-200 text-xs shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 ${conflictStyle}`}
          style={{
            background: styles.bg,
            borderColor: styles.border,
          }}
          onClick={onClick}
        >
          <div className="flex items-center gap-1">
            <div className="font-semibold truncate leading-tight flex-1 text-foreground" title={event.title}>
              {event.title}
            </div>
            {isRecurring && <Repeat className="w-3 h-3 opacity-50 flex-shrink-0" />}
            {hasConflict && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
          </div>
          <div className="opacity-75 mt-1 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Async
          </div>
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip event={event}>
      <div
        className={`p-2.5 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-200 text-xs shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 group ${conflictStyle}`}
        style={{
          background: styles.bg,
          borderColor: styles.border,
        }}
        onClick={onClick}
      >
        {/* Accent bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ background: styles.accent }}
        />

        {/* Header with title and indicators */}
        <div className="flex items-start gap-1.5 mb-1.5 pl-2">
          <div className="font-bold truncate leading-tight flex-1 text-foreground" title={event.title}>
            {event.title}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasCredits && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                style={{ background: `${styles.accent}20`, color: styles.accent }}
              >
                {(event as { credits: number }).credits}cr
              </span>
            )}
            {isRecurring && (
              <span title="Recurring event">
                <Repeat className="w-3 h-3 opacity-50" />
              </span>
            )}
            {hasConflict && (
              <span title="Schedule conflict">
                <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
              </span>
            )}
          </div>
        </div>

        {/* Time with icon */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground pl-2">
          <Clock className="w-3 h-3" />
          {formatTime(startTime.hour, startTime.minute, timeZone)} - {formatTime(endTime.hour, endTime.minute, timeZone)}
        </div>

        {/* Location */}
        {"location" in event && event.location && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 pl-2 truncate" title={event.location}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Study notes */}
        {event.type === "study" && "notes" in event && event.notes && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 pl-2 truncate" title={event.notes}>
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.notes}</span>
          </div>
        )}
      </div>
    </Tooltip>
  )
})
