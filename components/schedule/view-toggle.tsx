"use client"

import { Calendar, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ViewMode = "week" | "semester"

interface ViewToggleProps {
    currentView: ViewMode
    onViewChange: (view: ViewMode) => void
    hasSemesterDates: boolean
    onSetupSemester?: () => void
}

export function ViewToggle({ currentView, onViewChange, hasSemesterDates, onSetupSemester }: ViewToggleProps) {
    return (
        <div className="inline-flex items-center rounded-lg border border-border/50 bg-secondary/30 p-1">
            <Button
                variant={currentView === "week" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 text-xs gap-1.5 ${currentView === "week" ? "" : "text-muted-foreground"}`}
                onClick={() => onViewChange("week")}
            >
                <CalendarDays className="w-3.5 h-3.5" />
                Week View
            </Button>

            <Button
                variant={currentView === "semester" ? "default" : "ghost"}
                size="sm"
                className={`h-8 px-3 text-xs gap-1.5 ${currentView === "semester" ? "" : "text-muted-foreground"}`}
                onClick={() => {
                    if (hasSemesterDates) {
                        onViewChange("semester")
                    } else {
                        onSetupSemester?.()
                    }
                }}
                title={!hasSemesterDates ? "Set up semester dates first" : undefined}
            >
                <Calendar className="w-3.5 h-3.5" />
                Semester View
                {!hasSemesterDates && <span className="text-[9px] opacity-60">(setup)</span>}
            </Button>
        </div>
    )
}
