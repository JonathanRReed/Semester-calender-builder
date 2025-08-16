"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import type { ScheduleEvent } from "@/types/schedule"

interface TooltipProps {
  event: ScheduleEvent
  children: React.ReactNode
}

export function Tooltip({ event, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const updatePosition = (clientX: number, clientY: number) => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current
      const rect = tooltip.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = clientX + 10
      let y = clientY + 10

      // Adjust if tooltip would go off screen
      if (x + rect.width > viewportWidth) {
        x = clientX - rect.width - 10
      }
      if (y + rect.height > viewportHeight) {
        y = clientY - rect.height - 10
      }

      setPosition({ x, y })
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsVisible(true)
    updatePosition(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isVisible) {
      updatePosition(e.clientX, e.clientY)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const renderTooltipContent = () => {
    if (event.type === "study") {
      return (
        <div className="space-y-1">
          <div className="font-medium">{event.title}</div>
          <div className="text-sm opacity-75">Study Block</div>
          {event.notes && <div className="text-sm">{event.notes}</div>}
        </div>
      )
    }

    if ("courseCode" in event) {
      return (
        <div className="space-y-1">
          <div className="font-medium">{event.title}</div>
          <div className="text-sm opacity-75">
            {event.courseCode} - {event.section}
          </div>
          {event.location && <div className="text-sm">📍 {event.location}</div>}
          {event.instructor && <div className="text-sm">👨‍🏫 {event.instructor}</div>}
          {event.difficulty && (
            <div className="text-sm">
              Difficulty: {event.difficulty}/5 {"★".repeat(event.difficulty)}
              {"☆".repeat(5 - event.difficulty)}
            </div>
          )}
          {event.sentiment && <div className="text-sm italic">&ldquo;{event.sentiment}&rdquo;</div>}
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-tooltip pointer-events-none bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg max-w-xs"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            {renderTooltipContent()}
          </div>,
          document.body,
        )}
    </>
  )
}
