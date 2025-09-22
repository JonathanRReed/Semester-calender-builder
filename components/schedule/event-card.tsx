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
          className={`p-2 rounded-lg border-2 ${colorClasses} opacity-70 cursor-pointer hover:opacity-90 transition-all duration-300 text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg`}
          style={{
            background: `color-mix(in srgb, transparent, var(${colorVar}) 20%)`,
            borderColor: `color-mix(in srgb, transparent, var(${colorVar}) 40%)`,
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
        className={`p-2 rounded-lg border-2 ${colorClasses} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 text-xs backdrop-blur-sm transform hover:-translate-y-1`}
        style={{
          background: `color-mix(in srgb, transparent, var(${colorVar}) 20%)`,
          borderColor: `color-mix(in srgb, transparent, var(${colorVar}) 40%)`,
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
            📍 {event.location}
          </div>
        )}
        {event.type === "study" && "notes" in event && event.notes && (
          <div className="opacity-70 truncate text-[10px] leading-tight mt-1" title={event.notes}>
            📝 {event.notes}
          </div>
        )}
      </div>
    </Tooltip>
  )
})
