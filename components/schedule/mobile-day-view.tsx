"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { EventCard } from "./event-card"
import { getCampusStatus } from "@/lib/schedule-utils"
import { DAYS } from "@/lib/constants"

interface MobileDayViewProps {
  events: ScheduleEvent[]
  timeZone: TimeZone
  onEventClick?: (event: ScheduleEvent) => void
}

export function MobileDayView({ events, timeZone, onEventClick }: MobileDayViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const currentDay = DAYS[currentDayIndex] ?? "Mon"
  const dayEvents = events.filter((event) => event.day === currentDay)
  const campusStatus = getCampusStatus(events, currentDay)

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % DAYS.length)
  }

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + DAYS.length) % DAYS.length)
  }

  const getCampusStatusColor = () => {
    // Use neutral semantic tokens to avoid hard-coded brand colors
    return "bg-secondary/30 text-muted-foreground border-border/40"
  }

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm">
      {/* Day navigation header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Button variant="ghost" size="sm" onClick={prevDay} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <h3 className="font-semibold text-foreground text-lg">{currentDay}</h3>
          <div className={`text-xs px-2 py-1 rounded border mt-1 ${getCampusStatusColor()}`}>
            {campusStatus === "ON CAMPUS"
              ? "ON CAMPUS"
              : campusStatus === "campus optional"
                ? "Optional"
                : "Off Campus"}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={nextDay} className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day dots indicator */}
      <div className="flex justify-center gap-1 py-2 border-b border-border/50">
        {DAYS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDayIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentDayIndex ? "bg-foreground/70" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Events list */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {dayEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No events scheduled for {currentDay}</p>
          </div>
        ) : (
          dayEvents
            .sort((a, b) => a.startCT.localeCompare(b.startCT))
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                timeZone={timeZone}
                onClick={() => onEventClick?.(event)}
              />
            ))
        )}
      </div>
    </div>
  )
}
