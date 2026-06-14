import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScheduleEvent, FilterType, SemesterDates } from "@/types/schedule"
import { TimeAxis } from "./time-axis"
import { DayColumn } from "./day-column"
import { MobileDayView } from "./mobile-day-view"
import { getConflictingEventIds } from "@/lib/conflict-utils"
import { eventMatchesSearch } from "./search-filter"
import { DAYS } from "@/lib/constants"

interface WeekGridProps {
  events: ScheduleEvent[]
  activeFilter: FilterType
  searchTerm?: string
  onEventClick?: (event: ScheduleEvent) => void
  onCreateAt?: (day: string, startCT: string, endCT: string) => void
  onUpdateTime?: (eventId: string, startCT: string, endCT: string) => void
  semester?: SemesterDates | null
}

const toDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}
const addDays = (date: Date, n: number) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + n)
  return copy
}
const mondayOf = (date: Date) => {
  const dow = date.getDay() // 0 = Sun
  return addDays(date, dow === 0 ? -6 : 1 - dow)
}

interface WeekInfo {
  dates: Record<string, string>
  label: string
}

// Dates + label for the displayed semester week (shifted by weekOffset), or null if no semester.
function getWeekInfo(semester: SemesterDates | null | undefined, weekOffset: number): WeekInfo | null {
  if (!semester?.startDate) return null
  const start = toDate(semester.startDate)
  const end = semester.endDate ? toDate(semester.endDate) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let anchor = today
  if (today < start) anchor = start
  else if (end && today > end) anchor = end

  const monday = addDays(mondayOf(anchor), weekOffset * 7)
  const dates: Record<string, string> = {}
  DAYS.forEach((day, i) => {
    const date = addDays(monday, i)
    dates[day] = `${date.getMonth() + 1}/${date.getDate()}`
  })

  const startMonday = mondayOf(start)
  const weekNum = Math.round((monday.getTime() - startMonday.getTime()) / (7 * 86400000)) + 1
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const label = `Week ${weekNum} · ${fmt(monday)} – ${fmt(addDays(monday, 6))}`
  return { dates, label }
}

export const WeekGrid = React.memo(function WeekGrid({ events, activeFilter, searchTerm = "", onEventClick, onCreateAt, onUpdateTime, semester }: WeekGridProps) {
  const [weekOffset, setWeekOffset] = React.useState(0)
  // Reset to the current week whenever the semester changes.
  React.useEffect(() => {
    setWeekOffset(0)
  }, [semester?.startDate, semester?.endDate])

  const weekInfo = React.useMemo(() => getWeekInfo(semester, weekOffset), [semester, weekOffset])
  const weekDates = weekInfo?.dates ?? null

  // Compute conflicts once for the whole grid (was previously recomputed per day column).
  const conflictingIds = React.useMemo(() => getConflictingEventIds(events), [events])
  // Filter events by type filter + search term
  const filteredEvents = React.useMemo(() =>
    events.filter((event) => {
      if (!eventMatchesSearch(event, searchTerm)) return false
      if (activeFilter === "all") return true
      if (activeFilter === "study") return event.type === "study"
      if ("type" in event) {
        return event.type === activeFilter
      }
      return false
    }),
    [events, activeFilter, searchTerm]
  )

  return (
    <>
      {/* Mobile view */}
      <div className="block lg:hidden">
        <MobileDayView events={filteredEvents} conflictingIds={conflictingIds} onEventClick={onEventClick} weekDates={weekDates} />
      </div>

      <div className="hidden lg:block">
        {/* Week navigation (only when semester dates are set) */}
        {weekInfo && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset((o) => o - 1)}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-medium text-foreground min-w-[15rem] text-center tabular-nums">
              {weekInfo.label}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset((o) => o + 1)}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {weekOffset !== 0 && (
              <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
                This week
              </Button>
            )}
          </div>
        )}

        <div className="glass-card rounded-lg overflow-hidden scale-in">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-h-[600px] min-w-[800px]">
              {/* Time axis */}
              <div className="border-r border-border/50 bg-secondary/40 min-w-[80px]">
                <TimeAxis />
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
                      date={weekDates?.[day]}
                      events={dayEvents}
                      allEvents={events}
                      conflictingIds={conflictingIds}
                      onEventClick={onEventClick}
                      onCreateAt={onCreateAt}
                      onUpdateTime={onUpdateTime}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
})
