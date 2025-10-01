import React from "react"
import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { formatTime, parseTime } from "@/lib/schedule-utils"
import { Tooltip } from "./tooltip"

interface EventCardProps {
  event: ScheduleEvent
  timeZone: TimeZone
  onClick?: () => void
}

export const EventCard = React.memo(function EventCard({ event, timeZone, onClick }: EventCardProps) {
  const getEventColorVar = (event: ScheduleEvent) => {
    if (event.type === "study") return "--event-study"
    if ("type" in event) {
      switch (event.type) {
        case "inperson":
          return "--event-inperson"
        case "online":
          return "--event-online"
        case "exam":
          return "--event-exam"
        default:
          return "--event-inperson"
      }
    }
    return "--event-inperson"
  }

  const getEventColorDark = () => {
    return "text-foreground"
  }

  const colorClasses = getEventColorDark()
  const colorVar = getEventColorVar(event)
  const startTime = parseTime(event.startCT)
  const endTime = parseTime(event.endCT)

  // Skip async courses with 00:00 times
  if (event.startCT === "00:00" && event.endCT === "00:00") {
    return (
      <Tooltip event={event}>
        <div
          className={`p-2 rounded-lg border ${colorClasses} opacity-80 cursor-pointer transition-transform duration-300 text-xs backdrop-blur-sm shadow-[var(--shadow-xs)] hover:opacity-95 hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5`}
          style={{
            background: `color-mix(in srgb, var(${colorVar}), transparent 82%)`,
            borderColor: `color-mix(in srgb, var(${colorVar}), transparent 55%)`,
          }}
          onClick={onClick}
        >
          <div className="font-medium truncate leading-tight" title={event.title}>
            {event.title}
          </div>
          <div className="opacity-75 mt-1 text-xs">Async</div>
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip event={event}>
      <div
        className={`p-2 rounded-lg border ${colorClasses} text-xs backdrop-blur-sm cursor-pointer transition-transform duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1`}
        style={{
          background: `color-mix(in srgb, var(${colorVar}), transparent 78%)`,
          borderColor: `color-mix(in srgb, var(${colorVar}), transparent 50%)`,
        }}
        onClick={onClick}
      >
        <div className="font-semibold truncate leading-tight mb-1" title={event.title}>
          {event.title}
        </div>
        <div className="opacity-90 text-[10px] leading-tight font-medium">
          {formatTime(startTime.hour, startTime.minute, timeZone)} -{" "}
          {formatTime(endTime.hour, endTime.minute, timeZone)}
        </div>
        {"location" in event && event.location && (
          <div className="opacity-70 truncate text-[10px] leading-tight mt-1" title={event.location}>
            Location: {event.location}
          </div>
        )}
        {event.type === "study" && "notes" in event && event.notes && (
          <div className="opacity-70 truncate text-[10px] leading-tight mt-1" title={event.notes}>
            Notes: {event.notes}
          </div>
        )}
      </div>
    </Tooltip>
  )
})
