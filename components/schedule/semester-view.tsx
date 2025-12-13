"use client"

import { useMemo } from "react"
import { Calendar, Coffee, GraduationCap, Clock, BookOpen } from "lucide-react"
import type { ScheduleEvent, ImportantDate } from "@/types/schedule"

interface SemesterViewProps {
    events: ScheduleEvent[]
    importantDates: ImportantDate[]
    semesterStart: string  // YYYY-MM-DD
    semesterEnd: string    // YYYY-MM-DD
    onEventClick?: (event: ScheduleEvent) => void
}

// Generate all weeks between start and end
function generateWeeks(start: string, end: string): { weekNumber: number; startDate: Date; endDate: Date }[] {
    const weeks: { weekNumber: number; startDate: Date; endDate: Date }[] = []
    const startDate = new Date(start + "T00:00:00")
    const endDate = new Date(end + "T00:00:00")

    // Find the first Monday
    let current = new Date(startDate)
    while (current.getDay() !== 1) {
        current.setDate(current.getDate() + 1)
    }

    let weekNumber = 1
    while (current <= endDate) {
        const weekStart = new Date(current)
        const weekEnd = new Date(current)
        weekEnd.setDate(weekEnd.getDate() + 6)

        weeks.push({
            weekNumber,
            startDate: weekStart,
            endDate: weekEnd > endDate ? endDate : weekEnd,
        })

        current.setDate(current.getDate() + 7)
        weekNumber++
    }

    return weeks
}

// Format date as "Jan 15"
function formatShortDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    })
}

// Check if a date or date range overlaps with a week
function doesDateOverlapWeek(importantDate: ImportantDate, weekStart: Date, weekEnd: Date): boolean {
    const start = new Date(importantDate.date + "T00:00:00")
    const end = importantDate.endDate
        ? new Date(importantDate.endDate + "T00:00:00")
        : start

    // Check if ranges overlap
    return start <= weekEnd && end >= weekStart
}

export function SemesterView({
    events,
    importantDates,
    semesterStart,
    semesterEnd,
    onEventClick,
}: SemesterViewProps) {
    const weeks = useMemo(() => generateWeeks(semesterStart, semesterEnd), [semesterStart, semesterEnd])

    // Group events by day
    const eventsByDay = useMemo(() => {
        const map = new Map<string, ScheduleEvent[]>()
        for (const event of events) {
            const existing = map.get(event.day) || []
            existing.push(event)
            map.set(event.day, existing)
        }
        return map
    }, [events])

    // Get important dates that overlap with a week
    const getDatesForWeek = (weekStart: Date, weekEnd: Date) => {
        return importantDates.filter((d) => doesDateOverlapWeek(d, weekStart, weekEnd))
    }

    // Get current week
    const currentWeekIndex = useMemo(() => {
        const now = new Date()
        return weeks.findIndex((w) => now >= w.startDate && now <= w.endDate)
    }, [weeks])

    const getDateIcon = (type: ImportantDate["type"]) => {
        switch (type) {
            case "break": return <Coffee className="w-3 h-3" />
            case "exam": return <GraduationCap className="w-3 h-3" />
            case "finals": return <BookOpen className="w-3 h-3" />
            case "deadline": return <Clock className="w-3 h-3" />
            default: return <Calendar className="w-3 h-3" />
        }
    }

    const getDateColor = (type: ImportantDate["type"]) => {
        switch (type) {
            case "break": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            case "exam": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
            case "finals": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
            case "deadline": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            default: return "bg-secondary/50 text-muted-foreground border-border/50"
        }
    }

    const getWeekStyle = (weekDates: ImportantDate[]) => {
        // Check for different event types in priority order
        const hasFinals = weekDates.some((d) => d.type === "finals")
        const hasBreak = weekDates.some((d) => d.type === "break")

        if (hasFinals) return "bg-purple-500/5 border-purple-500/20"
        if (hasBreak) return "bg-emerald-500/5 border-emerald-500/20"
        return "bg-card/50 border-border/40 hover:bg-card/70"
    }

    if (weeks.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No semester dates set</p>
                <p className="text-sm mt-1">Set your semester start and end dates to see the calendar view</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Semester summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{formatShortDate(new Date(semesterStart + "T00:00:00"))} - {formatShortDate(new Date(semesterEnd + "T00:00:00"))}</span>
                <span>{weeks.length} weeks total</span>
            </div>

            {/* Week rows */}
            <div className="space-y-2">
                {weeks.map((week, index) => {
                    const weekDates = getDatesForWeek(week.startDate, week.endDate)
                    const isCurrentWeek = index === currentWeekIndex
                    const hasBreak = weekDates.some((d) => d.type === "break")
                    const hasFinals = weekDates.some((d) => d.type === "finals")

                    return (
                        <div
                            key={week.weekNumber}
                            className={`
                p-3 rounded-lg border transition-all
                ${isCurrentWeek
                                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                                    : getWeekStyle(weekDates)
                                }
              `}
                        >
                            <div className="flex items-start gap-4">
                                {/* Week number */}
                                <div className={`
                  w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0
                  ${isCurrentWeek
                                        ? "bg-primary text-primary-foreground"
                                        : hasFinals
                                            ? "bg-purple-500/20 text-purple-700 dark:text-purple-300"
                                            : hasBreak
                                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                                : "bg-secondary/50 text-muted-foreground"
                                    }
                `}>
                                    <span className="text-[10px] uppercase font-medium">Week</span>
                                    <span className="text-xl font-bold">{week.weekNumber}</span>
                                </div>

                                {/* Week content */}
                                <div className="flex-1 min-w-0">
                                    {/* Date range */}
                                    <div className="text-xs text-muted-foreground mb-2">
                                        {formatShortDate(week.startDate)} - {formatShortDate(week.endDate)}
                                        {isCurrentWeek && (
                                            <span className="ml-2 text-primary font-medium">← You are here</span>
                                        )}
                                    </div>

                                    {/* Important dates for this week */}
                                    {weekDates.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {weekDates.map((d) => (
                                                <span
                                                    key={d.id}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${getDateColor(d.type)}`}
                                                >
                                                    {getDateIcon(d.type)}
                                                    {d.title}
                                                    {d.endDate && <span className="opacity-70">(multi-day)</span>}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Daily class summary */}
                                    <div className="flex gap-1">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => {
                                            const dayEvents = eventsByDay.get(day) || []
                                            const courseCount = dayEvents.filter((e) => e.type !== "study").length

                                            return (
                                                <div
                                                    key={day}
                                                    className={`
                            flex-1 text-center py-1.5 rounded text-[10px]
                            ${hasBreak || hasFinals
                                                            ? hasFinals
                                                                ? "bg-purple-500/10 text-purple-600/50 dark:text-purple-400/50"
                                                                : "bg-emerald-500/10 text-emerald-600/50 dark:text-emerald-400/50"
                                                            : courseCount > 0
                                                                ? "bg-primary/10 text-primary"
                                                                : "bg-secondary/30 text-muted-foreground/50"
                                                        }
                          `}
                                                    title={`${day}: ${courseCount} class${courseCount !== 1 ? "es" : ""}`}
                                                >
                                                    <div className="font-medium">{day.slice(0, 1)}</div>
                                                    {hasBreak ? (
                                                        <Coffee className="w-2.5 h-2.5 mx-auto mt-0.5" />
                                                    ) : hasFinals ? (
                                                        <BookOpen className="w-2.5 h-2.5 mx-auto mt-0.5" />
                                                    ) : courseCount > 0 ? (
                                                        <div>{courseCount}</div>
                                                    ) : (
                                                        <div className="opacity-40">-</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
