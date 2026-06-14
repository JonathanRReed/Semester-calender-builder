"use client"

import { useMemo } from "react"
import { GraduationCap, AlertTriangle } from "lucide-react"
import type { CourseEvent } from "@/types/schedule"
import { calculateTotalCredits, getCreditLoadStatus } from "@/lib/schedule-utils"

interface CreditsDisplayProps {
    courses: CourseEvent[]
    className?: string
}

export function CreditsDisplay({ courses, className }: CreditsDisplayProps) {
    const { totalCredits, loadStatus, hasCredits, missingCount } = useMemo(() => {
        const total = calculateTotalCredits(courses)
        const status = getCreditLoadStatus(total)
        // Check if any course has credits defined
        const hasCreds = courses.some(c => c.credits !== undefined && c.credits > 0)
        // Count unique courses (by code+section) that are missing credits.
        const seen = new Set<string>()
        let missing = 0
        for (const c of courses) {
            const key = `${c.courseCode}-${c.section}`
            if (seen.has(key)) continue
            seen.add(key)
            if (!(c.credits !== undefined && c.credits > 0)) missing++
        }
        return { totalCredits: total, loadStatus: status, hasCredits: hasCreds, missingCount: missing }
    }, [courses])

    // Don't show if no courses have credits defined
    if (!hasCredits) {
        return null
    }

    const getStatusColor = () => {
        switch (loadStatus) {
            case "heavy":
                return "text-amber-500"
            case "normal":
                return "text-primary"
            case "light":
                return "text-muted-foreground"
        }
    }

    const getStatusText = () => {
        switch (loadStatus) {
            case "heavy":
                return "Heavy Load"
            case "normal":
                return "Normal"
            case "light":
                return "Part-time"
        }
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/50 ${className}`}>
            <GraduationCap className={`w-4 h-4 ${getStatusColor()}`} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{totalCredits}</span>
                <span className="text-xs text-muted-foreground">credits</span>
                <span className={`text-xs font-medium ${getStatusColor()}`}>
                    ({getStatusText()})
                </span>
                {loadStatus === "heavy" && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                {missingCount > 0 && (
                    <span
                        className="text-[11px] text-amber-500"
                        title={`${missingCount} course${missingCount > 1 ? "s" : ""} have no credits set — total may be low`}
                    >
                        · {missingCount} missing
                    </span>
                )}
            </div>
        </div>
    )
}
