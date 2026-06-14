"use client"

import React, { useRef, useState } from "react"
import type { ScheduleEvent } from "@/types/schedule"
import { EventCard } from "./event-card"
import { getCampusStatus, convertTimeToMinutes } from "@/lib/schedule-utils"

interface DayColumnProps {
  day: string
  date?: string
  events: ScheduleEvent[]
  allEvents: ScheduleEvent[]
  conflictingIds: Set<string>
  onEventClick?: (event: ScheduleEvent) => void
  onCreateAt?: (day: string, startCT: string, endCT: string) => void
  onUpdateTime?: (eventId: string, startCT: string, endCT: string) => void
}

const pad2 = (n: number) => n.toString().padStart(2, "0")
const fromMinutes = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`

// Grid geometry (must match the positioning math below).
const SLOT_PX = 32
const SLOT_MIN = 30
const GRID_START_MIN = 8 * 60
const GRID_END_MIN = 22 * 60

type DragState = { id: string; mode: "move" | "resize"; startY: number; deltaY: number; moved: boolean }

export const DayColumn = React.memo(function DayColumn({ day, date, events, allEvents, conflictingIds, onEventClick, onCreateAt, onUpdateTime }: DayColumnProps) {
  const campusStatus = getCampusStatus(allEvents, day)

  // ---- Drag to move / resize events (vertical, snapped to 30-min slots) ----
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const justDraggedRef = useRef(false)

  const commitDrag = (eventObj: ScheduleEvent, mode: "move" | "resize", deltaY: number) => {
    const slots = Math.round(deltaY / SLOT_PX)
    if (slots === 0 || !onUpdateTime) return
    const startMin = convertTimeToMinutes(eventObj.startCT)
    const endMin = convertTimeToMinutes(eventObj.endCT)
    const duration = endMin - startMin
    if (mode === "move") {
      let ns = startMin + slots * SLOT_MIN
      ns = Math.max(GRID_START_MIN, Math.min(ns, GRID_END_MIN - duration))
      onUpdateTime(eventObj.id, fromMinutes(ns), fromMinutes(ns + duration))
    } else {
      let ne = endMin + slots * SLOT_MIN
      ne = Math.max(startMin + SLOT_MIN, Math.min(ne, GRID_END_MIN))
      onUpdateTime(eventObj.id, fromMinutes(startMin), fromMinutes(ne))
    }
  }

  const handlePointerDown = (e: React.PointerEvent, eventObj: ScheduleEvent) => {
    if (!onUpdateTime) return
    justDraggedRef.current = false // start each interaction clean (don't swallow a fresh click)
    const isHandle = (e.target as HTMLElement).dataset?.resizeHandle === "true"
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const d: DragState = { id: eventObj.id, mode: isHandle ? "resize" : "move", startY: e.clientY, deltaY: 0, moved: false }
    dragRef.current = d
    setDrag(d)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const deltaY = e.clientY - d.startY
    const next = { ...d, deltaY, moved: d.moved || Math.abs(deltaY) > 4 }
    dragRef.current = next
    setDrag(next)
  }

  const handlePointerUp = (eventObj: ScheduleEvent) => {
    const d = dragRef.current
    dragRef.current = null
    setDrag(null)
    if (d && d.id === eventObj.id && d.moved) {
      justDraggedRef.current = true
      commitDrag(eventObj, d.mode, d.deltaY)
    }
  }

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
        <div className="font-semibold text-xs sm:text-sm text-foreground">
          {day}
          {date && <span className="text-muted-foreground font-normal ml-1">{date}</span>}
        </div>
        <div
          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded border text-center mt-1 leading-tight ${getCampusStatusColor()}`}
        >
          {campusStatus === "ON CAMPUS" ? "ON CAMPUS" : campusStatus === "campus optional" ? "optional" : "off campus"}
        </div>
      </div>

      {/* Events container */}
      <div className="relative flex-1 min-h-0 bg-secondary/20">
        {/* Time grid background — click an empty slot to add an event there */}
        {Array.from({ length: 29 }, (_, i) => {
          const startMin = 8 * 60 + i * 30
          return (
            <button
              key={i}
              type="button"
              className="h-8 w-full border-b border-border/30 hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none transition-colors"
              onClick={() => onCreateAt?.(day, fromMinutes(startMin), fromMinutes(startMin + 60))}
              aria-label={`Add an event on ${day} at ${fromMinutes(startMin)}`}
              tabIndex={-1}
            />
          )
        })}

        {/* Positioned events (draggable to move; bottom edge to resize) */}
        {finalPositions.map(({ event, style }) => {
          const isDragging = drag?.id === event.id
          const baseHeight = typeof style.height === "string" ? parseInt(style.height, 10) : 0
          const dragStyle: React.CSSProperties = isDragging
            ? drag.mode === "move"
              ? { transform: `translateY(${drag.deltaY}px)`, zIndex: 50, cursor: "grabbing" }
              : { height: `${Math.max(SLOT_PX, baseHeight + drag.deltaY)}px`, zIndex: 50 }
            : {}
          return (
            <div
              key={event.id}
              style={{ ...style, ...dragStyle }}
              className={onUpdateTime ? "group/drag cursor-grab touch-none" : undefined}
              onPointerDown={onUpdateTime ? (e) => handlePointerDown(e, event) : undefined}
              onPointerMove={onUpdateTime ? handlePointerMove : undefined}
              onPointerUp={onUpdateTime ? () => handlePointerUp(event) : undefined}
              onClickCapture={(e) => {
                if (justDraggedRef.current) {
                  e.stopPropagation()
                  e.preventDefault()
                  justDraggedRef.current = false
                }
              }}
            >
              <EventCard
                event={event}
                onClick={() => onEventClick?.(event)}
                hasConflict={conflictingIds.has(event.id)}
              />
              {onUpdateTime && (
                <div
                  data-resize-handle="true"
                  className="absolute bottom-0 left-1 right-1 h-2 cursor-ns-resize rounded-b opacity-0 group-hover/drag:opacity-100 bg-foreground/20"
                  aria-hidden
                />
              )}
            </div>
          )
        })}

        {/* Async events at bottom */}
        {asyncEvents.length > 0 && (
          <div className="absolute bottom-0 left-0.5 right-0.5 space-y-1">
            {asyncEvents.map((event) => (
              <EventCard
                key={`async-${event.id}`}
                event={event}
                onClick={() => onEventClick?.(event)}
                hasConflict={conflictingIds.has(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
