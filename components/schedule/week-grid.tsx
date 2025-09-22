import React from "react"
import type { ScheduleEvent, FilterType, TimeZone } from "@/types/schedule"
import { TimeAxis } from "./time-axis"
import { DayColumn } from "./day-column"
import { MobileDayView } from "./mobile-day-view"
import { DAYS } from "@/lib/constants"

interface WeekGridProps {
  events: ScheduleEvent[]
  activeFilter: FilterType
  timeZone: TimeZone
  onEventClick?: (event: ScheduleEvent) => void
}

export const WeekGrid = React.memo(function WeekGrid({ events, activeFilter, timeZone, onEventClick }: WeekGridProps) {
  // Filter events based on active filter
  const filteredEvents = React.useMemo(() =>
    events.filter((event) => {
      if (activeFilter === "all") return true
      if (activeFilter === "study") return event.type === "study"
      if ("type" in event) {
        return event.type === activeFilter
      }
      return false
    }),
    [events, activeFilter]
  )

  return (
    <>
      {/* Mobile view */}
      <div className="block lg:hidden">
        <MobileDayView events={filteredEvents} timeZone={timeZone} onEventClick={onEventClick} />
      </div>

      <div className="hidden lg:block glass-card rounded-lg overflow-hidden scale-in">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 min-h-[600px] min-w-[800px]">
            {/* Time axis */}
            <div className="border-r border-border/50 bg-secondary/40 min-w-[80px]">
              <TimeAxis timeZone={timeZone} />
            </div>

            {/* Day columns */}
            {DAYS.map((day, index) => {
              const dayEvents = filteredEvents.filter((event) => event.day === day)
              return (
                <div
                  key={day}
                  className="border-r border-border/50 last:border-r-0 min-w-[100px] hover:bg-secondary/20 transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <DayColumn
                    day={day}
                    events={dayEvents}
                    allEvents={events}
                    timeZone={timeZone}
                    onEventClick={onEventClick}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
})
