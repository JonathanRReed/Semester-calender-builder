"use client"

import React from "react"
import type { ScheduleEvent, TimeZone } from "@/types/schedule"
import { EventCard } from "./event-card"
import { getCampusStatus, convertTimeToMinutes } from "@/lib/schedule-utils"

interface DayColumnProps {
  day: string
  events: ScheduleEvent[]
  allEvents: ScheduleEvent[]
  timeZone: TimeZone
  onEventClick?: (event: ScheduleEvent) => void
}

export const DayColumn = React.memo(function DayColumn({ day, events, allEvents, timeZone, onEventClick }: DayColumnProps) {
  const campusStatus = getCampusStatus(allEvents, day)

  const positionedEvents = React.useMemo(() =>
    events
      .filter((event) => !(event.startCT === "00:00" && event.endCT === "00:00"))
      .map((event) => {
        const startMinutes = convertTimeToMinutes(event.startCT)
        const endMinutes = convertTimeToMinutes(event.endCT)

        // Grid starts at 8 AM (480 minutes)
        const gridStartMinutes = 8 * 60
        const topPosition = Math.max(0, (startMinutes - gridStartMinutes) / 30) * 32 // 32px per 30-minute slot
        const height = Math.max(32, ((endMinutes - startMinutes) / 30) * 32)

        return {
          event,
          startMinutes,
          endMinutes,
          topPosition,
          height,
        }
      })
      .sort((a, b) => a.startMinutes - b.startMinutes),
    [events]
  )

  // Detect overlaps and adjust positioning so cards never stack on top of each other
  const finalPositions = React.useMemo(() => {
    if (positionedEvents.length === 0) return []

    type PositionedItem = (typeof positionedEvents)[number] & { column?: number }

    const groups: PositionedItem[][] = []
    let currentGroup: PositionedItem[] = []
    let groupEnd = -Infinity

    positionedEvents.forEach((item) => {
      const extendedItem: PositionedItem = { ...item }

      if (currentGroup.length === 0) {
        currentGroup.push(extendedItem)
        groupEnd = extendedItem.endMinutes
        return
      }

      if (extendedItem.startMinutes < groupEnd) {
        currentGroup.push(extendedItem)
        groupEnd = Math.max(groupEnd, extendedItem.endMinutes)
      } else {
        groups.push(currentGroup)
        currentGroup = [extendedItem]
        groupEnd = extendedItem.endMinutes
      }
    })

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    const marginX = 4
    const columnGap = 6

    const laidOut: Array<{
      event: ScheduleEvent
      style: React.CSSProperties
    }> = []

    groups.forEach((group) => {
      const columns: PositionedItem[][] = []

      group.forEach((item) => {
        let placed = false

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
          const columnEvents = columns[columnIndex]
          if (!columnEvents || columnEvents.length === 0) {
            continue
          }
          const lastEventInColumn = columnEvents[columnEvents.length - 1]
          if (!lastEventInColumn) {
            continue
          }

          if (item.startMinutes >= lastEventInColumn.endMinutes) {
            columnEvents.push(item)
            item.column = columnIndex
            placed = true
            break
          }
        }

        if (!placed) {
          columns.push([item])
          item.column = columns.length - 1
        }
      })

      const columnCount = Math.max(columns.length, 1)
      const widthPercent = 100 / columnCount
      const widthAdjustment = columnCount === 1 ? marginX * 2 : (columnGap * (columnCount - 1)) / columnCount

      group.forEach((item) => {
        const columnIndex = item.column ?? 0
        const left =
          columnCount === 1
            ? `${marginX}px`
            : `calc(${widthPercent * columnIndex}% + ${columnGap * columnIndex}px + ${marginX}px)`
        const width =
          columnCount === 1
            ? `calc(100% - ${marginX * 2}px)`
            : `calc(${widthPercent}% - ${widthAdjustment + (marginX * 2) / columnCount}px)`

        laidOut.push({
          event: item.event,
          style: {
            position: "absolute",
            top: `${item.topPosition}px`,
            height: `${item.height}px`,
            left,
            width,
            zIndex: (item.column ?? 0) + 1,
          },
        })
      })
    })

    return laidOut
  }, [positionedEvents])

  // Async courses
  const asyncEvents = events.filter((event) => event.startCT === "00:00" && event.endCT === "00:00")

  const getCampusStatusColor = () => {
    return "bg-secondary/30 text-muted-foreground border-border/40"
  }

  return (
    <div className="flex flex-col min-w-0">
      {/* Day header */}
      <div className="h-16 border-b border-border/50 p-1 flex flex-col items-center justify-center bg-card/30">
        <div className="font-semibold text-xs sm:text-sm text-foreground">{day}</div>
        <div
          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded border text-center mt-1 leading-tight ${getCampusStatusColor()}`}
        >
          {campusStatus === "ON CAMPUS" ? "ON CAMPUS" : campusStatus === "campus optional" ? "optional" : "off campus"}
        </div>
      </div>

      {/* Events container */}
      <div className="relative flex-1 min-h-0 bg-secondary/20">
        {/* Time grid background */}
        {Array.from({ length: 29 }, (_, i) => (
          <div key={i} className="h-8 border-b border-border/30" />
        ))}

        {/* Positioned events */}
        {finalPositions.map(({ event, style }) => (
          <div key={event.id} style={style}>
            <EventCard event={event} timeZone={timeZone} onClick={() => onEventClick?.(event)} />
          </div>
        ))}

        {/* Async events at bottom */}
        {asyncEvents.length > 0 && (
          <div className="absolute bottom-0 left-0.5 right-0.5 space-y-1">
            {asyncEvents.map((event) => (
              <EventCard
                key={`async-${event.id}`}
                event={event}
                timeZone={timeZone}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
