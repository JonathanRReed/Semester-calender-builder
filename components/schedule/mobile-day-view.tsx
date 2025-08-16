"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { EventCard } from "./event-card"
import { getCampusStatus } from "@/lib/schedule-utils"
import { DAYS } from "@/lib/schedule-data"

interface MobileDayViewProps {
  events: ScheduleEvent[]
  timeZone: TimeZone
  onEventClick?: (event: ScheduleEvent) => void
}

export function MobileDayView({ events, timeZone, onEventClick }: MobileDayViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const currentDay = DAYS[currentDayIndex]
  const dayEvents = events.filter((event) => event.day === currentDay)
  const campusStatus = getCampusStatus(events, currentDay)

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % DAYS.length)
  }

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + DAYS.length) % DAYS.length)
  }

  const getCampusStatusColor = (status: string) => {
    switch (status) {
      case "ON CAMPUS":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "campus optional":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
      {/* Day navigation header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <Button variant="ghost" size="sm" onClick={prevDay} className="text-slate-400 hover:text-slate-200">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <h3 className="font-semibold text-slate-100 text-lg">{currentDay}</h3>
          <div className={`text-xs px-2 py-1 rounded border mt-1 ${getCampusStatusColor(campusStatus)}`}>
            {campusStatus === "ON CAMPUS"
              ? "ON CAMPUS"
              : campusStatus === "campus optional"
                ? "Optional"
                : "Off Campus"}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={nextDay} className="text-slate-400 hover:text-slate-200">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day dots indicator */}
      <div className="flex justify-center gap-1 py-2 border-b border-slate-700/50">
        {DAYS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDayIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentDayIndex ? "bg-blue-400" : "bg-slate-600"
            }`}
          />
        ))}
      </div>

      {/* Events list */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {dayEvents.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No events scheduled for {currentDay}</p>
          </div>
        ) : (
          dayEvents
            .sort((a, b) => a.startCT.localeCompare(b.startCT))
            .map((event) => (
              <EventCard key={event.id} event={event} timeZone={timeZone} onClick={() => onEventClick?.(event)} />
            ))
        )}
      </div>
    </div>
  )
}
