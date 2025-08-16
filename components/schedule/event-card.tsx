"use client"

import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { formatTime, parseTime } from "@/lib/schedule-utils"
import { Tooltip } from "./tooltip"

interface EventCardProps {
  event: ScheduleEvent
  timeZone: TimeZone
  onClick?: () => void
}

export function EventCard({ event, timeZone, onClick }: EventCardProps) {
  const getEventColorDark = (event: ScheduleEvent) => {
    if (event.type === "study") {
      return "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-400/40 text-blue-100 hover:from-blue-500/30 hover:to-blue-600/20 hover:border-blue-400/60"
    }

    if ("type" in event) {
      switch (event.type) {
        case "inperson":
          return "bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-400/40 text-green-100 hover:from-green-500/30 hover:to-green-600/20 hover:border-green-400/60"
        case "online":
          return "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/40 text-purple-100 hover:from-purple-500/30 hover:to-purple-600/20 hover:border-purple-400/60"
        case "exam":
          return "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-400/40 text-red-100 hover:from-red-500/30 hover:to-red-600/20 hover:border-red-400/60"
        default:
          return "bg-gradient-to-br from-slate-500/20 to-slate-600/10 border-slate-400/40 text-slate-100 hover:from-slate-500/30 hover:to-slate-600/20 hover:border-slate-400/60"
      }
    }

    return "bg-gradient-to-br from-slate-500/20 to-slate-600/10 border-slate-400/40 text-slate-100 hover:from-slate-500/30 hover:to-slate-600/20 hover:border-slate-400/60"
  }

  const colorClasses = getEventColorDark(event)
  const startTime = parseTime(event.startCT)
  const endTime = parseTime(event.endCT)

  // Skip async courses with 00:00 times
  if (event.startCT === "00:00" && event.endCT === "00:00") {
    return (
      <Tooltip event={event}>
        <div
          className={`p-2 rounded-lg border-2 ${colorClasses} opacity-70 cursor-pointer hover:opacity-90 transition-all duration-300 text-xs backdrop-blur-sm hover:scale-105 hover:shadow-lg`}
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
}
