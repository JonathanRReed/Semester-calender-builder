"use client"

import { useMemo } from "react"
import {
    Clock,
    BookOpen,
    Calendar,
    TrendingUp,
    GraduationCap,
    Coffee,
    Laptop,
    MapPin
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ScheduleEvent, CourseEvent, ImportantDate } from "@/types/schedule"

interface StatsDashboardProps {
    events: ScheduleEvent[]
    importantDates: ImportantDate[]
    className?: string
}

// Calculate total hours from events
function calculateTotalHours(events: ScheduleEvent[]): number {
    return events.reduce((total, event) => {
        const parts = event.startCT.split(":")
        const endParts = event.endCT.split(":")
        const startH = parseInt(parts[0] || "0", 10)
        const startM = parseInt(parts[1] || "0", 10)
        const endH = parseInt(endParts[0] || "0", 10)
        const endM = parseInt(endParts[1] || "0", 10)
        const startMinutes = startH * 60 + startM
        const endMinutes = endH * 60 + endM
        return total + (endMinutes - startMinutes) / 60
    }, 0)
}

// Get busiest day
function getBusiestDay(events: ScheduleEvent[]): { day: string; count: number } | null {
    const dayCount = new Map<string, number>()

    for (const event of events) {
        dayCount.set(event.day, (dayCount.get(event.day) || 0) + 1)
    }

    let busiest: { day: string; count: number } | null = null
    for (const [day, count] of dayCount) {
        if (!busiest || count > busiest.count) {
            busiest = { day, count }
        }
    }

    return busiest
}

// Get earliest start time
function getEarliestStart(events: ScheduleEvent[]): string | null {
    if (events.length === 0) return null

    let earliest = events[0]?.startCT || "23:59"
    for (const event of events) {
        if (event.startCT < earliest) {
            earliest = event.startCT
        }
    }

    return earliest
}

// Format time for display
function formatTime(time: string): string {
    const parts = time.split(":")
    const h = parseInt(parts[0] || "0", 10)
    const m = parseInt(parts[1] || "0", 10)
    const period = h >= 12 ? "PM" : "AM"
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

export function StatsDashboard({ events, importantDates, className }: StatsDashboardProps) {
    const stats = useMemo(() => {
        const courses = events.filter(e => e.type !== "study") as CourseEvent[]
        const studyBlocks = events.filter(e => e.type === "study")
        const inPersonCourses = courses.filter(e => e.type === "inperson")
        const onlineCourses = courses.filter(e => e.type === "online")

        // Unique courses (by recurrence group or id)
        const uniqueCourseIds = new Set<string>()
        for (const course of courses) {
            uniqueCourseIds.add(course.recurrenceGroupId || course.id)
        }

        // Total credits (unique courses only)
        const seenCredits = new Set<string>()
        let totalCredits = 0
        for (const course of courses) {
            const key = course.recurrenceGroupId || course.id
            if (!seenCredits.has(key) && course.credits) {
                seenCredits.add(key)
                totalCredits += course.credits
            }
        }

        // Hours calculations
        const totalClassHours = calculateTotalHours(courses)
        const totalStudyHours = calculateTotalHours(studyBlocks)
        const totalHours = totalClassHours + totalStudyHours

        // Busiest day
        const busiest = getBusiestDay(events)

        // Earliest class
        const earliest = getEarliestStart(courses)

        // Upcoming deadlines and exams
        const now = new Date()
        const upcomingDates = importantDates
            .filter(d => new Date(d.date) >= now && (d.type === "deadline" || d.type === "exam" || d.type === "finals"))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)

        return {
            totalEvents: events.length,
            uniqueCourses: uniqueCourseIds.size,
            totalCredits,
            totalClassHours,
            totalStudyHours,
            totalHours,
            inPersonCount: inPersonCourses.length,
            onlineCount: onlineCourses.length,
            studyCount: studyBlocks.length,
            busiest,
            earliest,
            upcomingDates,
        }
    }, [events, importantDates])

    // Calculate class ratio for progress bar
    const classRatio = stats.totalHours > 0
        ? (stats.totalClassHours / stats.totalHours) * 100
        : 0

    return (
        <Card className={`${className} overflow-hidden`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Week at a Glance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main stats grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Weekly Hours */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Weekly Hours</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalHours.toFixed(1)}
                            <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
                        </div>
                        <div className="mt-2">
                            <Progress value={classRatio} className="h-1.5" />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>Classes: {stats.totalClassHours.toFixed(1)}h</span>
                                <span>Study: {stats.totalStudyHours.toFixed(1)}h</span>
                            </div>
                        </div>
                    </div>

                    {/* Credits */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Credits</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalCredits}
                            <span className="text-sm font-normal text-muted-foreground ml-1">total</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-2">
                            {stats.uniqueCourses} unique course{stats.uniqueCourses !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                {/* Event type breakdown */}
                <div className="flex gap-2">
                    <div className="flex-1 p-2 rounded-lg bg-secondary/30 text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1 text-rose-500" />
                        <div className="text-sm font-semibold">{stats.inPersonCount}</div>
                        <div className="text-[10px] text-muted-foreground">In-Person</div>
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-secondary/30 text-center">
                        <Laptop className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                        <div className="text-sm font-semibold">{stats.onlineCount}</div>
                        <div className="text-[10px] text-muted-foreground">Online</div>
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-secondary/30 text-center">
                        <BookOpen className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                        <div className="text-sm font-semibold">{stats.studyCount}</div>
                        <div className="text-[10px] text-muted-foreground">Study</div>
                    </div>
                </div>

                {/* Quick facts */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                    {stats.busiest && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Busiest day</span>
                            <span className="font-medium">{stats.busiest.day} ({stats.busiest.count} events)</span>
                        </div>
                    )}
                    {stats.earliest && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Earliest class</span>
                            <span className="font-medium">{formatTime(stats.earliest)}</span>
                        </div>
                    )}
                </div>

                {/* Upcoming deadlines */}
                {stats.upcomingDates.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Coming Up</div>
                        <div className="space-y-1.5">
                            {stats.upcomingDates.map((date) => (
                                <div
                                    key={date.id}
                                    className={`
                    flex items-center justify-between text-xs p-2 rounded-lg
                    ${date.type === "finals"
                                            ? "bg-purple-500/10 border border-purple-500/20"
                                            : date.type === "exam"
                                                ? "bg-red-500/10 border border-red-500/20"
                                                : "bg-amber-500/10 border border-amber-500/20"
                                        }
                  `}
                                >
                                    <span className="font-medium truncate">{date.title}</span>
                                    <span className="text-muted-foreground flex-shrink-0 ml-2">
                                        {new Date(date.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
